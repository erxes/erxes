import { FC } from 'react';
import { IDeal } from '@/deals/types/deals';

type Props = {
  totalAmount?: Record<string, number>;
  unusedTotalAmount?: Record<string, number>;
  deals?: IDeal[];
  dealTotalAmounts?: Array<{
    currencies: Array<{ name: string; amount: number }>;
  }>;
  probability?: string;
};

type AmountRowProps = {
  label: string;
  amounts: Record<string, number>;
  percentMultiplier?: number;
  isUnused?: boolean;
  showComma?: boolean;
};

const getPercentage = (value: string): string =>
  value === 'Won' ? '100%' : value === 'Lost' ? '0%' : value;

const calculateAmount = (value: number, percentMultiplier?: number): string =>
  (percentMultiplier
    ? (value * percentMultiplier) / 100
    : value
  ).toLocaleString();

const AmountRow = ({
  label,
  amounts,
  percentMultiplier,
  isUnused,
  showComma,
}: AmountRowProps) => {
  const keys = Object.keys(amounts);

  return (
    <div className="flex justify-between items-center">
      <span className="text-[11px] font-semibold text-muted-foreground">
        {label}
      </span>
      <ul className="m-0 list-none">
        {keys.map((key, index) => (
          <li
            key={key}
            className={`text-[11px] leading-3 font-semibold${
              isUnused ? ' opacity-60' : ''
            }`}
          >
            {calculateAmount(amounts[key], percentMultiplier)}{' '}
            <span className="text-[9px] text-muted-foreground">
              {key}
              {showComma && index < keys.length - 1 ? ',' : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ItemProductProbabilities: FC<Props> = ({
  totalAmount,
  unusedTotalAmount,
  deals = [],
  dealTotalAmounts = [],
  probability,
}) => {
  if (!totalAmount && !deals && !dealTotalAmounts) {
    return null;
  }

  const probabilityPercentage = probability
    ? parseInt(getPercentage(probability), 10)
    : 0;

  if (totalAmount) {
    return (
      <div className="mb-2 w-full px-1">
        {totalAmount && Object.keys(totalAmount).length !== 0 && (
          <AmountRow label="Total" amounts={totalAmount} />
        )}

        {unusedTotalAmount && Object.keys(unusedTotalAmount).length > 0 && (
          <AmountRow
            label="Unused Total"
            amounts={unusedTotalAmount}
            isUnused
          />
        )}

        {probability && (
          <AmountRow
            label={`Forecasted (${probabilityPercentage}%)`}
            amounts={totalAmount}
            percentMultiplier={probabilityPercentage}
          />
        )}
      </div>
    );
  }

  const sumByName: Record<string, number> = {};
  dealTotalAmounts.forEach((total) =>
    total.currencies.forEach(({ name, amount }) => {
      sumByName[name] = (sumByName[name] || 0) + amount;
    }),
  );

  return (
    <div className="mb-2">
      <AmountRow label="Total" amounts={sumByName} showComma />
    </div>
  );
};

export default ItemProductProbabilities;
