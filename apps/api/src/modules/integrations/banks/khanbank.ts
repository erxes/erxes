import { z } from 'zod';
import { basic, gatewayHttp, json, parse, Text, tokenCache, withBearer } from '../gateways/http';
import { GatewayError } from '../gateways/types';
import {
  type BankAccount,
  type BankClient,
  type BankOptions,
  compactDay,
  fromMinor,
  type KhanbankBankConfig,
  minorOrNull,
  type StatementLine,
  toMinor,
  type TransferInput,
} from './types';

const NAME = 'Khan Bank';
const PAGE_SIZE = 100;

const TokenAnswer = z.object({
  access_token: z.string().min(1),
  access_token_expires_in: z.coerce.number().optional(),
});

const Account = z.object({
  number: Text,
  ibanAcctNo: Text.nullish(),
  name: z.string().nullish(),
  currency: z.string().nullish(),
  status: z.string().nullish(),
  balance: z.unknown().optional(),
  availableBalance: z.unknown().optional(),
  holdBalance: z.unknown().optional(),
});

const Line = z.object({
  record: Text,
  tranDate: z.string().nullish(),
  postDate: z.string().nullish(),
  time: Text.nullish(),
  amount: z.coerce.number(),
  balance: z.unknown().optional(),
  description: z.string().nullish(),
  relatedAccount: Text.nullish(),
});

const StatementAnswer = z.object({
  currency: z.string().nullish(),
  beginBalance: z.unknown().optional(),
  endBalance: z.unknown().optional(),
  transactions: z.array(z.unknown()).nullish(),
});

/** "2026-11-17" and "11393704" (hhmmssss) → ISO, in Ulaanbaatar time. */
const madeAt = (day: string | null | undefined, time: string | null | undefined) => {
  if (!day) return null;

  const clock = (time ?? '').padStart(8, '0');

  return `${day}T${clock.slice(0, 2)}:${clock.slice(2, 4)}:${clock.slice(4, 6)}+08:00`;
};

const account = (item: z.infer<typeof Account>): BankAccount => {
  const currency = item.currency ?? 'MNT';

  return {
    number: item.number,
    iban: item.ibanAcctNo ?? null,
    name: item.name ?? null,
    currency,
    balance: minorOrNull(item.balance, currency),
    available: minorOrNull(item.availableBalance, currency),
    hold: minorOrNull(item.holdBalance, currency),
    status: item.status ?? null,
  };
};

const line = (item: z.infer<typeof Line>, currency: string): StatementLine => ({
  id: item.record,
  date: madeAt(item.tranDate ?? item.postDate, item.time),
  amount: toMinor(item.amount, currency),
  balance: minorOrNull(item.balance, currency),
  description: item.description ?? '',
  counterparty: item.relatedAccount
    ? { account: item.relatedAccount, name: null, bank: null }
    : null,
});

/** Lines Khan Bank sends that can't be read are left out, not failed on. */
const lines = (items: unknown[], currency: string) =>
  items.flatMap((item) => {
    const parsed = Line.safeParse(item);

    return parsed.success ? [line(parsed.data, currency)] : [];
  });

