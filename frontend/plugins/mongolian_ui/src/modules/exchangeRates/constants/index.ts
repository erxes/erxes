import { z } from 'zod';

export const EXCHANGE_RATES_PATH = '/settings/mongolian/exchange-rates';

export const EXCHANGE_RATE_ID_QUERY_KEY = 'exchange_rate_id';

/** Name of the list query, used for Apollo refetchQueries. */
export const EXCHANGE_RATES_QUERY_NAME = 'ExchangeRatesMain';

export const exchangeRateFormSchema = z.object({
  date: z.coerce.date({ message: 'Date is required' }),
  mainCurrency: z.string().min(1, { message: 'Main currency is required' }),
  rateCurrency: z.string().min(1, { message: 'Rate currency is required' }),
  rate: z.coerce.number().positive({ message: 'Rate must be greater than 0' }),
});

export type TExchangeRateForm = z.infer<typeof exchangeRateFormSchema>;

export const EXCHANGE_RATE_DEFAULT_VALUES: TExchangeRateForm = {
  date: new Date(),
  mainCurrency: '',
  rateCurrency: '',
  rate: 0,
};
