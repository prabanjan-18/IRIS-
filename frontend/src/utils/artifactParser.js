/**
 * Parses artifact blocks from assistant response text.
 * 
 * Supports:
 * <!--artifact:report title: Diabetes Symptoms Overview -->
 * ... Markdown content ...
 * <!--artifact:end-->
 * 
 * Or type: table | pdf | report
 */
export function parseArtifactFromText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { artifact: null, cleanText: rawText || '' };
  }

  // Regex matches <!--artifact:TYPE [optional title: ...] --> CONTENT <!--artifact:end-->
  // Case-insensitive, dotAll (s flag equivalent)
  const regex = /<!--artifact:(report|table|pdf)(?:[\s\S]*?title:\s*([^\n\r>]+))?(?:[\s\S]*?)-->([\s\S]*?)<!--artifact:end-->/i;
  const match = rawText.match(regex);

  if (match) {
    const type = match[1].toLowerCase();
    const rawTitle = (match[2] || '').trim();
    const markdown = (match[3] || '').trim();

    // Clean title fallback and remove quotes/tags
    let title = rawTitle.replace(/^["']|["']$/g, '').trim();
    if (!title) {
      if (type === 'table') title = 'Clinical Data Table';
      else if (type === 'pdf') title = 'Medical Summary Document';
      else title = 'Medical Health Report';
    }

    // Clean title from any trailing comment markers
    title = title.replace(/-->/g, '').trim();

    const cleanText = rawText.replace(regex, '').trim();

    return {
      artifact: {
        id: `art-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type,
        title,
        markdown,
        createdAt: new Date().toISOString()
      },
      cleanText
    };
  }

  return { artifact: null, cleanText: rawText };
}

export default parseArtifactFromText;