/** Khan Bank's corporate gateway (api.khanbank.com/v1), for one organisation's consumer keys. */
const khanbankApi = (config: KhanbankBankConfig, options: BankOptions) => {
  const send = gatewayHttp(NAME, 'https://api.khanbank.com/v1', options);

  const cache = tokenCache(`khanbank-cg:${options.cacheKey ?? config.consumerKey}`, async () => {
    const answer = parse(
      NAME,
      TokenAnswer,
      await send('/auth/token?grant_type=client_credentials', {
        method: 'POST',
        headers: {
          Authorization: basic(config.consumerKey, config.secretKey),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
      'no access token',
    );

    return { token: answer.access_token, expiresIn: answer.access_token_expires_in };
  });

  return { call: withBearer(send, cache.token), cache };
};

/** Money from one of the organisation's Khan Bank accounts, sent by an internet bank user. */
const sendTransfer = async (
  config: KhanbankBankConfig,
  call: ReturnType<typeof khanbankApi>['call'],
  input: TransferInput,
) => {
  if (!input.sender)
    throw new GatewayError('Khan Bank needs the internet bank user who sends the transfer');

  if (input.type === 'interbank' && (!input.toBank || !input.toAccountName))
    throw new GatewayError('A transfer to another bank needs the bank and the account name');

  const answer = parse(
    NAME,
    z.object({ journalNo: Text.nullish(), uuid: Text.nullish(), transferid: Text.nullish() }),
    await call(`/transfer/${input.type}`, {
      method: 'POST',
      body: json({
        fromAccount: input.fromAccount,
        toAccount: input.toAccount,
        amount: fromMinor(input.amount, input.currency),
        currency: input.currency,
        description: input.description,
        transferid: input.reference,
        loginName: input.sender.loginName,
        password: input.sender.password,
        tranPassword: config.transactionPassword,
        ...(input.type === 'interbank' && {
          toBank: input.toBank,
          toAccountName: input.toAccountName,
          toCurrency: input.toCurrency ?? input.currency,
        }),
      }),
    }),
    'an unreadable transfer answer',
  );

  return { bankReference: answer.journalNo ?? answer.uuid ?? null };
};

export const khanbankClient = (
  config: KhanbankBankConfig,
  options: BankOptions = {},
): BankClient => {
  const { call, cache } = khanbankApi(config, options);

  const accounts = async () =>
    parse(
      NAME,
      z.object({ accounts: z.array(Account).nullish() }),
      await call('/accounts'),
      'no account list',
    ).accounts?.map(account) ?? [];

  return {
    kind: 'khanbank',
    async verify() {
      cache.forget();
      await accounts();
    },
    accounts,
    async account(number) {
      const answer = parse(
        NAME,
        z.object({ account: Account }),
        await call(`/accounts/${encodeURIComponent(number)}/`),
        'no account',
      );

      return account(answer.account);
    },
    async statement({ account: number, from, to, page }) {
      const query = new URLSearchParams({
        sort: 'date,desc',
        from: compactDay(from),
        to: compactDay(to),
        page: String(page - 1),
        size: String(PAGE_SIZE),
      });

      const answer = parse(
        NAME,
        StatementAnswer,
        await call(`/statements/${encodeURIComponent(number)}?${query.toString()}`),
        'an unreadable statement',
      );

      const currency = answer.currency ?? 'MNT';
      const found = lines(answer.transactions ?? [], currency);

      return {
        lines: found,
        openingBalance: minorOrNull(answer.beginBalance, currency),
        closingBalance: minorOrNull(answer.endBalance, currency),
        more: (answer.transactions ?? []).length >= PAGE_SIZE,
      };
    },
    transfer: (input) => sendTransfer(config, call, input),
  };
};

const TaxpayerAnswer = z.object({ tin: Text.nullish(), name: z.string().nullish() });

const TaxInvoice = z
  .object({
    invoiceNo: Text.nullish(),
    amount: z.unknown().optional(),
    taxPayerName: z.string().nullish(),
    description: z.string().nullish(),
    taxTypeName: z.string().nullish(),
    branchName: z.string().nullish(),
    year: Text.nullish(),
    period: Text.nullish(),
  })
  .loose();

/**
 * Khan Bank's tax lookups: a taxpayer's TIN by their registration number, and
 * the tax invoices due by invoice or capital (property) number.
 */
export const khanbankTaxes = (config: KhanbankBankConfig, options: BankOptions = {}) => {
  const { call } = khanbankApi(config, options);

  return {
    async taxpayer(registrationNumber: string) {
      const answer = parse(
        NAME,
        TaxpayerAnswer,
        await call(
          `/tax/inquiry/register?${new URLSearchParams({ pin: registrationNumber }).toString()}`,
        ),
        'no taxpayer',
      );

      return { tin: answer.tin ?? null, name: answer.name ?? null };
    },
    async invoices(by: 'invoice' | 'capital', value: string) {
      const path = by === 'capital' ? '/tax/inquiry/capitalnumber' : '/tax/inquiry/invoicenumber';

      const answer = parse(
        NAME,
        z.union([z.array(TaxInvoice), TaxInvoice.transform((item) => [item])]),
        await call(`${path}?${new URLSearchParams({ value }).toString()}`),
        'no tax invoices',
      );

      return answer.map((item) => ({
        invoiceNumber: item.invoiceNo ?? null,
        amount: minorOrNull(item.amount, 'MNT'),
        taxpayer: item.taxPayerName ?? null,
        description: item.description ?? null,
        taxType: item.taxTypeName ?? null,
        branch: item.branchName ?? null,
        period: [item.year, item.period].filter(Boolean).join('/') || null,
      }));
    },
  };
};
