import React from 'react';
import { useForm } from 'react-hook-form';

const normalizePaidAmounts = (
  paidAmounts: any,
): Array<{ type: string; amount: number }> => {
  if (!paidAmounts) return [];

  if (Array.isArray(paidAmounts)) {
    return paidAmounts;
  }

  if (typeof paidAmounts === 'object') {
    return Object.entries(paidAmounts as Record<string, number>).map(
      ([type, amount]) => ({ type, amount }),
    );
  }

  return [];
};

const buildDefaultValues = (
  paidAmounts: any,
  summary: any,
): Record<string, number> => {
  const normalized = normalizePaidAmounts(paidAmounts);

  return {
    ...(summary || {}),
    ...normalized.reduce(
      (acc, { type, amount }) => {
        acc[type] = amount;
        return acc;
      },
      {} as Record<string, number>,
    ),
  };
};

export const usePosItemForm = (paidAmounts?: any, summary?: any) => {
  const paidAmountsKey = React.useMemo(() => {
    try {
      return JSON.stringify(paidAmounts);
    } catch {
      return '';
    }
  }, [paidAmounts]);

  const defaultValues = React.useMemo(
    () => buildDefaultValues(paidAmounts, summary),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paidAmountsKey, summary],
  );

  const methods = useForm<any>({
    mode: 'onBlur',
    defaultValues,
  });

  React.useEffect(() => {
    methods.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidAmountsKey]);

  return { methods };
};
