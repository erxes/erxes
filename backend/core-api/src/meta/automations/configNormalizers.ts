/**
 * The email editors keep a variable as a field node, not as `{{ }}` text, and
 * show only the node as a field. A body written outside the builder (the
 * assistant, an import) gets its text variables turned into those nodes, the
 * way the editors do it on paste; a run reads both forms alike.
 */

type TRecord = Record<string, unknown>;

const PLACEHOLDER = /\{\{\s*([^{}]+?)\s*\}\}/g;

// Code stays as written, and a link holds plain text only.
const VERBATIM_PARENTS = ['codeBlock', 'htmlCodeBlock', 'link'];

const isRecord = (value: unknown): value is TRecord =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const splitText = (
  node: TRecord,
  toField: (path: string) => TRecord,
): TRecord[] => {
  const text = typeof node.text === 'string' ? node.text : '';
  const parts: TRecord[] = [];
  let last = 0;

  for (const match of text.matchAll(PLACEHOLDER)) {
    const start = match.index ?? 0;

    if (start > last) {
      parts.push({ ...node, text: text.slice(last, start) });
    }

    parts.push(toField(match[1].trim()));
    last = start + match[0].length;
  }

  if (!parts.length) {
    return [node];
  }

  if (last < text.length) {
    parts.push({ ...node, text: text.slice(last) });
  }

  return parts;
};

const withFields = (
  value: unknown,
  toField: (path: string) => TRecord,
  verbatim = false,
): unknown => {
  if (Array.isArray(value)) {
    return value.flatMap((item) =>
      !verbatim && isRecord(item) && item.type === 'text'
        ? splitText(item, toField)
        : [withFields(item, toField, verbatim)],
    );
  }

  if (!isRecord(value)) {
    return value;
  }

  const insideCode = verbatim || VERBATIM_PARENTS.includes(String(value.type));

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      withFields(entry, toField, insideCode),
    ]),
  );
};

// What the block editor's field chip stores.
const blockField = (path: string) => ({
  type: 'attribute',
  props: { name: path, value: path, width: 150, height: 50 },
});

// What the email editor stores for a field.
const mailyField = (path: string) => ({
  type: 'variable',
  attrs: { id: `{{ ${path} }}`, fallback: null, required: false },
});

const blocksWithFields = (content: string) => {
  try {
    const blocks: unknown = JSON.parse(content);

    return Array.isArray(blocks)
      ? JSON.stringify(withFields(blocks, blockField))
      : content;
  } catch {
    return content;
  }
};

export const normalizeSendEmailConfig = (config: unknown): unknown => {
  if (!isRecord(config)) {
    return config;
  }

  if (config.contentFormat === 'blocks' && typeof config.content === 'string') {
    return { ...config, content: blocksWithFields(config.content) };
  }

  if (config.contentFormat === 'maily' && isRecord(config.contentJson)) {
    return {
      ...config,
      contentJson: withFields(config.contentJson, mailyField),
    };
  }

  return config;
};
