import type { FieldInfo } from './useAutomationFields';

const PLACEHOLDER = /\{\{\s*([^{}|]+?)\s*(\|[^{}]*)?\}\}/g;

const ADD_DAYS = /\|\s*add_days:\s*(-?\d+)/;

/** `{{now | add_days: 7}}` reads "7 days after it runs". */
const nowText = (filters = '') => {
  const days = Number(ADD_DAYS.exec(filters)?.[1] ?? 0);

  if (days === 0) return "Today's date";

  const count = Math.abs(days);

  return `${count} ${count === 1 ? 'day' : 'days'} ${days > 0 ? 'after' : 'before'} it runs`;
};

/** What a placeholder's path and filters read as ("First name", "Today's date"), when known. */
export const placeholderLabel = (path: string, filters: string | undefined, fields: FieldInfo[]) =>
  path === 'now'
    ? nowText(filters)
    : fields.find((field) => field.path === path)?.label.replace(/ \(custom\)$/, '');

/**
 * Text with its placeholders named as the data picker names them: "Welcome
 * {{subject.firstName}}!" reads "Welcome [First name]!".
 */
export const readableTemplate = (text: string, fields: FieldInfo[]) =>
  text.replace(PLACEHOLDER, (whole, path: string, filters?: string) => {
    const label = placeholderLabel(path, filters, fields);

    return label ? `[${label}]` : whole;
  });

export type TemplatePart = { text: string } | { token: string; path: string; filters?: string };

/** Text and the placeholders in it, in order. */
export const templateParts = (text: string) => {
  const parts: TemplatePart[] = [];
  let at = 0;

  for (const match of text.matchAll(PLACEHOLDER)) {
    if (match.index > at) parts.push({ text: text.slice(at, match.index) });

    parts.push({ token: match[0], path: match[1] ?? '', filters: match[2] });
    at = match.index + match[0].length;
  }

  if (at < text.length) parts.push({ text: text.slice(at) });

  return parts;
};

/** `{{path}}`: the placeholder that inserts a value. */
export const placeholderOf = (path: string) => `{{${path}}}`;
