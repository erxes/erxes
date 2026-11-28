import { z } from 'zod';
import {
  gatewayHttp,
  json,
  parse,
  Text,
  tokenCache,
  withBearer,
  GatewayError,
} from '@erxes/plugin-sdk/integrations';
import {
  type BankAccount,
  type BankClient,
  type BankOptions,
  fromMinor,
  minorOrNull,
  type StatementLine,
  type TdbBankConfig,
} from './types';

const NAME = 'TDB';
const PAGE_SIZE = 100;

/** TDB wraps answers in `success` and `msg`; `success: false` is a refusal whatever the status. */
const Envelope = z.object({
  success: z.boolean().nullish(),
  msg: z.string().nullish(),
  message: z.string().nullish(),
});

const Answer = <T extends z.ZodType>(data: T) => Envelope.and(data);

const refused = (answer: z.infer<typeof Envelope>) => {
  if (answer.success === false)
    throw new GatewayError(`TDB refused: ${answer.msg ?? answer.message ?? 'no reason given'}`);
};

const Account = z.object({
  ACNTNO: Text.nullish(),
  acntno: Text.nullish(),
  IBAN: Text.nullish(),
  iban: Text.nullish(),
  ACNTNAME: z.string().nullish(),
  ACNTMODE: z.string().nullish(),
  CURCODE: z.string().nullish(),
  BALANCE: z.unknown().optional(),
  AVAILABLEBAL: z.unknown().optional(),
  HOLDBAL: z.unknown().optional(),
});

const Txn = z.object({
  txndate: z.string().nullish(),
  refno: Text,
  txndesc: z.string().nullish(),
  credit: z.unknown().optional(),
  debit: z.unknown().optional(),
  balance: z.unknown().optional(),
  contacntno: Text.nullish(),
  contacntname: z.string().nullish(),
  bankcode: Text.nullish(),
});

const Header = z.object({ startbalance: z.unknown().optional(), endbalance: z.unknown() });

const account = (item: z.infer<typeof Account>): BankAccount => {
  const currency = item.CURCODE ?? 'MNT';

  return {
    number: item.ACNTNO ?? item.acntno ?? '',
    iban: item.IBAN ?? item.iban ?? null,
    name: item.ACNTNAME ?? null,
    currency,
    balance: minorOrNull(item.BALANCE, currency),
    available: minorOrNull(item.AVAILABLEBAL, currency),
    hold: minorOrNull(item.HOLDBAL, currency),
    status: item.ACNTMODE ?? null,
  };
};

const txn = (item: z.infer<typeof Txn>, currency: string): StatementLine => {
  const credit = minorOrNull(item.credit, currency) ?? 0;
  const debit = minorOrNull(item.debit, currency) ?? 0;

  return {
    id: item.refno,
    date: item.txndate ?? null,
    amount: credit - debit,
    balance: minorOrNull(item.balance, currency),
    description: item.txndesc ?? '',
    counterparty:
      item.contacntno || item.contacntname
        ? {
            account: item.contacntno ?? null,
            name: item.contacntname ?? null,
            bank: item.bankcode ?? null,
          }
        : null,
  };
};

/** TDB's corporate gateway (OAuth client credentials). */
const tdbApi = (config: TdbBankConfig, options: BankOptions) => {
  const send = gatewayHttp(NAME, config.apiUrl.replace(/\/$/u, ''), options);

  const cache = tokenCache(`tdb-cg:${options.cacheKey ?? config.clientId}`, async () => {
    const answer = parse(
      NAME,
      Answer(
        z.object({ token: z.string().nullish(), data: z.object({ token: z.string() }).nullish() }),
      ),
      await send('/oauth2/token', {
        method: 'POST',
        body: json({
          grant_type: 'client_credentials',
          client_id: config.clientId,
          client_secret: config.clientSecret,
        }),
      }),
      'no access token',
    );

    refused(answer);

    const token = answer.data?.token ?? answer.token;

    if (!token) throw new GatewayError('TDB gave no access token');

    // TDB's tokens last five minutes.
    return { token, expiresIn: 240 };
  });

  const call = withBearer(send, cache.token);

  /** An answer as `schema`, a refusal (`success: false`) thrown. */
  const ask = async <T extends z.ZodType>(
    schema: T,
    path: string,
    what: string,
    init?: RequestInit,
  ) => {
    const answer = parse(NAME, Answer(schema), await call(path, init), what);

    refused(answer);

    return answer;
  };

  return { ask, cache };
};

export const tdbClient = (config: TdbBankConfig, options: BankOptions = {}): BankClient => {
  const { ask, cache } = tdbApi(config, options);

  const accounts = async () =>
    (
      await ask(z.object({ data: z.array(Account).nullish() }), '/accounts', 'no account list')
    ).data?.map(account) ?? [];

  return {
    kind: 'tdb',
    async verify() {
      cache.forget();
      await accounts();
    },
    accounts,
    async account(number) {
      const answer = await ask(
        z.object({ data: z.object({ invoice: Account }).nullish() }),
        `/accounts/${encodeURIComponent(number)}/balance`,
        'no balance',
      );

      if (!answer.data) throw new GatewayError('TDB has no such account');

      return account(answer.data.invoice);
    },
    async statement({ account: number, from, to, page }) {
      const query = new URLSearchParams({ from, to, page: String(page), size: String(PAGE_SIZE) });

      const answer = await ask(
        z.object({
          header: z.union([z.array(Header), Header.transform((item) => [item])]).nullish(),
          txn: z.array(z.unknown()).nullish(),
        }),
        `/accounts/statement/${encodeURIComponent(number)}?${query.toString()}`,
        'an unreadable statement',
      );

      const items = answer.txn ?? [];
      const header = answer.header?.[0];

      return {
        lines: items.flatMap((item) => {
          const parsed = Txn.safeParse(item);

          return parsed.success ? [txn(parsed.data, 'MNT')] : [];
        }),
        openingBalance: minorOrNull(header?.startbalance, 'MNT'),
        closingBalance: minorOrNull(header?.endbalance, 'MNT'),
        more: items.length >= PAGE_SIZE,
      };
    },
    async transfer(input) {
      if (input.type === 'interbank' && (!input.toBank || !input.toAccountName))
        throw new GatewayError('A transfer to another bank needs the bank and the account name');

      const common = {
        debtorAccount: input.fromAccount,
        creditorAccount: input.toAccount,
        txnAmount: fromMinor(input.amount, input.currency),
        txnDesc: input.description,
      };

      const answer = await ask(
        z.object({ transactionNumber: Text.nullish(), requestid: Text.nullish() }),
        `/v1/transfer/${input.type}`,
        'an unreadable transfer answer',
        {
          method: 'POST',
          body: json(
            input.type === 'domestic'
              ? common
              : {
                  ...common,
                  creditorCurrency: input.toCurrency ?? input.currency,
                  creditorAccountName: input.toAccountName,
                  beneficiaryBankCode: Number(input.toBank),
                },
          ),
        },
      );

      return { bankReference: answer.transactionNumber ?? answer.requestid ?? null };
    },
  };
};
