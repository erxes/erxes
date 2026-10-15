import { isRecord } from '@/loyalties/utils/isRecord';

const optionalNumber = (value: unknown) =>
  typeof value === 'number' ? value : undefined;

const optionalString = (value: unknown) =>
  typeof value === 'string' ? value : undefined;

export const parseCouponCodeRule = (value: unknown) => {
  const codeRule = isRecord(value) ? value : {};

  return {
    codeLength: optionalNumber(codeRule.codeLength),
    prefixUppercase: optionalString(codeRule.prefixUppercase),
    pattern: optionalString(codeRule.pattern),
    redemptionLimitPerUser: optionalNumber(codeRule.redemptionLimitPerUser),
    characterSet: optionalString(codeRule.characterSet),
    numberOfCodes: optionalNumber(codeRule.numberOfCodes),
    postfixUppercase: optionalString(codeRule.postfixUppercase),
    usageLimit: optionalNumber(codeRule.usageLimit),
    staticCode: optionalString(codeRule.staticCode) ?? '',
  };
};
