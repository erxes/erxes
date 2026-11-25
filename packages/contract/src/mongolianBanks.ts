import { z } from 'zod';

/**
 * Mongolia's banks by their interbank code (QPay's list, as erxes 3.x kept it). `accounts` marks
 * the ones a business or person holds an account at, for pickers of where customers transfer to;
 * the others (the central bank, the treasury, the securities houses) only clear.
 */
export const MONGOLIAN_BANKS = [
  { code: '050000', name: 'Khan Bank', nameMn: 'Хаан банк', accounts: true },
  { code: '150000', name: 'Golomt Bank', nameMn: 'Голомт банк', accounts: true },
  {
    code: '040000',
    name: 'Trade and Development Bank',
    nameMn: 'Худалдаа хөгжлийн банк',
    accounts: true,
  },
  { code: '320000', name: 'Khas Bank', nameMn: 'Хас банк', accounts: true },
  { code: '340000', name: 'State Bank', nameMn: 'Төрийн банк', accounts: true },
  { code: '380000', name: 'Bogd Bank', nameMn: 'Богд банк', accounts: true },
  { code: '300000', name: 'Capitron Bank', nameMn: 'Капитрон банк', accounts: true },
  { code: '210000', name: 'Arig Bank', nameMn: 'Ариг банк', accounts: true },
  { code: '190000', name: 'Trans Bank', nameMn: 'Тээвэр хөгжлийн банк', accounts: true },
  {
    code: '290000',
    name: 'National Investment Bank',
    nameMn: 'Үндэсний хөрөнгө оруулалтын банк',
    accounts: true,
  },
  { code: '390000', name: 'M Bank', nameMn: 'М банк', accounts: true },
  { code: '330000', name: 'Chinggis Khaan Bank', nameMn: 'Чингис хаан банк', accounts: true },
  { code: '220000', name: 'Credit Bank', nameMn: 'Кредит банк', accounts: true },
  { code: '020000', name: 'Capital Bank', nameMn: 'Капитал банк', accounts: true },
  { code: '500000', name: 'MobiFinance NBFI', nameMn: 'МобиФинанс ББСБ', accounts: true },
  { code: '010000', name: 'Bank of Mongolia', nameMn: 'Монголбанк', accounts: false },
  {
    code: '360000',
    name: 'Development Bank of Mongolia',
    nameMn: 'Монгол Улсын Хөгжлийн банк',
    accounts: false,
  },
  {
    code: '900000',
    name: 'Ministry of Finance (treasury)',
    nameMn: 'Сангийн яам (Төрийн сан)',
    accounts: false,
  },
  {
    code: '940000',
    name: 'Securities settlement clearing house',
    nameMn: 'Үнэт цаасны төлбөр тооцооны төв',
    accounts: false,
  },
  {
    code: '950000',
    name: 'Central securities depository',
    nameMn: 'Үнэт цаасны төвлөрсөн хадгаламжийн төв',
    accounts: false,
  },
] as const;

export type MongolianBank = (typeof MONGOLIAN_BANKS)[number];

/** The bank with this code, or undefined for a code not on the list. */
export const mongolianBank = (code: string): MongolianBank | undefined =>
  MONGOLIAN_BANKS.find((bank) => bank.code === code);

/** A bank's interbank code, one of `MONGOLIAN_BANKS`. */
export const MongolianBankCode = z
  .string()
  .trim()
  .refine((code) => mongolianBank(code) !== undefined, 'a bank on the list');

/** The banks customers can hold an account at, in the order pickers list them. */
export const ACCOUNT_BANKS = MONGOLIAN_BANKS.filter((bank) => bank.accounts);
