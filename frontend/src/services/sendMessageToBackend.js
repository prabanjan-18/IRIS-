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
  { id: "dots-studio/dots-3-note-preview:free", name: "Dots 3 Note Preview", isFree: true }
];

export async function fetchAvailableModels() {
  const BACKEND_MODELS_URL = "http://127.0.0.1:8000/api/models";
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

export async function sendMessageToBackend(userMessageText, conversationHistory = [], isClinicalMode = false, selectedModel = null, sessionId = "iris-default-session") {
  const BACKEND_URL = "http://127.0.0.1:8000/api/chat";

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
        model: selectedModel || undefined
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

  // If backend is unreachable, show a clear error — never fake medical data
  return {
    id: `msg-${Date.now()}`,
    sender: "assistant",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    structuredData: {
      triageLevel: "self",
      triageLabel: "Backend Server Unreachable",
      summary: `Could not connect to the IRIS backend server at http://127.0.0.1:8000. Please ensure the FastAPI backend is running (cd backend && python main.py) and try again.`,
      causes: [
        "Backend server is not running on port 8000",
        "Network connectivity issue between frontend and backend",
        "Backend server may have crashed or is restarting"
      ],
      selfCare: [
        "Open a terminal in c:\\IRIS\\backend and run: python main.py",
        "Verify the server is listening at http://127.0.0.1:8000/api/health",
        "Then retry your message"
      ],
      whenToSeekCare: [],
      sources: [
        {
          title: "IRIS Backend Server",
          url: "http://127.0.0.1:8000/api/health",
          snippet: "Check if the FastAPI backend is running and healthy."
        }
      ]
    },
    modelUsed: "offline"
  };
}
