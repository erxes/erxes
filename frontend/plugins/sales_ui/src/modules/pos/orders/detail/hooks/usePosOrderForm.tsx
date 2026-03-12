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

export const usePosOrderForm = (paidAmounts?: any, summary?: any) => {
  const normalized = React.useMemo(() => {
    try {
      return normalizePaidAmounts(paidAmounts);
    } catch {
      return [];
    }
  }, [paidAmounts]);

  const defaultValues = React.useMemo(() => {
    try {
      const values = {
        ...(summary || {}),
        ...normalized.reduce((acc, { type, amount }) => {
          acc[type] = amount;
          return acc;
        }, {} as Record<string, number>),
      };
      return values;
    } catch {
      return summary || {};
    }
  }, [summary, normalized]);

  const methods = useForm<any>({
    mode: 'onBlur',
    defaultValues,
  });

  React.useEffect(() => {
    methods.reset(defaultValues);
  }, [defaultValues, methods]);

  return { methods };
};
