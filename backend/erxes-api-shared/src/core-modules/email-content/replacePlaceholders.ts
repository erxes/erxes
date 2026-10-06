import dayjs from 'dayjs';
import _ from 'lodash';
import { blocksToHtml, escapeHtml } from './blocksToHtml';
import { TEmailFieldOutcome } from './types';

/** `{{ path }}`, or `{{ path | fallback }}` for a field with a default. */
const PLACEHOLDER = /\{\{\s*([^{}|]+?)\s*(?:\|\s*([^{}]*?)\s*)?\}\}/g;

/**
 * What a source has for a placeholder: its value; `null` when the field is
 * this source's but the record has nothing for it; `undefined` when the
 * placeholder is not this source's at all, so the next source is asked.
 */
export type TPlaceholderValue = string | null | undefined;

export type TPlaceholderResolver = (
  path: string,
) => Promise<TPlaceholderValue> | TPlaceholderValue;

export type TReplacePlaceholdersOptions = {
  /** Told once which fields had a value and which did not. */
  onFields?: (fields: TEmailFieldOutcome[]) => void;
  /**
   * Preview only. An empty field without a default shows its own name, since
   * a gap rendered silently cannot be told apart from a preview that works.
   */
  markMissing?: boolean;
};

export const collectPlaceholderPaths = (html?: string): string[] =>
  html ? [...new Set([...html.matchAll(PLACEHOLDER)].map(([, path]) => path))] : [];

/**
 * The one pass that fills an email's placeholders. Sources are asked in
 * order; a placeholder no source owns is left in place, which is what marks
 * it as never wired up.
 */
export const replacePlaceholders = async (
  html: string,
  resolvers: TPlaceholderResolver[],
  { onFields, markMissing }: TReplacePlaceholdersOptions = {},
): Promise<string> => {
  if (!html) {
    return html;
  }

  const values = new Map<string, TPlaceholderValue>();

  for (const path of collectPlaceholderPaths(html)) {
    let value: TPlaceholderValue;

    for (const resolve of resolvers) {
      value = await resolve(path);

      if (value !== undefined) {
        break;
      }
    }

    values.set(path, value === '' ? null : value);
  }

  onFields?.(
    [...values]
      .filter(([, value]) => value !== undefined)
      .map(([id, value]) => ({ id, filled: !!value })),
  );

  return html.replace(PLACEHOLDER, (placeholder, path: string, fallback) => {
    const value = values.get(path);

    if (value) {
      return value;
    }

    if (fallback) {
      return fallback;
    }

    if (value === null) {
      return markMissing ? `‹${path}›` : '';
    }

    return placeholder;
  });
};

/** Owns every placeholder: a field of the record the email is written to. */
export const recordPlaceholderResolver =
  (record: object = {}): TPlaceholderResolver =>
  (path) => {
    const value = _.get(record, path);

    if (value === undefined || value === null || value === '') {
      return null;
    }

    if (value instanceof Date) {
      return dayjs(value).format('YYYY-MM-DD');
    }

    return escapeHtml(String(value));
  };

const DOCUMENT_PREFIX = 'document.';

const bodyHtml = (html: string) =>
  html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]?.trim() || html;

/**
 * Owns `document.<id>`: the document rendered for the record the email is
 * written to. Each service reaches documents its own way, so it supplies both
 * the per-record print and the raw content used when printing gives nothing.
 */
export const documentPlaceholderResolver =
  ({
    print,
    findContent,
  }: {
    print: (documentId: string) => Promise<string | undefined | null>;
    findContent: (documentId: string) => Promise<string | undefined | null>;
  }): TPlaceholderResolver =>
  async (path) => {
    if (!path.startsWith(DOCUMENT_PREFIX)) {
      return undefined;
    }

    const documentId = path.slice(DOCUMENT_PREFIX.length);
    let html = '';

    try {
      html = bodyHtml(String((await print(documentId)) || ''));
    } catch {
      // A document that cannot be printed for this record still has a body,
      // so the email keeps it rather than losing the section entirely.
    }

    if (!html) {
      html = blocksToHtml((await findContent(documentId)) || '');
    }

    return html || null;
  };
