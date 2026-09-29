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

export const fromSubtractInput = (
  subtract?: TSubtractInput | null,
): TSubtractForm => ({
  rules: {
    minBalance: cell(subtract?.rules?.minBalance),
    maxShare: cell(subtract?.rules?.maxShare),
    step: cell(subtract?.rules?.step),
  },
});
