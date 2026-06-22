// Split streaming markdown into completed blocks + the in-progress trailing
// block. Blocks are delimited by blank lines, except inside a fenced code block
// (where blank lines are content). The caller freezes the completed blocks so
// finished text never reflows as more tokens arrive, and only re-renders the
// trailing block. Heuristic by design: it only governs the transient streaming
// view; the settled message is rendered from the whole string, so any imperfect
// split (e.g. a loose list momentarily breaking) resolves on completion.
export const splitStreamingMarkdown = (
  content: string,
): { blocks: string[]; tail: string } => {
  const lines = content.split('\n');
  const blocks: string[] = [];
  let current: string[] = [];
  let fence: string | null = null;

  for (const line of lines) {
    const marker = /^\s*(```+|~~~+)/.exec(line)?.[1];
    if (marker) {
      if (fence === null) fence = marker[0];
      else if (line.trim().startsWith(fence)) fence = null;
    }
    if (fence === null && line.trim() === '') {
      if (current.length) {
        blocks.push(current.join('\n'));
        current = [];
      }
      continue;
    }
    current.push(line);
  }

  return { blocks, tail: current.join('\n') };
};

export const formatJson = (value: unknown): string => {
  if (value === undefined) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};
