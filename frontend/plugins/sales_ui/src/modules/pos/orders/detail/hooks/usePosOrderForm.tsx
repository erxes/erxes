import { useForm } from 'react-hook-form';
import { TPosOrderFormData } from '../../types/posOrderType';

export const usePosOrderForm = () => {
  const methods = useForm<TPosOrderFormData>({
    mode: 'onBlur',
    defaultValues: {
      cashAmount: 0,
      mobileAmount: 0,
      spendPoints: 0,
    },
  });

  return {
    methods,
  };
};
