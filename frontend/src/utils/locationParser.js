/**
 * Parses location-dependent intent markers from assistant response text.
 * 
 * Supports:
 * <!--location:emergency query: emergency hospital -->
 * <!--location:hospital query: cardiology hospital specialty: Cardiology disease: heart disease -->
 */

/**
 * Strips all <!--location:...--> markers from text without full parsing.
 * @param {string} text
 * @returns {string}
 */
export function stripLocationMarkers(text) {
  if (!text || typeof text !== 'string') return text || '';
  return text.replace(/<!--location:(?:emergency|hospital)[\s\S]*?-->/gi, '').trim();
}

/**
 * Extracts key-value parameter pairs from inside a location marker.
 * Example: "query: cardiology hospital specialty: Cardiology disease: heart failure"
 * @param {string} attrString 
 * @returns {Record<string, string>}
 */
function parseAttributes(attrString) {
  const attrs = {};
  if (!attrString) return attrs;

  // Match key: value patterns up to the next key or end of string
  const regex = /(query|specialty|disease):\s*([^:]+?)(?=(?:\s+(?:query|specialty|disease):|$))/gi;
  let match;
  while ((match = regex.exec(attrString)) !== null) {
    const key = match[1].toLowerCase().trim();
    const val = match[2].replace(/-->/g, '').trim().replace(/^["']|["']$/g, '');
    attrs[key] = val;
  }
  return attrs;
}

/**
 * Parses location intent from assistant response text.
 * @param {string} rawText
 * @returns {{ locationIntent: { type: 'emergency'|'hospital', query: string, specialty?: string, disease?: string, isEmergency: boolean } | null, cleanText: string }}
 */
export function parseLocationFromText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { locationIntent: null, cleanText: rawText || '' };
  }

  // Regex matches <!--location:(emergency|hospital) [attributes] -->
  const regex = /<!--location:(emergency|hospital)([\s\S]*?)-->/i;
  const match = rawText.match(regex);

  if (match) {
    const type = match[1].toLowerCase();
    const isEmergency = type === 'emergency';
    const attrString = match[2] || '';
    const attrs = parseAttributes(attrString);

    const query = attrs.query || (isEmergency ? 'emergency hospital' : 'hospital');
    const specialty = attrs.specialty || (isEmergency ? 'Emergency & Trauma' : null);
    const disease = attrs.disease || null;

    const cleanText = rawText.replace(regex, '').trim();

    return {
      locationIntent: {
        type,
        isEmergency,
        query,
        specialty,
        disease
      },
      cleanText
    };
  }

  return { locationIntent: null, cleanText: rawText };
}

export default parseLocationFromText;
