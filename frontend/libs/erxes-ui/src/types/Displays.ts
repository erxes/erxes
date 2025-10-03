import { CurrencyCode } from './CurrencyCode';

export type FieldCurrencyValue = {
  currencyCode: CurrencyCode;
  amountMicros: number | null;
};
