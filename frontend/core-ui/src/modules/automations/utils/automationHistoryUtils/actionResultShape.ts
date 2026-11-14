import { stringifyAutomationHistoryValue } from '@/automations/components/builder/history/components/AutomationHistoryPopoverValue';

export type TResultMessage = {
  text: string;
  buttons: string[];
  attachmentCount: number;
};

/**
 * What a result looks like, read from its shape rather than its action type —
 * so a result whose action has no renderer of its own is still readable.
 */
export type TActionResultShape =
  | { kind: 'empty' }
  | { kind: 'text'; text: string }
  | { kind: 'messages'; messages: TResultMessage[] }
  | { kind: 'fields'; fields: [string, string][] }
  | { kind: 'unknown' };

type TRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is TRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPrimitive = (value: unknown) =>
  ['string', 'number', 'boolean'].includes(typeof value);

const asText = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value : undefined;

// Parsed, never rendered: the stored markup only ever reaches the page as text
export const htmlToText = (value: string) => {
  if (!value.includes('<')) {
    return value.trim();
  }

  const withBreaks = value.replace(
    /<\/(p|div|li|h[1-6])>|<br\s*\/?>/gi,
    '$&\n',
  );
  const text =
    new DOMParser().parseFromString(withBreaks, 'text/html').body.textContent ||
    '';

  return text.replace(/\n{2,}/g, '\n').trim();
};

const readButtons = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.flatMap((button) =>
        isRecord(button) && asText(button.title) ? [String(button.title)] : [],
      )
    : [];

const readMessage = (item: TRecord): TResultMessage => {
  const templates = Array.isArray(item.botData)
    ? item.botData.filter(isRecord)
    : [];
  const body =
    asText(item.content) ??
    asText(item.text) ??
    templates.map((template) => asText(template.text)).find(Boolean) ??
    '';

  return {
    text: htmlToText(body),
    buttons: [
      ...readButtons(item.buttons),
      ...templates.flatMap((template) => readButtons(template.buttons)),
    ],
    attachmentCount: Array.isArray(item.attachments)
      ? item.attachments.length
      : 0,
  };
};

const isMessage = (value: unknown) =>
  isRecord(value) &&
  (typeof value.content === 'string' || Array.isArray(value.botData));

const FIELD_LIMIT = 20;

// One nested level (`response.status`) covers request/response style results
const readFields = (value: TRecord, prefix = ''): [string, string][] =>
  Object.entries(value)
    .flatMap(([key, field]): [string, string][] => {
      const label = prefix ? `${prefix}.${key}` : key;

      if (isPrimitive(field)) {
        return String(field).trim() ? [[label, htmlToText(String(field))]] : [];
      }

      return !prefix && isRecord(field) ? readFields(field, label) : [];
    })
    .slice(0, FIELD_LIMIT);

export const readActionResultShape = (value: unknown): TActionResultShape => {
  if (value === undefined || value === null || value === '') {
    return { kind: 'empty' };
  }

  if (isPrimitive(value)) {
    return { kind: 'text', text: htmlToText(String(value)) };
  }

  if (Array.isArray(value)) {
    if (!value.length) {
      return { kind: 'empty' };
    }

    return value.every(isMessage)
      ? { kind: 'messages', messages: value.filter(isRecord).map(readMessage) }
      : { kind: 'unknown' };
  }

  if (!isRecord(value) || !Object.keys(value).length) {
    return { kind: 'empty' };
  }

  if (isMessage(value)) {
    return { kind: 'messages', messages: [readMessage(value)] };
  }

  const text = asText(value.text) ?? asText(value.message);

  if (text) {
    return { kind: 'text', text: htmlToText(text) };
  }

  const fields = readFields(value);

  return fields.length ? { kind: 'fields', fields } : { kind: 'unknown' };
};

export const toSingleLine = (text: string) => text.replace(/\s+/g, ' ').trim();

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`;

export const getResultShapePreview = (value: unknown) => {
  const shape = readActionResultShape(value);

  switch (shape.kind) {
    case 'text':
      return toSingleLine(shape.text);
    case 'messages': {
      const [first] = shape.messages;
      const buttons = shape.messages.reduce(
        (total, message) => total + message.buttons.length,
        0,
      );

      return [
        plural(shape.messages.length, 'message'),
        first.text && `"${toSingleLine(first.text)}"`,
        buttons && plural(buttons, 'button'),
      ]
        .filter(Boolean)
        .join(' · ');
    }
    case 'fields':
      return shape.fields
        .map(([key, field]) => `${key}: ${toSingleLine(field)}`)
        .join(', ');
    default:
      return 'Completed';
  }
};

export const getActionErrorMessage = (error: unknown) => {
  if (isRecord(error) && asText(error.message)) {
    return String(error.message);
  }

  return stringifyAutomationHistoryValue(error) || 'Action failed';
};
