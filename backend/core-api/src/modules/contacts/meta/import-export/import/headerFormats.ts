import { STATUSES } from 'erxes-api-shared/utils';
import {
  COMPANY_SELECT_OPTIONS,
  EMAIL_VALIDATION_STATUSES,
} from '~/modules/contacts/constants';

const toValues = (options: Array<{ value: string | number }>) =>
  options.map((option) => String(option.value)).filter(Boolean);

/** Numeric pronoun codes the customer schema accepts. */
export const SEX_OPTIONS = ['0', '1', '2', '9'];

export const CONTACT_STATUS_OPTIONS = toValues(STATUSES);

export const EMAIL_VALIDATION_OPTIONS = Object.values(
  EMAIL_VALIDATION_STATUSES,
);

export const PHONE_VALIDATION_OPTIONS = [
  'valid',
  'invalid',
  'unknown',
  'unverifiable',
];

export const COMPANY_BUSINESS_TYPE_OPTIONS = toValues(
  COMPANY_SELECT_OPTIONS.BUSINESS_TYPES,
);
