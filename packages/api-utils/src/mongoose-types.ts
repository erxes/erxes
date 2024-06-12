import { nanoid } from 'nanoid';

export const stringRandomId = {
  type: String,
  default: () => nanoid(),
} as const;

/**
 * Allows `null | undefined`.
 * But if it's a `string`, it must contain atleast one non whitespace character.
 */
export const stringNonBlank = {
  type: String,
  validate: /\S+?/,
} as const;

export const stringRequired = {
  type: String,
  required: true,
} as const;

export const stringRequiredNonBlank = {
  type: String,
  validate: /\S+?/,
  required: true,
} as const;
