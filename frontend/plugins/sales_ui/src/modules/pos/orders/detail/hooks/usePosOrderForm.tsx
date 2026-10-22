import { parsePosPaidAmounts } from '@/pos/utils/posOrderJson';
import type { TPosOrderFormData } from '../../types/posOrderType';
import React from 'react';
import { useForm } from 'react-hook-form';

const buildDefaultValues = (
  paidAmounts: unknown,
  summary: Record<string, number> | undefined,
): Record<string, number> => {
  const normalized = parsePosPaidAmounts(paidAmounts);

  const result: Record<string, number> = {};

  Object.entries(summary || {}).forEach(([key, value]) => {
    result[key] = Number(value) || 0;
  });

  normalized.forEach(({ type, amount }) => {
    if (type) result[type] = amount;
  });

  return result;
};

export const usePosOrderForm = (
  paidAmounts?: unknown,
  summary?: Record<string, number>,
) => {
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

  const methods = useForm<TPosOrderFormData>({
    mode: 'onBlur',
    defaultValues,
  });

  React.useEffect(() => {
    methods.reset(defaultValues);
  }, [defaultValues, methods, paidAmountsKey, summaryKey]);

  return { methods };
};
