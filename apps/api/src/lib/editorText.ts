import { newId } from '@erxes/core-db';

/** Stored editor content's blocks: a JSON array whose items each have an id and a type. */
const blocksOf = (content: string): unknown[] | false => {
  if (!content.startsWith('[')) return false;

  try {
    const value: unknown = JSON.parse(content);

    return Array.isArray(value) &&
      value.length > 0 &&
      value.every((block) => typeof block === 'object' && block && 'id' in block && 'type' in block)
      ? value
      : false;
  } catch {
    return false;
  }
};

/** The text inside a block tree in reading order; each block ends its line (erxes-ui's `editorText`). */
const textOf = (node: unknown): string => {
  if (Array.isArray(node)) return node.map(textOf).join('');

  if (typeof node !== 'object' || node === null) return '';

  if ('text' in node && typeof node.text === 'string') return node.text;

  const inner = Object.values(node).map(textOf).join('');

  return 'id' in node ? `${inner}\n` : inner;
};

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

const entity = (whole: string, name: string) => {
  const code = /^#x/i.test(name)
    ? Number.parseInt(name.slice(2), 16)
    : name.startsWith('#')
      ? Number(name.slice(1))
      : Number.NaN;

  return Number.isNaN(code) ? (ENTITIES[name.toLowerCase()] ?? whole) : String.fromCodePoint(code);
};

/** HTML (records from before the block editor) as its text, a line per paragraph. */
const htmlText = (html: string) =>
  html
    .replaceAll(/<br\s*\/?>/gi, '\n')
    .replaceAll(/<\/(p|div|li|h[1-6]|blockquote|pre|tr)>/gi, '\n')
    .replaceAll(/<[^>]*>/g, '')
    .replaceAll(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, entity);

/** Stored editor content, block JSON or HTML, as the plain text it shows: what a file holds. */
export const editorText = (content: string) => {
  const blocks = blocksOf(content);

  return (blocks ? textOf(blocks) : htmlText(content)).replaceAll(/\n{3,}/g, '\n\n').trim();
};

/**
 * A file's text as the editor stores it: block JSON, a paragraph per line, so the lines
 * survive (the editor reads other text as HTML, which joins them). Block JSON stays as it is.
 */
export const editorBlocks = (text: string) =>
  blocksOf(text)
    ? text
    : JSON.stringify(
        text.split(/\r?\n/).map((line) => ({
          id: newId(),
          type: 'paragraph',
          props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
          content: line ? [{ type: 'text', text: line, styles: {} }] : [],
          children: [],
        })),
      );
