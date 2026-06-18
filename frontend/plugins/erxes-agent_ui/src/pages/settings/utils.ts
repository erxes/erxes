// Serialize a { name: value } header map into editable `Name: value` lines.
export const serializeHeaders = (h?: Record<string, string> | null): string =>
  h
    ? Object.entries(h)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n')
    : '';

// Parse `Name: value` lines back into a header map (blank lines ignored).
export const parseHeaders = (text: string): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const line of (text || '').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf(':');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (key) out[key] = val;
  }
  return out;
};
