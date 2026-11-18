import { IRecordTableCursorPageInfo } from 'erxes-ui';
import { z } from 'zod';

export const CURRENCY_RATE_MANUAL_SOURCE = 'manual';

export interface ICurrencyRate {
  _id: string;
  date: string;
  mainCurrency: string;
  rateCurrency: string;
  rate: number;
  source: string;
  createdBy?: string;
  createdAt: string;
}

export interface ICurrencyRatesQueryResponse {
  currencyRates: {
    list: ICurrencyRate[];
    totalCount: number;
    pageInfo: IRecordTableCursorPageInfo;
  };
}

export interface ICurrencyConfigResponse {
  dealCurrency?: { value?: string[] | string };
  mainCurrency?: { value?: string[] | string };
}

export const currencyRateFormSchema = z.object({
  date: z.date({ message: 'Date is required' }),
  rateCurrency: z.string().min(1, { message: 'Currency is required' }),
  rate: z.number({ message: 'Rate is required' }).positive({
    message: 'Rate must be greater than 0',
  }),
});

export type TCurrencyRateForm = z.infer<typeof currencyRateFormSchema>;
