import { isRecord } from '@/loyalties/utils/isRecord';
import { LoyaltyScoreFormValues } from '../constants/formSchema';

type TSubtractForm = LoyaltyScoreFormValues['subtract'];

type TSubtractInput = {
  rules?: { minBalance?: number; maxShare?: number; step?: number };
};

const toNumber = (value?: string) =>
  value === undefined || value === '' || Number.isNaN(Number(value))
    ? undefined
    : Number(value);

const cell = (value?: number | null) =>
  value === undefined || value === null ? '' : String(value);

export const defaultSubtract = (): TSubtractForm => ({ rules: {} });

export const toSubtractInput = ({ rules }: TSubtractForm): TSubtractInput => ({
  rules: {
    minBalance: toNumber(rules.minBalance),
    maxShare: toNumber(rules.maxShare),
    step: toNumber(rules.step),
  },
});

const ruleNumber = (value: unknown) =>
  typeof value === 'number' ? value : undefined;

export const fromSubtractInput = (subtract?: unknown): TSubtractForm => {
  const rules =
    isRecord(subtract) && isRecord(subtract.rules) ? subtract.rules : {};

  return {
    rules: {
      minBalance: cell(ruleNumber(rules.minBalance)),
      maxShare: cell(ruleNumber(rules.maxShare)),
      step: cell(ruleNumber(rules.step)),
    },
  };
};
