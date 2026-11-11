import type { CustomerSex } from '@erxes/core-contract';
import { SexCode } from 'erxes-ui';

// The contract stores ISO/IEC 5218 codes; erxes-ui's pickers use the same numbers as an enum.
const TO_CODE = {
  0: SexCode.NOT_KNOWN,
  1: SexCode.MALE,
  2: SexCode.FEMALE,
  9: SexCode.NOT_APPLICABLE,
} satisfies Record<CustomerSex, SexCode>;

const FROM_CODE = {
  [SexCode.NOT_KNOWN]: 0,
  [SexCode.MALE]: 1,
  [SexCode.FEMALE]: 2,
  [SexCode.NOT_APPLICABLE]: 9,
} satisfies Record<SexCode, CustomerSex>;

/** A customer's stored sex as erxes-ui's `SexCode` (unknown when empty). */
export const sexCodeOf = (sex: CustomerSex | null) => TO_CODE[sex ?? 0];

/** erxes-ui's `SexCode` as the value the contract stores. */
export const sexOf = (code: SexCode) => FROM_CODE[code];
