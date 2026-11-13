import { currencyDigits } from '@erxes/core-contract';
import { useTranslation } from 'react-i18next';

/*
 * Amounts are integers in the currency's smallest unit (`currencyDigits`):
 * $12.50 is 1250, ₮1,500 is 150000, ¥500 is 500.
 */

const unit = (currency: string) => 10 ** currencyDigits(currency);

/** An amount as people read it in `language`: 150000 MNT → "MNT 1,500.00". */
export const formatMoney = (amount: number, currency: string, language: string) =>
  new Intl.NumberFormat(language, { style: 'currency', currency }).format(amount / unit(currency));

/** An amount for a number input: 1250 USD → "12.5". */
export const toAmountInput = (amount: number, currency: string) => String(amount / unit(currency));

/** What was typed in a number input, in the smallest unit: "12.5" USD → 1250. */
export const fromAmountInput = (text: string, currency: string) =>
  Math.round(Number(text) * unit(currency));

/** The smallest step a number input takes for a currency: 0.01 for USD, 1 for JPY. */
export const amountStep = (currency: string) => 1 / unit(currency);

/** `formatMoney` in the UI's language. */
export const useMoney = () => {
  const { i18n } = useTranslation();

  return (amount: number, currency: string) => formatMoney(amount, currency, i18n.language);
};
