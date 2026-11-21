import { type Broadcast, EMAIL_MARK_TYPES, EMAIL_NODE_TYPES } from '@erxes/core-contract';

/** A node of the email editor's document, as core stores it. */
export type EmailNode = NonNullable<Broadcast['content']>;

const NODES = new Set<string>(EMAIL_NODE_TYPES);
const MARKS = new Set<string>(EMAIL_MARK_TYPES);

/** Nodes that show something by themselves, without any text. */
const SHOWN = new Set(['variable', 'image', 'inlineImage', 'button', 'horizontalRule', 'linkCard']);

/** Whether the document holds anything to send: text, a field, a picture, a button … */
export const hasEmailContent = (node: EmailNode | null): boolean =>
  node !== null &&
  (SHOWN.has(node.type) ||
    Boolean(node.text?.trim()) ||
    (node.content ?? []).some((child) => hasEmailContent(child)));

/** A picture still uploading: its address is the browser's own. */
const isUploading = ({ attrs }: EmailNode) =>
  typeof attrs?.src === 'string' && /^(blob|data):/.test(attrs.src);

/** A field's fallback as core reads it: no `{ } |`, up to 100 characters. */
const cleanFallback = (value: unknown) =>
  typeof value === 'string' ? value.replaceAll(/[{}|]/g, '').trim().slice(0, 100) || null : null;

/** Attributes without a per-recipient rule, which core doesn't send. */
const cleanAttrs = (type: string, attrs: Record<string, unknown>) => {
  const kept = Object.fromEntries(
    Object.entries(attrs).filter(([key]) => key !== 'visibilityRule'),
  );

  return type === 'variable' ? { ...kept, fallback: cleanFallback(kept.fallback) } : kept;
};

const cleanNode = (node: EmailNode): EmailNode | null => {
  if (!NODES.has(node.type) || isUploading(node)) return null;

  const content = node.content?.flatMap((child) => cleanNode(child) ?? []);
  const marks = node.marks?.filter((mark) => MARKS.has(mark.type));

  return {
    ...node,
    ...(node.attrs && { attrs: cleanAttrs(node.type, node.attrs) }),
    ...(content && { content }),
    ...(marks && { marks }),
  };
};

/**
 * The editor's document as core takes it: only the nodes and marks an email may hold,
 * no visibility rules, and no picture that is still uploading.
 */
export const toEmailDocument = (node: EmailNode | null) => (node ? cleanNode(node) : null);

/** JSON with each object's keys in order, so documents compare whatever order they were built in. */
const canonical = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonical);

  if (value === null || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value)
      .toSorted(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => [key, canonical(child)]),
  );
};

/** Whether two documents say the same, ignoring key order (Postgres reorders a stored document). */
export const sameDocument = (a: EmailNode | null, b: EmailNode | null) =>
  JSON.stringify(canonical(toEmailDocument(a))) === JSON.stringify(canonical(toEmailDocument(b)));
