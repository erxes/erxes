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

  const result: Record<string, number> = {};

  Object.entries(summary || {}).forEach(([key, value]) => {
    result[key] = Number(value) || 0;
  });

  normalized.forEach(({ type, amount }) => {
    result[type] = amount;
  });

  return result;
};

export const usePosOrderForm = (paidAmounts?: any, summary?: any) => {
  const paidAmountsKey = React.useMemo(() => {
    try {
      return JSON.stringify(paidAmounts);
    } catch {
      return '';
    }
  }, [paidAmounts]);

  const summaryKey = React.useMemo(() => {
    try {
      return JSON.stringify(summary);
    } catch {
      return '';
    }
  }, [summary]);

  const defaultValues = React.useMemo(
    () => buildDefaultValues(paidAmounts, summary),
    [paidAmounts, summary],
  );

  const methods = useForm<any>({
    mode: 'onBlur',
    defaultValues,
  });

  React.useEffect(() => {
    methods.reset(defaultValues);
  }, [defaultValues, methods, paidAmountsKey, summaryKey]);

  return { methods };
};
