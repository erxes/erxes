import { TBuiltInTemplate } from '@/automations/utils/builtInTemplates';
import { TAutomationAction } from 'ui-modules';

const MAX_VALUE_LENGTH = 140;

const readable = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(value);
};

const clipped = (text: string) =>
  text.length > MAX_VALUE_LENGTH ? `${text.slice(0, MAX_VALUE_LENGTH)}…` : text;

/** `toEmailsPlaceHolders` reads as "To emails place holders". */
const spellOut = (key: string) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (first) => first.toUpperCase())
    .trim();

const isSet = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length > 0;
  }

  return true;
};

/**
 * Each step as it will be installed: what it is called and what it is set
 * to. Empty fields are left out — the template leaves them for the
 * organization — while `{{ }}` placeholders stay, being worth reading first.
 */
export const templateStepRows = (
  template: TBuiltInTemplate,
  actions: TAutomationAction[],
) =>
  actions.map((action, index) => ({
    key: action.id,
    number: index + 1,
    title: action.label || template.flow[index]?.label || action.type,
    type: action.type,
    values: Object.entries(action.config || {})
      .filter(([, value]) => isSet(value))
      .map(([key, value]) => ({
        key,
        label: spellOut(key),
        text: clipped(readable(value)),
      })),
  }));
