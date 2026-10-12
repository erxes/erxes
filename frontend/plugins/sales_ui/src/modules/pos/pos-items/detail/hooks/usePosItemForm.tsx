import React from 'react';
import { useForm } from 'react-hook-form';
import { TPosItemFormData } from '../types/posItemType';

export const usePosItemForm = (paymentSummary?: Record<string, number>) => {
  const summaryKey = React.useMemo(() => {
    try {
      return JSON.stringify(paymentSummary);
    } catch {
      return '';
    }
  }, [paymentSummary]);

  const defaultValues = React.useMemo(
    () => ({ ...(paymentSummary || {}) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [summaryKey],
  );

  const methods = useForm<TPosItemFormData>({
    mode: 'onBlur',
    defaultValues,
  });

  React.useEffect(() => {
    methods.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaryKey]);

  return { methods };
};
