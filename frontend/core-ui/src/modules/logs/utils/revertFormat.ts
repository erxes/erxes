/**
 * Plain-language formatters shared by the revert/undo UI so non-technical users
 * never see raw DB field names, ObjectIds, or JSON. Pure functions only.
 */

/** Stable key for a conflicting record (contentType + id). */
export const conflictKey = (c: { contentType: string; docId: string }) =>
  `${c.contentType}::${c.docId}`;

/** Turn a stored value into something a non-technical person can read. */
export const formatValue = (v: unknown): string => {
  if (v === undefined || v === null || v === '') return '(empty)';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) {
    if (v.length === 0) return '(nothing)';
    const allSimple = v.every((x) =>
      ['string', 'number', 'boolean'].includes(typeof x),
    );
    if (allSimple) {
      const shown = v.slice(0, 4).join(', ');
      return v.length > 4 ? `${shown} +${v.length - 4} more` : shown;
    }
    return `${v.length} item${v.length === 1 ? '' : 's'}`;
  }
  if (typeof v === 'object') {
    try {
      const json = JSON.stringify(v);
      return json.length > 80 ? `${json.slice(0, 77)}…` : json;
    } catch {
      return '(details)';
    }
  }
  return String(v);
};

/** "deals" / "auto:tags.tags" → "Deals" / "Tags" — a plain noun. */
export const entityNoun = (contentType?: string): string => {
  if (!contentType) return 'Record';
  const seg = contentType.split(':')[1] || contentType;
  const word = seg.split('.').pop() || seg;
  return word.charAt(0).toUpperCase() + word.slice(1);
};

/** camelCase / dotted DB field → readable label. `relatedIntegrationIds` → "Related integration IDs". */
export const humanizeField = (field: string): string => {
  const last = field.split('.').pop() || field;
  const spaced = last
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
  if (!spaced) return field;
  const tidy = spaced.replace(/\bids\b/gi, 'IDs').replace(/\bid\b/gi, 'ID');
  return tidy.charAt(0).toUpperCase() + tidy.slice(1);
};

/** Short, copy-safe id shown only as a quiet reference. */
export const shortId = (id?: string) => {
  if (!id) return '';
  return id.length > 12 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;
};

/** Plain-language label for what undoing each item actually does. */
const KIND_INFO: Record<
  string,
  { label: string; variant: 'success' | 'destructive' | 'secondary' }
> = {
  insert: { label: 'Bring back', variant: 'success' },
  delete: { label: 'Remove', variant: 'destructive' },
  update: { label: 'Change back', variant: 'secondary' },
};

/** Resolve the plain-language label + badge variant for an op kind. */
export const kindInfo = (k: string) =>
  KIND_INFO[k] || { label: k, variant: 'secondary' as const };
