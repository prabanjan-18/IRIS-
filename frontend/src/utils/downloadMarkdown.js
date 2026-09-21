/**
 * Client-side raw Markdown download utility.
 * Prompts the user with the native OS "Save As" dialog (File System Access API)
 * to choose the exact path and filename on their local computer.
 * Falls back to standard browser download if showSaveFilePicker is not supported.
 */
export async function downloadMarkdown(title, markdownString) {
  if (!markdownString) return;

  const safeTitle = (title || 'Iris_Medical_Report')
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  const filename = `${safeTitle}_Iris.md`;
  const blob = new Blob([markdownString], { type: 'text/markdown;charset=utf-8;' });

  // 1. Modern File System Access API: Asks the user to choose local save directory & file path
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: 'Markdown Document (*.md)',
            accept: {
              'text/markdown': ['.md'],
              'text/plain': ['.txt', '.md']
            }
          }
        ]
      });

      const writableStream = await handle.createWritable();
      await writableStream.write(blob);
      await writableStream.close();
      return true;
    } catch (err) {
      // If user deliberately cancelled the save dialog, exit gracefully
      if (err.name === 'AbortError') {
        return false;
      }
      console.warn('showSaveFilePicker failed, falling back to anchor download:', err);
    }
  }

  // 2. Fallback: Browser default anchor tag download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

export default downloadMarkdown;
