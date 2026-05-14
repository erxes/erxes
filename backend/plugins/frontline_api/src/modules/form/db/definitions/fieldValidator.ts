import { Schema } from 'mongoose';
import { field } from './utils';

export const VALIDATOR_TYPES = ['PRESET', 'CUSTOM', 'NONE'] as const;
export type ValidatorType = (typeof VALIDATOR_TYPES)[number];

export const VALIDATOR_PRESET_KEYS = [
  'EMAIL',
  'PHONE_INTL',
  'POSTAL_CODE',
  'ALPHANUMERIC',
] as const;
export type ValidatorPresetKey = (typeof VALIDATOR_PRESET_KEYS)[number];

export interface IFieldValidator {
  type: ValidatorType;
  presetKey?: ValidatorPresetKey;
  customRegex?: string;
  errorMessage?: string;
}

export const fieldValidatorSchema = new Schema<IFieldValidator>(
  {
    type: field({
      type: String,
      enum: VALIDATOR_TYPES,
      default: 'NONE',
      label: 'Validator type',
    }),
    presetKey: field({
      type: String,
      enum: VALIDATOR_PRESET_KEYS,
      optional: true,
      label: 'Preset validator key',
    }),
    customRegex: field({
      type: String,
      optional: true,
      label: 'Custom regex pattern',
    }),
    errorMessage: field({
      type: String,
      optional: true,
      label: 'Custom error message',
    }),
  },
  { _id: false },
);
