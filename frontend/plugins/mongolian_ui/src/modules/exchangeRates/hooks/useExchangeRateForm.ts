import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  EXCHANGE_RATE_DEFAULT_VALUES,
  exchangeRateFormSchema,
  TExchangeRateForm,
} from '../constants';

export const useExchangeRateForm = () =>
  useForm<TExchangeRateForm>({
    resolver: zodResolver(exchangeRateFormSchema),
    defaultValues: EXCHANGE_RATE_DEFAULT_VALUES,
  });
