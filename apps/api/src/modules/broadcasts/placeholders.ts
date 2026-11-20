import { BROADCAST_PLACEHOLDERS as NAMES, type BroadcastPlaceholder } from '@erxes/core-contract';
import { fail } from '~/http/errors';

/** What a placeholder can be filled with: one customer's values and the organisation's name. */
export interface PlaceholderValues {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  code: string | null;
  position: string | null;
  organization: string;
}

const isName = (name: string): name is BroadcastPlaceholder =>
  (NAMES as readonly string[]).includes(name);

/** `{{ firstName }}` or `{{ firstName | there }}`: the value, else the text after the bar. */
const PLACEHOLDER = /\{\{\s*([A-Za-z]+)\s*(?:\|([^}]*))?\}\}/g;

/** Values a test or a preview without a customer is filled with. */
export const SAMPLE_VALUES: PlaceholderValues = {
  firstName: 'Alex',
  lastName: 'Smith',
  email: 'alex@example.com',
  phone: '+97699112233',
  code: 'C-001',
  position: null,
  organization: 'erxes',
};

/** 400 UNKNOWN_PLACEHOLDER for a `{{ name }}` erxes can't fill, so a typo never reaches a customer. */
export const assertPlaceholders = (...texts: (string | null | undefined)[]) => {
  const unknown = new Set<string>();

  for (const text of texts) {
    for (const [, name = ''] of (text ?? '').matchAll(PLACEHOLDER)) {
      if (!isName(name)) unknown.add(name);
    }
  }

  if (unknown.size) {
    throw fail(
      'UNKNOWN_PLACEHOLDER',
      `erxes can't fill ${[...unknown].map((name) => `{{ ${name} }}`).join(', ')}. Use ${NAMES.join(', ')}`,
      { placeholders: [...unknown] },
    );
  }
};

const valueOf = (values: PlaceholderValues, name: BroadcastPlaceholder) => {
  if (name === 'fullName') {
    return [values.firstName, values.lastName].filter(Boolean).join(' ') || null;
  }

  return values[name];
};

/**
 * Fills each placeholder with the customer's value, else its fallback, else
 * nothing. `escape` encodes the customer's values for where they go (HTML); a
 * fallback is part of the text, already written in its encoding.
 */
export const fillPlaceholders = (
  text: string,
  values: PlaceholderValues,
  escape: (value: string) => string = (value) => value,
) =>
  text.replace(PLACEHOLDER, (_match, name: string, fallback: string | undefined) => {
    const value = isName(name) ? valueOf(values, name)?.trim() : null;

    return value ? escape(value) : (fallback?.trim() ?? '');
  });
