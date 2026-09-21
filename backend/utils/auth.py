from typing import Optional, Dict, Any
from fastapi import Header, HTTPException
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import httpx
from config import settings
from models.schemas import GoogleUser

def verify_google_id_token(token: str) -> Dict[str, Any]:
    """Verify a Google OAuth ID token using google-auth library with fallback to tokeninfo endpoint."""
    if not token or not token.strip():
        raise ValueError("Token cannot be empty")

    client_id = settings.GOOGLE_CLIENT_ID.strip() if settings.GOOGLE_CLIENT_ID else None
    if client_id == "your_google_oauth_client_id_here":
        client_id = None

    try:
        req = google_requests.Request()
        id_info = id_token.verify_oauth2_token(token, req, audience=client_id)
        return {
            "googleId": id_info.get("sub", ""),
            "email": id_info.get("email", ""),
            "name": id_info.get("name") or (id_info.get("email", "").split("@")[0] if id_info.get("email") else "User"),
            "picture": id_info.get("picture")
        }
    except Exception as e:
        # Fallback to Google OAuth2 tokeninfo HTTP endpoint
        try:
            with httpx.Client(timeout=10.0) as http_client:
                resp = http_client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={token}")
                if resp.status_code == 200:
                    data = resp.json()
                    if client_id and data.get("aud") != client_id:
                        raise ValueError("Token audience mismatch")
                    return {
                        "googleId": data.get("sub", ""),
                        "email": data.get("email", ""),
                        "name": data.get("name") or (data.get("email", "").split("@")[0] if data.get("email") else "User"),
                        "picture": data.get("picture")
                    }
        except Exception:
            pass
        raise ValueError(f"Invalid or expired Google token: {str(e)}")

async def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[GoogleUser]:
    """Extract and verify user from Authorization header if present."""
    if not authorization:
        return None
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")
    token = authorization.split("Bearer ")[1].strip()
    try:
        user_dict = verify_google_id_token(token)
        return GoogleUser(**user_dict)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

async def require_current_user(authorization: Optional[str] = Header(None)) -> GoogleUser:
    """Enforce Google authentication on protected routes."""
    if not authorization:
        # If no client ID configured yet in dev, allow non-blocking usage or enforce
        if not settings.GOOGLE_CLIENT_ID or settings.GOOGLE_CLIENT_ID == "your_google_oauth_client_id_here":
            return GoogleUser(googleId="dev-guest", email="guest@iris.local", name="Guest User", picture=None)
        raise HTTPException(status_code=401, detail="Authentication token required. Please sign in.")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")
    token = authorization.split("Bearer ")[1].strip()
    try:
        user_dict = verify_google_id_token(token)
        return GoogleUser(**user_dict)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
