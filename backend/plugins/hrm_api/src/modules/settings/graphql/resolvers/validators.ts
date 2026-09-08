import {
  ContributionProfileInput,
} from '../../db/models/ContributionProfiles';
import { GradeInput } from '../../db/models/Grades';
import { SeniorityRuleInput } from '../../db/models/SeniorityRules';
import { SkillInput } from '../../db/models/Skills';

const RATE_TOLERANCE = 0.000001;

const ensureText = (value: string | undefined, fieldName: string) => {
  if (!value?.trim()) {
    throw new Error(`${fieldName} is required`);
  }
};

const ensureNonNegative = (value: number | undefined, fieldName: string) => {
  if (value !== undefined && value < 0) {
    throw new Error(`${fieldName} must be greater than or equal to zero`);
  }
};

const ensureDateRange = (
  effectiveDate?: Date,
  expiryDate?: Date,
) => {
  if (effectiveDate && expiryDate && effectiveDate > expiryDate) {
    throw new Error('Effective date must be before expiry date');
  }
};

const sanitizeStatus = (status?: string) => {
  if (!status) {
    return 'active';
  }

  if (!['active', 'archived'].includes(status)) {
    throw new Error('Status must be active or archived');
  }

  return status;
};

export const validateContributionProfileInput = (
  doc: ContributionProfileInput,
): ContributionProfileInput => {
  ensureText(doc.code, 'Code');
  ensureText(doc.name, 'Name');
  ensureNonNegative(doc.employeeRate, 'Employee rate');
  ensureNonNegative(doc.employerRate, 'Employer rate');
  ensureNonNegative(doc.employeeCap, 'Employee cap');
  ensureNonNegative(doc.employerCap, 'Employer cap');
  ensureNonNegative(doc.minBase, 'Minimum base');
  ensureNonNegative(doc.maxBase, 'Maximum base');
  ensureDateRange(doc.effectiveDate, doc.expiryDate);

  if (
    doc.minBase !== undefined &&
    doc.maxBase !== undefined &&
    doc.minBase > doc.maxBase
  ) {
    throw new Error('Minimum base must be lower than maximum base');
  }

  let employeeComponentRate = 0;
  let employerComponentRate = 0;

  for (const component of doc.components || []) {
    ensureText(component.code, 'Component code');
    ensureText(component.name, 'Component name');
    ensureNonNegative(component.rate, 'Component rate');

    if (!['employee', 'employer'].includes(component.side)) {
      throw new Error('Contribution component side must be employee or employer');
    }

    if (component.side === 'employee') {
      employeeComponentRate += component.rate;
    }

    if (component.side === 'employer') {
      employerComponentRate += component.rate;
    }
  }

  if (
    employeeComponentRate > 0 &&
    Math.abs(employeeComponentRate - doc.employeeRate) > RATE_TOLERANCE
  ) {
    throw new Error('Employee component rates must match employee rate');
  }

  if (
    employerComponentRate > 0 &&
    Math.abs(employerComponentRate - doc.employerRate) > RATE_TOLERANCE
  ) {
    throw new Error('Employer component rates must match employer rate');
  }

  return {
    ...doc,
    code: doc.code.trim(),
    name: doc.name.trim(),
    status: sanitizeStatus(doc.status),
  };
};

export const validateGradeInput = (doc: GradeInput): GradeInput => {
  ensureText(doc.code, 'Code');
  ensureText(doc.name, 'Name');
  ensureNonNegative(doc.rank, 'Rank');
  ensureNonNegative(doc.baseSalary, 'Base salary');
  ensureNonNegative(doc.allowanceAmount, 'Allowance amount');
  ensureNonNegative(doc.allowanceRate, 'Allowance rate');

  return {
    ...doc,
    code: doc.code.trim(),
    name: doc.name.trim(),
    status: sanitizeStatus(doc.status),
  };
};

export const validateSeniorityRuleInput = (
  doc: SeniorityRuleInput,
): SeniorityRuleInput => {
  ensureText(doc.code, 'Code');
  ensureText(doc.name, 'Name');
  ensureDateRange(doc.effectiveDate, doc.expiryDate);

  if (!['fixed', 'percentOfBaseSalary'].includes(doc.valueType)) {
    throw new Error('Seniority rule value type is invalid');
  }

  const sortedBrackets = [...doc.brackets].sort(
    (first, second) => first.minMonths - second.minMonths,
  );

  sortedBrackets.forEach((bracket, index) => {
    ensureNonNegative(bracket.minMonths, 'Minimum months');
    ensureNonNegative(bracket.maxMonths, 'Maximum months');
    ensureNonNegative(bracket.value, 'Bracket value');

    if (
      bracket.maxMonths !== undefined &&
      bracket.minMonths > bracket.maxMonths
    ) {
      throw new Error('Bracket minimum months must be lower than maximum months');
    }

    const previous = sortedBrackets[index - 1];

    if (
      previous?.maxMonths !== undefined &&
      previous.maxMonths >= bracket.minMonths
    ) {
      throw new Error('Seniority rule brackets must not overlap');
    }
  });

  return {
    ...doc,
    code: doc.code.trim(),
    name: doc.name.trim(),
    brackets: sortedBrackets,
    status: sanitizeStatus(doc.status),
  };
};

export const validateSkillInput = (doc: SkillInput): SkillInput => {
  ensureText(doc.code, 'Code');
  ensureText(doc.name, 'Name');
  ensureNonNegative(doc.score, 'Score');

  return {
    ...doc,
    code: doc.code.trim(),
    name: doc.name.trim(),
    category: doc.category?.trim(),
    status: sanitizeStatus(doc.status),
  };
};
