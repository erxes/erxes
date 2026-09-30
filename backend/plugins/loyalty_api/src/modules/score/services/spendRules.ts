import { ISpendRules } from '@/score/@types/scoreCampaign';
import { fixScoreNumber } from '@/score/services/scoreLedger';

const optionalNumber = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? number : undefined;
};

export const normalizeSpendRules = (rules?: ISpendRules): ISpendRules => {
  const maxShare = optionalNumber(rules?.maxShare);

  if (maxShare !== undefined && maxShare > 100) {
    throw new Error('Points can pay at most 100% of an order');
  }

  return {
    minBalance: optionalNumber(rules?.minBalance),
    maxShare,
    step: optionalNumber(rules?.step) || undefined,
  };
};

// Points a payment of `paidMoney` costs, or an error the paying channel shows
// as is. `balance` is what the owner could spend on this order, including
// points this order already took.
export const checkSpendRules = ({
  rules,
  paidMoney,
  orderTotal,
  pointValue,
  balance,
}: {
  rules: ISpendRules;
  paidMoney: number;
  orderTotal: number;
  pointValue: number;
  balance: number;
}) => {
  const points = fixScoreNumber(paidMoney / (pointValue > 0 ? pointValue : 1));

  if (!points) {
    return 0;
  }

  if (rules.step && Math.abs(points % rules.step) > 1e-9) {
    throw new Error(`Points can only be spent in multiples of ${rules.step}`);
  }

  if (rules.minBalance && balance < rules.minBalance) {
    throw new Error(
      `Points can be spent once the balance reaches ${rules.minBalance}`,
    );
  }

  if (
    rules.maxShare !== undefined &&
    paidMoney > (orderTotal * rules.maxShare) / 100 + 1e-9
  ) {
    throw new Error(`Points can pay at most ${rules.maxShare}% of an order`);
  }

  if (points > balance) {
    throw new Error('There has no enough score to subtract');
  }

  return points;
};
