/**
 * Service Integration Point: sendMessageToBackend
 * 
 * ====================================================================
 * // TODO: CONNECT TO RAG + OPENROUTER BACKEND HERE
 * ====================================================================
 * Replace this stub function with your actual backend service call.
 * Expected API response structure:
 * {
 *   id: string,
 *   sender: "assistant",
 *   timestamp: string,
 *   structuredData: {
 *     triageLevel: "self" | "caution" | "urgent",
 *     triageLabel: string,
 *     summary: string,
 *     causes: string[],
 *     selfCare: string[],
 *     whenToSeekCare: string[],
 *     sources: Array<{ title: string, url: string, snippet: string }>
 *   }
 * }
 */

export const DEFAULT_FREE_MODELS = [
  { id: "openrouter/free", name: "Auto Router (Recommended)", isFree: true },
  { id: "minimax/minimax-m3:free", name: "MiniMax M3", isFree: true },
  { id: "nvidia/nemotron-3.5-lightning:free", name: "Nemotron 3.5 Lightning", isFree: true },
  { id: "nvidia/nemotron-3-super-120b-a12b:free", name: "Nemotron 3 Super 120B", isFree: true },
  { id: "liquid/lfm-2.5-2.6b:free", name: "LFM 2.5 2.6B", isFree: true },
  { id: "google/gemma-4-31b-it:free", name: "Gemma 4 31B IT", isFree: true },
  { id: "google/gemma-4-26b-a4b-it:free", name: "Gemma 4 26B A4B IT", isFree: true },
  { id: "z-ai/glm-5.2:free", name: "GLM 5.2", isFree: true },
  { id: "minimax/minimax-m2.7:free", name: "MiniMax M2.7", isFree: true },
  { id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", name: "Nemotron 3 Nano Omni", isFree: true },
  { id: "inclusionai/ling-3.0-flash-fin:free", name: "Ling 3.0 Flash Fin", isFree: true },
  { id: "inclusionai/ling-3.0-flash-vl:free", name: "Ling 3.0 Flash Vision (Multimodal)", isFree: true },
  { id: "dots-studio/dots-3-note-preview:free", name: "Dots 3 Note Preview", isFree: true }
];

export const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

export async function fetchAvailableModels() {
  const BACKEND_MODELS_URL = `${API_BASE_URL}/api/models`;
  try {
    const response = await fetch(BACKEND_MODELS_URL);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn("[Backend API] Unable to fetch models list from backend, using default models.", err);
  }
  return DEFAULT_FREE_MODELS;
}

export async function parseDocumentFile(file) {
  const PARSE_URL = `${API_BASE_URL}/api/documents/parse`;
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(PARSE_URL, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({ detail: 'Failed to parse document' }));
    throw new Error(errJson.detail || `Server returned ${response.status}`);
  }

  return await response.json();
}

export async function sendMessageToBackend(
  userMessageText,
  conversationHistory = [],
  isClinicalMode = false,
  selectedModel = null,
  sessionId = "iris-default-session",
  userLocation = null,
  document = null,
  image = null
) {
  const BACKEND_URL = `${API_BASE_URL}/api/chat`;

  try {
    const formattedHistory = Array.isArray(conversationHistory) 
      ? conversationHistory.map(item => ({
          role: item.sender === "user" ? "user" : "assistant",
          content: item.text || (item.structuredData ? item.structuredData.summary : "")
        }))
      : [];

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userMessageText: userMessageText,
        conversationHistory: formattedHistory,
        isClinicalMode: isClinicalMode,
        sessionId: sessionId || "iris-default-session",
        model: selectedModel || undefined,
        userLocation: userLocation || undefined,
        document: document || undefined,
        image: image || undefined
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    console.warn(`[Backend API] Server returned status ${response.status}. Using client fallback.`);
  } catch (err) {
    console.warn("[Backend API] Unable to connect to FastAPI backend server.", err);
  }

  // If backend is unreachable, show a clear error with active endpoint info
  return {
    id: `msg-${Date.now()}`,
    sender: "assistant",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    responseType: "medical",
    structuredData: {
      triageLevel: "self",
      triageLabel: "Backend Server Unreachable",
      summary: `Could not connect to the IRIS backend server at ${API_BASE_URL}. If your backend is hosted on Render's free tier, it may take 30-50 seconds to wake up from idle. Please verify that VITE_BACKEND_URL is properly configured in Vercel.`,
      causes: [
        `Backend service at ${API_BASE_URL} is currently unreachable`,
        "Render free tier instance is spinning up from sleep (cold start)",
        "VITE_BACKEND_URL may not match the deployed Render service URL"
      ],
      selfCare: [
        "Wait 30 seconds for the Render backend to wake up and try again",
        `Verify the backend health status directly at ${API_BASE_URL}/api/health`,
        "If testing locally, ensure backend is running via: cd backend && python main.py"
      ],
      whenToSeekCare: [],
      sources: [
        {
          title: "IRIS Backend Health Endpoint",
          url: `${API_BASE_URL}/api/health`,
          snippet: "Check backend health, model configurations, and memory status."
        }
      ]
    },
    modelUsed: "offline"
  };
}
