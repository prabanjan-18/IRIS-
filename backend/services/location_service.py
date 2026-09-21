import math
import re
import urllib.parse
import httpx
from typing import List, Optional, Tuple
from config import settings
from models.schemas import HospitalItem, NearbyHospitalsResponse, HospitalResult

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points on the earth in km (Haversine formula)."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) * math.sin(dlon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class LocationService:
    def __init__(self):
        self.google_api_key = getattr(settings, "GOOGLE_MAPS_API_KEY", "")

    def _make_maps_url(self, name: str, address: str, place_id: Optional[str] = None) -> str:
        """Create a real Google Maps deep link per hospital."""
        if place_id:
            return f"https://www.google.com/maps/place/?q=place_id:{place_id}"
        query_str = urllib.parse.quote(f"{name}, {address}".strip(", "))
        return f"https://www.google.com/maps/search/?api=1&query={query_str}"

    async def geocode_location(self, location_name: str) -> Optional[Tuple[float, float, str]]:
        """Geocode a city or place name using OSM Nominatim."""
        try:
            clean_loc = location_name.strip()
            url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(clean_loc)}&format=json&limit=1"
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(url, headers={"User-Agent": "IrisHealthcare/1.0"})
                if res.status_code == 200:
                    data = res.json()
                    if data and len(data) > 0:
                        lat = float(data[0]["lat"])
                        lng = float(data[0]["lon"])
                        display = data[0].get("display_name", clean_loc)
                        return lat, lng, display
        except Exception as e:
            print(f"[LocationService] Geocoding error for '{location_name}': {e}")
        return None

    def _extract_specialty(self, text: str) -> str:
        t = text.lower()
        if any(w in t for w in ["chest pain", "heart", "cardio", "angina", "cardiac"]):
            return "Cardiology / Emergency"
        if any(w in t for w in ["fracture", "bone", "ortho", "sprain", "dislocation", "broken"]):
            return "Orthopedics / Trauma"
        if any(w in t for w in ["child", "pediatric", "kid", "baby", "infant"]):
            return "Pediatrics / Emergency"
        if any(w in t for w in ["stroke", "brain", "neuro", "seizure", "paralysis"]):
            return "Neurology / Emergency"
        if any(w in t for w in ["burn", "wound", "laceration", "bleeding", "trauma", "cut"]):
            return "Trauma & Emergency"
        if any(w in t for w in ["eye", "vision", "ophthal"]):
            return "Ophthalmology / Urgent Care"
        if any(w in t for w in ["cancer", "oncology", "tumor"]):
            return "Oncology / Cancer Care"
        if any(w in t for w in ["maternity", "pregnant", "pregnancy", "labor", "obgyn"]):
            return "Obstetrics & Gynecology"
        return "Emergency / Critical Care"

    def _extract_city_from_text(self, text: str) -> Optional[str]:
        """Extract city/area name mentioned with in/around/near."""
        match = re.search(r"\b(?:in|around|near|at)\s+([A-Za-z\s,]+?)(?:\?|\.|\!|$)", text, re.IGNORECASE)
        if match:
            candidate = match.group(1).strip()
            # Ignore pronouns and generic words
            if candidate.lower() not in ["me", "here", "my area", "us", "this area", "the area", "town"]:
                return candidate
        return None

    def _extract_hospital_name(self, text: str) -> str:
        """Extract hospital name from direct lookup queries."""
        cleaned = re.sub(
            r"^(?:where\s+is|find|locate|search\s+for|show\s+me|get\s+directions\s+to|directions\s+to|how\s+to\s+reach|location\s+of)\s+",
            "",
            text,
            flags=re.IGNORECASE
        )
        cleaned = re.sub(r"\s+(?:near\s+me|nearby|around\s+me|located|address)\s*[\?\.]*$", "", cleaned, flags=re.IGNORECASE)
        cleaned = cleaned.strip("?.! ")
        return cleaned or text.strip("?.! ")

    async def search_named_hospitals(
        self,
        hospital_name: str,
        user_lat: Optional[float] = None,
        user_lng: Optional[float] = None
    ) -> List[HospitalResult]:
        """Search for a specific named hospital (Direct Location Lookup)."""
        results: List[HospitalResult] = []

        # 1. Try Google Places Text Search if key available
        if self.google_api_key and self.google_api_key != "your_google_maps_api_key_here":
            try:
                url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
                params = {"query": f"{hospital_name} hospital", "key": self.google_api_key}
                if user_lat and user_lng:
                    params["location"] = f"{user_lat},{user_lng}"
                    params["radius"] = 30000
                async with httpx.AsyncClient(timeout=10.0) as client:
                    res = await client.get(url, params=params)
                    if res.status_code == 200:
                        data = res.json().get("results", [])
                        for p in data[:5]:
                            p_lat = p.get("geometry", {}).get("location", {}).get("lat")
                            p_lng = p.get("geometry", {}).get("location", {}).get("lng")
                            place_id = p.get("place_id")
                            dist = calculate_distance(user_lat, user_lng, p_lat, p_lng) if user_lat and user_lng and p_lat and p_lng else None
                            dist_text = f"{dist:.1f} km away" if dist is not None else None
                            p_name = p.get("name", hospital_name)
                            p_addr = p.get("formatted_address") or p.get("vicinity") or "Medical Facility"
                            results.append(HospitalResult(
                                name=p_name,
                                address=p_addr,
                                specialty="General Hospital & Emergency Care",
                                distanceText=dist_text,
                                rating=p.get("rating"),
                                lat=p_lat,
                                lng=p_lng,
                                placeId=place_id,
                                mapsUrl=self._make_maps_url(p_name, p_addr, place_id)
                            ))
                        if results:
                            return results
            except Exception as e:
                print(f"[LocationService] Google Places named search failed: {e}")

        # 2. OSM Nominatim fallback for named hospital
        try:
            url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(hospital_name)}&format=json&limit=5"
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url, headers={"User-Agent": "IrisHealthcare/1.0"})
                if res.status_code == 200:
                    items = res.json()
                    for p in items[:5]:
                        lat = float(p.get("lat", 0))
                        lng = float(p.get("lon", 0))
                        display = p.get("display_name", hospital_name)
                        parts = display.split(",")
                        name = parts[0].strip()
                        addr = ", ".join([pt.strip() for pt in parts[1:4]]) if len(parts) > 1 else display
                        dist = calculate_distance(user_lat, user_lng, lat, lng) if user_lat and user_lng and lat and lng else None
                        dist_text = f"{dist:.1f} km away" if dist is not None else None
                        results.append(HospitalResult(
                            name=name,
                            address=addr,
                            specialty="Hospital & Medical Center",
                            distanceText=dist_text,
                            lat=lat,
                            lng=lng,
                            mapsUrl=self._make_maps_url(name, addr)
                        ))
                    if results:
                        return results
        except Exception as e:
            print(f"[LocationService] Nominatim named search failed: {e}")

        # 3. Fallback direct Google Maps search link
        clean_name = hospital_name.strip()
        results.append(HospitalResult(
            name=clean_name,
            address="Medical Facility Location on Google Maps",
            specialty="Hospital / Medical Facility",
            mapsUrl=f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(clean_name + ' hospital')}"
        ))
        return results

    async def resolve_hospital_query(
        self,
        query_type: str,
        user_text: str,
        user_lat: Optional[float] = None,
        user_lng: Optional[float] = None
    ) -> Tuple[str, List[HospitalResult], str]:
        """
        Unified resolver for hospital queries.
        Returns: (specialty_label, List[HospitalResult], location_label)
        """
        city = self._extract_city_from_text(user_text)
        target_lat = user_lat
        target_lng = user_lng
        location_label = "your current location"

        if city and (target_lat is None or target_lng is None):
            geo = await self.geocode_location(city)
            if geo:
                target_lat, target_lng, display = geo
                location_label = city

        # Intent A: Direct Location Lookup
        if query_type == "direct_location":
            hosp_name = self._extract_hospital_name(user_text)
            results = await self.search_named_hospitals(hosp_name, target_lat, target_lng)
            return "Hospital Location", results, location_label

        # Intent B: Recommendation Lookup or General Location
        specialty = self._extract_specialty(user_text)

        # If a city was mentioned, search hospitals in that city first
        if city:
            city_results = await self._search_city_hospitals(city, specialty, target_lat, target_lng)
            if city_results:
                return specialty, city_results, location_label

        # If we have coordinates (from user GPS or geocoded city)
        if target_lat is not None and target_lng is not None:
            nearby_resp = await self.get_nearby_hospitals(target_lat, target_lng, radius_meters=15000)
            results: List[HospitalResult] = []
            for h in nearby_resp.hospitals[:5]:
                dist_text = f"{h.distanceKm:.1f} km away" if h.distanceKm is not None else None
                results.append(HospitalResult(
                    name=h.name,
                    address=h.address,
                    specialty=specialty if h.isEmergency else "General Medical Facility",
                    distanceText=dist_text,
                    rating=h.rating,
                    lat=h.lat,
                    lng=h.lng,
                    mapsUrl=self._make_maps_url(h.name, h.address)
                ))
            return specialty, results, location_label

        # No coordinates and no city provided
        return specialty, [], ""

    async def _search_city_hospitals(
        self,
        city: str,
        specialty: str,
        user_lat: Optional[float] = None,
        user_lng: Optional[float] = None
    ) -> List[HospitalResult]:
        """Search hospitals in a specific city via Nominatim."""
        url = "https://nominatim.openstreetmap.org/search"
        headers = {"User-Agent": "IrisApp/1.0 (healthcare-assistant; contact: support@iris.internal)"}
        params = {
            "q": f"hospitals in {city}",
            "format": "json",
            "addressdetails": 1,
            "limit": 8
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                res = await client.get(url, params=params, headers=headers)
                if res.status_code == 200:
                    items = res.json()
                    results: List[HospitalResult] = []
                    for item in items:
                        name = item.get("name")
                        if not name:
                            disp = item.get("display_name", "").split(",")[0].strip()
                            name = disp or "Hospital"
                        
                        addr = item.get("display_name", "")
                        lat = float(item["lat"]) if "lat" in item else None
                        lng = float(item["lon"]) if "lon" in item else None

                        dist_text = None
                        if lat and lng and user_lat and user_lng:
                            dist = calculate_distance(user_lat, user_lng, lat, lng)
                            dist_text = f"{dist:.1f} km away"

                        results.append(HospitalResult(
                            name=name,
                            address=addr,
                            specialty=specialty,
                            distanceText=dist_text,
                            rating=None,
                            lat=lat,
                            lng=lng,
                            mapsUrl=self._make_maps_url(name, addr)
                        ))
                    if results:
                        return results[:5]
            except Exception as e:
                print(f"[LocationService] City search failed: {e}")
        return []

    async def get_nearby_hospitals(self, lat: float, lng: float, radius_meters: int = 10000) -> NearbyHospitalsResponse:
        """Find nearby hospitals and medical clinics around given coordinates."""
        # 1. Try Google Places API if key is available
        if self.google_api_key and self.google_api_key != "your_google_maps_api_key_here":
            try:
                google_results = await self._search_google_places(lat, lng, radius_meters)
                if google_results:
                    return NearbyHospitalsResponse(
                        status="ok",
                        count=len(google_results),
                        source="google_places",
                        userLat=lat,
                        userLng=lng,
                        hospitals=google_results
                    )
            except Exception as e:
                print(f"[LocationService] Google Places search failed, falling back to OSM: {e}")

        # 2. Try OpenStreetMap Overpass API (free, live, global coverage)
        try:
            osm_results = await self._search_osm(lat, lng, radius_meters)
            if osm_results:
                return NearbyHospitalsResponse(
                    status="ok",
                    count=len(osm_results),
                    source="osm",
                    userLat=lat,
                    userLng=lng,
                    hospitals=osm_results
                )
        except Exception as e:
            print(f"[LocationService] OSM Overpass search failed: {e}")

        # 3. Fallback: Google Maps deep link representation
        fallback_hospitals = self._generate_fallback(lat, lng)
        return NearbyHospitalsResponse(
            status="ok",
            count=len(fallback_hospitals),
            source="fallback",
            userLat=lat,
            userLng=lng,
            hospitals=fallback_hospitals
        )

    async def _search_google_places(self, lat: float, lng: float, radius: int) -> List[HospitalItem]:
        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            "location": f"{lat},{lng}",
            "radius": radius,
            "type": "hospital",
            "key": self.google_api_key
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, params=params)
            if res.status_code != 200:
                return []
            data = res.json()
            results = data.get("results", [])
            
            hospitals: List[HospitalItem] = []
            for place in results[:8]:
                p_lat = place.get("geometry", {}).get("location", {}).get("lat")
                p_lng = place.get("geometry", {}).get("location", {}).get("lng")
                dist = calculate_distance(lat, lng, p_lat, p_lng) if p_lat and p_lng else None
                
                name = place.get("name", "Hospital")
                address = place.get("vicinity", "Nearby area")
                place_id = place.get("place_id")
                
                opening_hours = place.get("opening_hours", {})
                is_open = opening_hours.get("open_now")
                
                hospitals.append(HospitalItem(
                    name=name,
                    address=address,
                    distanceKm=dist,
                    rating=place.get("rating"),
                    userRatingsTotal=place.get("user_ratings_total"),
                    isOpenNow=is_open,
                    isEmergency=True if "emergency" in name.lower() or "hospital" in name.lower() else False,
                    googleMapsUrl=self._make_maps_url(name, address, place_id),
                    facilityType="Hospital" if "hospital" in name.lower() else "Medical Clinic",
                    lat=p_lat,
                    lng=p_lng
                ))
            
            hospitals.sort(key=lambda h: (h.distanceKm is None, h.distanceKm or 0))
            return hospitals

    async def _search_osm(self, lat: float, lng: float, radius: int) -> List[HospitalItem]:
        overpass_query = f"""[out:json][timeout:10];
(
  node["amenity"="hospital"](around:{radius},{lat},{lng});
  way["amenity"="hospital"](around:{radius},{lat},{lng});
  node["amenity"="clinic"](around:{radius},{lat},{lng});
  way["amenity"="clinic"](around:{radius},{lat},{lng});
);
out center 15;"""
        
        url = "https://overpass-api.de/api/interpreter"
        async with httpx.AsyncClient(timeout=12.0) as client:
            res = await client.post(url, data={"data": overpass_query})
            if res.status_code != 200:
                return []
            
            data = res.json()
            elements = data.get("elements", [])
            hospitals: List[HospitalItem] = []
            
            for elem in elements:
                tags = elem.get("tags", {})
                name = tags.get("name") or tags.get("name:en")
                if not name:
                    continue
                
                elem_lat = elem.get("lat") or (elem.get("center", {}).get("lat"))
                elem_lng = elem.get("lon") or (elem.get("center", {}).get("lon"))
                if not elem_lat or not elem_lng:
                    continue
                
                dist = calculate_distance(lat, lng, elem_lat, elem_lng)
                
                addr_parts = []
                if tags.get("addr:housenumber"):
                    addr_parts.append(tags.get("addr:housenumber"))
                if tags.get("addr:street"):
                    addr_parts.append(tags.get("addr:street"))
                if tags.get("addr:city") or tags.get("addr:suburb"):
                    addr_parts.append(tags.get("addr:city") or tags.get("addr:suburb"))
                
                address = ", ".join(addr_parts) if addr_parts else tags.get("operator", "Nearby facility")
                phone = tags.get("phone") or tags.get("contact:phone")
                emergency = tags.get("emergency") == "yes" or "hospital" in tags.get("amenity", "")
                facility_type = "Emergency Hospital" if emergency else "Medical Clinic"
                
                hospitals.append(HospitalItem(
                    name=name,
                    address=address,
                    distanceKm=dist,
                    phoneNumber=phone,
                    isEmergency=emergency,
                    googleMapsUrl=self._make_maps_url(name, address),
                    facilityType=facility_type,
                    lat=elem_lat,
                    lng=elem_lng
                ))
            
            hospitals.sort(key=lambda h: (h.distanceKm is None, h.distanceKm or 0))
            return hospitals[:6]

    def _generate_fallback(self, lat: float, lng: float) -> List[HospitalItem]:
        """Fallback with Google Maps direct navigation links centered on user's location."""
        return [
            HospitalItem(
                name="Nearest General Hospital & Emergency Care",
                address="Search immediate emergency facilities in your area",
                googleMapsUrl=f"https://www.google.com/maps/search/hospital+emergency/@{lat},{lng},14z",
                facilityType="Emergency Hospital",
                isEmergency=True,
                lat=lat,
                lng=lng
            ),
            HospitalItem(
                name="Nearest Urgent Care Center",
                address="Walk-in urgent medical clinic",
                googleMapsUrl=f"https://www.google.com/maps/search/urgent+care/@{lat},{lng},14z",
                facilityType="Urgent Care",
                isEmergency=False,
                lat=lat,
                lng=lng
            ),
            HospitalItem(
                name="Closest Medical Center & Clinics",
                address="General medical healthcare providers",
                googleMapsUrl=f"https://www.google.com/maps/search/medical+center/@{lat},{lng},14z",
                facilityType="Medical Center",
                isEmergency=False,
                lat=lat,
                lng=lng
            )
        ]

    async def search_places_nearby(
        self,
        lat: float,
        lng: float,
        query: str = "hospital",
        specialty: Optional[str] = None,
        radius: int = 5000,
        limit: int = 5,
        is_emergency: bool = False
    ) -> List[HospitalResult]:
        """
        Search for hospitals/clinics near coordinates using Google Places or OSM fallback.
        For emergency: sort by distance, use 3km initial radius, expand to 8km if < 3 results.
        For disease-specific: sort by rating DESC then distance.
        """
        results: List[HospitalResult] = []

        # Emergency uses smaller initial radius
        if is_emergency and radius == 5000:
            radius = 3000

        # 1. Try Google Places Nearby Search
        if self.google_api_key and self.google_api_key != "your_google_maps_api_key_here":
            try:
                url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
                params = {
                    "location": f"{lat},{lng}",
                    "radius": radius,
                    "type": "hospital",
                    "keyword": query,
                    "key": self.google_api_key
                }
                async with httpx.AsyncClient(timeout=10.0) as client:
                    res = await client.get(url, params=params)
                    if res.status_code == 200:
                        data = res.json().get("results", [])
                        for p in data[:limit]:
                            p_lat = p.get("geometry", {}).get("location", {}).get("lat")
                            p_lng = p.get("geometry", {}).get("location", {}).get("lng")
                            place_id = p.get("place_id")
                            dist = calculate_distance(lat, lng, p_lat, p_lng) if p_lat and p_lng else None
                            dist_text = f"{dist:.1f} km away" if dist is not None else None
                            p_name = p.get("name", "Hospital")
                            p_addr = p.get("vicinity") or p.get("formatted_address") or "Medical Facility"
                            results.append(HospitalResult(
                                name=p_name,
                                address=p_addr,
                                specialty=specialty or self._extract_specialty(query),
                                distanceText=dist_text,
                                rating=p.get("rating"),
                                lat=p_lat,
                                lng=p_lng,
                                placeId=place_id,
                                mapsUrl=self._make_maps_url(p_name, p_addr, place_id)
                            ))

                # Auto-expand for emergency if < 3 results
                if is_emergency and len(results) < 3 and radius < 8000:
                    expanded = await self.search_places_nearby(
                        lat, lng, query, specialty, radius=8000, limit=limit, is_emergency=False
                    )
                    # Merge, deduplicate by name
                    seen_names = {r.name for r in results}
                    for r in expanded:
                        if r.name not in seen_names:
                            results.append(r)
                            seen_names.add(r.name)

                if results:
                    if is_emergency:
                        # Sort by distance (closest first)
                        results.sort(key=lambda h: (h.distanceText is None, float(h.distanceText.split()[0]) if h.distanceText else 999))
                    else:
                        # Sort by rating DESC, then distance
                        results.sort(key=lambda h: (-(h.rating or 0), float(h.distanceText.split()[0]) if h.distanceText else 999))
                    return results[:limit]
            except Exception as e:
                print(f"[LocationService] Google Places nearby search failed: {e}")

        # 2. OSM Overpass fallback
        try:
            osm_results = await self._search_osm(lat, lng, radius)
            if osm_results:
                for h in osm_results[:limit]:
                    dist_text = f"{h.distanceKm:.1f} km away" if h.distanceKm is not None else None
                    results.append(HospitalResult(
                        name=h.name,
                        address=h.address,
                        specialty=specialty or self._extract_specialty(query),
                        distanceText=dist_text,
                        rating=h.rating,
                        lat=h.lat,
                        lng=h.lng,
                        mapsUrl=h.googleMapsUrl
                    ))
                if is_emergency:
                    results.sort(key=lambda h: (h.distanceText is None, float(h.distanceText.split()[0]) if h.distanceText else 999))
                else:
                    results.sort(key=lambda h: (-(h.rating or 0), float(h.distanceText.split()[0]) if h.distanceText else 999))
                return results[:limit]
        except Exception as e:
            print(f"[LocationService] OSM fallback for places nearby failed: {e}")

        # 3. Google Maps search link fallback
        search_query = urllib.parse.quote(f"{query} near me")
        results.append(HospitalResult(
            name=f"Search: {query.title()}",
            address="Open Google Maps to find facilities near you",
            specialty=specialty or "Hospital",
            mapsUrl=f"https://www.google.com/maps/search/{search_query}/@{lat},{lng},14z"
        ))
        return results

    async def search_places_by_text(
        self,
        area_text: str,
        query: str = "hospital",
        specialty: Optional[str] = None,
        limit: int = 5
    ) -> List[HospitalResult]:
        """Search hospitals by text location (city/area name) when no coordinates available."""
        results: List[HospitalResult] = []
        full_query = f"{query} in {area_text}"

        # 1. Try Google Places Text Search
        if self.google_api_key and self.google_api_key != "your_google_maps_api_key_here":
            try:
                url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
                params = {"query": full_query, "type": "hospital", "key": self.google_api_key}
                async with httpx.AsyncClient(timeout=10.0) as client:
                    res = await client.get(url, params=params)
                    if res.status_code == 200:
                        data = res.json().get("results", [])
                        for p in data[:limit]:
                            p_lat = p.get("geometry", {}).get("location", {}).get("lat")
                            p_lng = p.get("geometry", {}).get("location", {}).get("lng")
                            place_id = p.get("place_id")
                            results.append(HospitalResult(
                                name=p.get("name", "Hospital"),
                                address=p.get("formatted_address") or p.get("vicinity") or area_text,
                                specialty=specialty or self._extract_specialty(query),
                                rating=p.get("rating"),
                                lat=p_lat,
                                lng=p_lng,
                                placeId=place_id,
                                mapsUrl=self._make_maps_url(p.get("name", "Hospital"), "", place_id)
                            ))
                        if results:
                            results.sort(key=lambda h: -(h.rating or 0))
                            return results[:limit]
            except Exception as e:
                print(f"[LocationService] Google Text Search failed: {e}")

        # 2. Nominatim fallback
        try:
            geo = await self.geocode_location(area_text)
            if geo:
                lat, lng, _ = geo
                return await self.search_places_nearby(lat, lng, query, specialty, radius=10000, limit=limit)
        except Exception as e:
            print(f"[LocationService] Nominatim text fallback failed: {e}")

        # 3. Direct Maps link fallback
        encoded = urllib.parse.quote(full_query)
        results.append(HospitalResult(
            name=f"Search: {query.title()} in {area_text}",
            address="Open Google Maps to find facilities",
            specialty=specialty or "Hospital",
            mapsUrl=f"https://www.google.com/maps/search/{encoded}"
        ))
        return results

location_service = LocationService()


