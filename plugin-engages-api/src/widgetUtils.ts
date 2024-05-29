import { IBrowserInfo } from '@erxes/api-utils/src/definitions/common';

/**
 * Checks individual rule
 */
interface IRule {
  value?: string;
  kind: string;
  condition: string;
}

interface ICheckRuleParams {
  rule: IRule;
  browserInfo: IBrowserInfo;
  numberOfVisits?: number;
}

interface ICheckRulesParams {
  rules: IRule[];
  browserInfo: IBrowserInfo;
  numberOfVisits?: number;
}

export const checkRule = (params: ICheckRuleParams): boolean => {
  const { rule, browserInfo, numberOfVisits } = params;
  const { language, url, city, countryCode } = browserInfo;
  const { value, kind, condition } = rule;
  const ruleValue: any = value;

  let valueToTest: any;

  if (kind === 'browserLanguage') {
    valueToTest = language;
  }

  if (kind === 'currentPageUrl') {
    valueToTest = url;
  }

  if (kind === 'city') {
    valueToTest = city;
  }

  if (kind === 'country') {
    valueToTest = countryCode;
  }

  if (kind === 'numberOfVisits') {
    valueToTest = numberOfVisits;
  }

  // is
  if (condition === 'is' && valueToTest !== ruleValue) {
    return false;
  }

  // isNot
  if (condition === 'isNot' && valueToTest === ruleValue) {
    return false;
  }

  // isUnknown
  if (condition === 'isUnknown' && valueToTest) {
    return false;
  }

  // hasAnyValue
  if (condition === 'hasAnyValue' && !valueToTest) {
    return false;
  }

  // startsWith
  if (
    condition === 'startsWith' &&
    valueToTest &&
    !valueToTest.startsWith(ruleValue)
  ) {
    return false;
  }

  // endsWith
  if (
    condition === 'endsWith' &&
    valueToTest &&
    !valueToTest.endsWith(ruleValue)
  ) {
    return false;
  }

  // contains
  if (
    condition === 'contains' &&
    valueToTest &&
    !valueToTest.includes(ruleValue)
  ) {
    return false;
  }

  // greaterThan
  if (condition === 'greaterThan' && valueToTest < parseInt(ruleValue, 10)) {
    return false;
  }

  if (condition === 'lessThan' && valueToTest > parseInt(ruleValue, 10)) {
    return false;
  }

  if (condition === 'doesNotContain' && valueToTest.includes(ruleValue)) {
    return false;
  }

  return true;
};

/**
 * This function determines whether or not current visitor's information
 * satisfying given engage message's rules
 */
export const checkRules = async (
  params: ICheckRulesParams
): Promise<boolean> => {
  const { rules, browserInfo, numberOfVisits } = params;

  let passedAllRules = true;

  rules.forEach((rule) => {
    // check individual rule
    if (!checkRule({ rule, browserInfo, numberOfVisits })) {
      passedAllRules = false;
      return;
    }
  });

  return passedAllRules;
};
