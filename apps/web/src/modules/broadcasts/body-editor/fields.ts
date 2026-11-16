import { BROADCAST_PLACEHOLDERS, type BroadcastPlaceholder } from '@erxes/core-contract';

/** `{{ firstName }}` or `{{ firstName | there }}`, as core's renderer reads them. */
const PLACEHOLDER = /\{\{\s*([A-Za-z]+)\s*(?:\|([^}]*))?\}\}/g;

/** Inline code, which shows its text as is. */
const CODE_SPAN = /(`+)[\s\S]*?\1/g;

const isPlaceholder = (name: string): name is BroadcastPlaceholder =>
  (BROADCAST_PLACEHOLDERS as readonly string[]).includes(name);

/** The text a field stands for in the stored Markdown. */
export const fieldToken = (name: string, fallback = '') =>
  fallback.trim() ? `{{ ${name} | ${fallback.trim()} }}` : `{{ ${name} }}`;

const attribute = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

const toSpans = (text: string) =>
  text.replace(PLACEHOLDER, (token: string, name: string, fallback: string | undefined) =>
    isPlaceholder(name)
      ? `<span data-field="${name}" data-fallback="${attribute(fallback?.trim() ?? '')}"></span>`
      : token,
  );

/**
 * Markdown with each `{{ field }}` as the `<span data-field>` the editor reads
 * as a chip. Names erxes can't fill and inline code stay as written, so the
 * form's warning about unknown names still shows.
 */
export const withFieldSpans = (markdown: string) => {
  let out = '';
  let last = 0;

  for (const match of markdown.matchAll(CODE_SPAN)) {
    out += toSpans(markdown.slice(last, match.index)) + match[0];
    last = match.index + match[0].length;
  }

  return out + toSpans(markdown.slice(last));
};
