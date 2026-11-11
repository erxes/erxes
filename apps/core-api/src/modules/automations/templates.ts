import { valueAt } from './conditions';

const WHOLE = /^\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}$/;
const PART = /\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g;
const ALLOWED_ROOTS = new Set(['event', 'subject', 'steps', 'run']);

const lookup = (context: Record<string, unknown>, path: string) =>
  ALLOWED_ROOTS.has(path.split('.')[0] ?? '') ? valueAt(context, path) : undefined;

/**
 * Fills `{{path}}` placeholders from the run's context. A string that is only
 * one placeholder becomes that value as it is (a number stays a number, a
 * list a list); inside text, values are written out. Missing values are
 * empty. Nothing is evaluated: only paths are read.
 */
export const render = (value: unknown, context: Record<string, unknown>): unknown => {
  if (typeof value === 'string') {
    const whole = WHOLE.exec(value);

    if (whole) return lookup(context, whole[1]!) ?? null;

    return value.replace(PART, (_match, path: string) => {
      const found = lookup(context, path);

      if (found === undefined || found === null) return '';

      return typeof found === 'object' ? JSON.stringify(found) : String(found);
    });
  }

  if (Array.isArray(value)) return value.map((item) => render(item, context));

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, render(item, context)]));
  }

  return value;
};
