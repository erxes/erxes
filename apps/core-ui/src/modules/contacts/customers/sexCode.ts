import type { Customer, CustomerSex } from '@erxes/core-contract';
import { SexCode } from 'erxes-ui';

const SEX_CODES: Record<CustomerSex, SexCode> = {
  0: SexCode.NOT_KNOWN,
  1: SexCode.MALE,
  2: SexCode.FEMALE,
  9: SexCode.NOT_APPLICABLE,
};

/** A customer's sex as the design system's `SexCode`; unknown when not set. */
export const sexCodeOf = (customer: Customer) => SEX_CODES[customer.sex ?? 0];
