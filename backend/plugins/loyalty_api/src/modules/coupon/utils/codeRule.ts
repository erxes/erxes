import {
  ICouponCodeRule,
  ICouponCodeRuleFormFields,
} from '@/coupon/@types/couponCampaign';

// The campaign form saves its own field names; generation reads these.
export const normalizeCodeRule = (
  codeRule: (ICouponCodeRule & ICouponCodeRuleFormFields) | undefined,
): ICouponCodeRule => {
  const {
    numberOfCodes,
    prefixUppercase,
    postfixUppercase,
    characterSet,
    ...rule
  } = codeRule || {};

  return {
    ...rule,
    size: rule.size ?? (numberOfCodes || undefined),
    prefix: rule.prefix ?? prefixUppercase,
    postfix: rule.postfix ?? postfixUppercase,
    charSet: rule.charSet ?? (characterSet ? [characterSet] : undefined),
  };
};
