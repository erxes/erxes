import type { DataExtensionField } from '@erxes/core-contract';
import type { Value } from '../values';

/** What every value input is given: its field, the value, and where a change goes. */
export interface ValueInputProps {
  field: DataExtensionField;
  value: Value | undefined;
  onChange: (value: Value) => void;
  /** The control's id, for its row's label. */
  id: string;
  disabled?: boolean;
}

/** Text of a value that is text; '' otherwise. */
export const textOfValue = (value: Value | undefined) => (typeof value === 'string' ? value : '');

/** A typed number, or null for an empty or unreadable one. */
export const numberOf = (text: string) => {
  if (!text.trim()) return null;

  const parsed = Number(text);

  return Number.isFinite(parsed) ? parsed : null;
};

/** Strings of a value that is a list of them. */
export const stringsOf = (value: Value | undefined) =>
  Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
