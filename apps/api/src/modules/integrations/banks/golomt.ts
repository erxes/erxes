import { z } from 'zod';
import { aes128CbcDecrypt, aes128CbcEncrypt, hmacSha1Bytes, sha256 } from '~/lib/crypto';
import {
  gatewayHttp,
  json,
  parse,
  Text,
  tokenCache,
  GatewayError,
} from '@erxes/plugin-sdk/integrations';
import {
  type BankAccount,
  type BankClient,
  type BankOptions,
  fromMinor,
  type GolomtBankConfig,
  minorOrNull,
  type StatementLine,
  toMinor,
  type TransferInput,
} from './types';

const NAME = 'Golomt Bank';
const PAGE_SIZE = 100;

/** Golomt's own bank code: a recipient with it is at Golomt, any other at another bank. */
const GOLOMT_BANK = '15';

/** AES-128-CBC with the organisation's session and IV keys (16 characters each, Latin-1). */
const cipherKeys = (config: GolomtBankConfig) => {
  const key = Buffer.from(config.sessionKey, 'latin1');
  const iv = Buffer.from(config.ivKey, 'latin1');

  if (key.length !== 16 || iv.length !== 16)
    throw new GatewayError('Golomt Bank session and IV keys must be 16 characters each');

  return { key, iv };
};

const encrypt = (config: GolomtBankConfig, text: string) => {
  const { key, iv } = cipherKeys(config);

  return aes128CbcEncrypt(key, iv, text);
};

/** Golomt answers in base64 ciphertext, errors included. */
const decrypt = (config: GolomtBankConfig, text: string) => {
  const { key, iv } = cipherKeys(config);

  try {
    return aes128CbcDecrypt(key, iv, text.trim());
  } catch {
    throw new GatewayError('Golomt Bank sent an answer the keys could not open');
  }
};

/** Golomt's cipher with the organisation's keys: what its gateway sends and opens. */
export const golomtCipher = (config: GolomtBankConfig) => ({
  encrypt: (text: string) => encrypt(config, text),
  decrypt: (text: string) => decrypt(config, text),
});

/** The `X-Golomt-Checksum` of a body: its SHA-256 (hex), encrypted. */
const checksum = (config: GolomtBankConfig, body: unknown) =>
  encrypt(config, sha256(JSON.stringify(body)));

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const base32 = (secret: string) => {
  const bits = Array.from(secret.replaceAll('=', '').toUpperCase(), (char) => {
    const value = BASE32.indexOf(char);

    if (value < 0) throw new GatewayError('Golomt Bank transfer secret is not base-32');

    return value.toString(2).padStart(5, '0');
  }).join('');

  return Buffer.from(
    Array.from({ length: Math.floor(bits.length / 8) }, (_, index) =>
      Number.parseInt(bits.slice(index * 8, index * 8 + 8), 2),
    ),
  );
};

/** The `X-Golomt-Code` a transfer carries: a 6-digit, 30-second TOTP (RFC 6238, SHA-1). */
export const golomtTransferCode = (secret: string, now = Date.now()) => {
  const counter = Buffer.alloc(8);

  counter.writeBigUInt64BE(BigInt(Math.floor(now / 30_000)));

  const hash = hmacSha1Bytes(base32(secret), counter);
  const offset = (hash.at(-1) ?? 0) & 0x0f;

  return String((hash.readUInt32BE(offset) & 0x7f_ff_ff_ff) % 1_000_000).padStart(6, '0');
};

const Summary = z.object({
  accountId: Text,
  accountName: z.string().nullish(),
  currency: z.string().nullish(),
});

const AccountList = z.object({
  operAccounts: z.array(Summary).nullish(),
  depoAccounts: z.array(Summary).nullish(),
  loanAccounts: z.array(Summary).nullish(),
});

const Balance = z.object({
  accountId: Text.nullish(),
  accountName: z.string().nullish(),
  currency: z.string().nullish(),
  balanceLL: z
    .array(
      z.object({ type: z.string().nullish(), amount: z.object({ value: z.unknown().optional() }) }),
    )
    .nullish(),
});

const Entry = z.object({
  recNum: Text.nullish(),
  tranId: Text.nullish(),
  tranDate: z.string().nullish(),
  tranPostedDate: z.string().nullish(),
  drOrCr: z.string().nullish(),
  tranAmount: z.coerce.number(),
  tranDesc: z.string().nullish(),
  tranCrnCode: z.string().nullish(),
  balance: z.unknown().optional(),
  accName: z.string().nullish(),
  accNum: Text.nullish(),
});

const StatementAnswer = z.object({
  statements: z.array(z.unknown()).nullish(),
  totalPages: z.coerce.number().nullish(),
});

const TransferAnswer = z.object({
  successCount: z.coerce.number().nullish(),
  failedCount: z.coerce.number().nullish(),
  part: z.array(z.object({ tranId: Text.nullish(), status: z.string().nullish() })).nullish(),
});

const entry = (item: z.infer<typeof Entry>, currency: string): StatementLine => {
  const lineCurrency = item.tranCrnCode ?? currency;
  const amount = toMinor(item.tranAmount, lineCurrency);

  return {
    id: item.tranId ?? item.recNum ?? '',
    date: item.tranPostedDate ? `${item.tranPostedDate}+08:00` : (item.tranDate ?? null),
    amount: item.drOrCr?.toLowerCase().startsWith('d') ? -amount : amount,
    balance: minorOrNull(item.balance, lineCurrency),
    description: item.tranDesc ?? '',
    counterparty:
      item.accNum || item.accName
        ? { account: item.accNum ?? null, name: item.accName ?? null, bank: null }
        : null,
  };
};

/** Golomt Bank's corporate gateway (open banking): every body checksummed, every answer encrypted. */
const golomtApi = (config: GolomtBankConfig, options: BankOptions) => {
  const send = gatewayHttp(NAME, config.apiUrl.replace(/\/$/u, ''), options);

  const cache = tokenCache(`golomt-cg:${options.cacheKey ?? config.clientId}`, async () => {
    const answer = parse(
      NAME,
      z.object({ token: z.string().min(1), expiresIn: z.coerce.number().optional() }),
      await send('/v1/auth/login', {
        method: 'POST',
        body: json({ name: config.username, password: encrypt(config, config.password) }),
      }),
      'no access token',
    );

    return { token: answer.token, expiresIn: answer.expiresIn ?? 300 };
  });

  /** Calls one of Golomt's services (`X-Golomt-Service`), with the extra headers it needs. */
  const call = async (
    path: string,
    service: string,
    body: unknown,
    headers: Record<string, string> = {},
  ) => {
    const text = await send(
      `${path}?${new URLSearchParams({ client_id: config.clientId }).toString()}`,
      {
        method: 'POST',
        body: json(body),
        headers: {
          ...headers,
          Authorization: `Bearer ${await cache.token()}`,
          'X-Golomt-Checksum': checksum(config, body),
          'X-Golomt-Service': service,
        },
      },
    );

    return decrypt(config, text);
  };

  return { call, cache };
};

type GolomtCall = ReturnType<typeof golomtApi>['call'];

/** Every account, current, savings and loan, without balances (Golomt lists none). */
const listAccounts = async (call: GolomtCall, owner: { registerNo: string }) => {
  const list = parse(
    NAME,
    AccountList,
    await call('/v1/account/list', 'ACCTLST', owner),
    'no account list',
  );

  return [
    ...(list.operAccounts ?? []),
    ...(list.depoAccounts ?? []),
    ...(list.loanAccounts ?? []),
  ].map((item): BankAccount => ({
    number: item.accountId,
    iban: null,
    name: item.accountName ?? null,
    currency: item.currency ?? 'MNT',
    balance: null,
    available: null,
    hold: null,
    status: null,
  }));
};

/** One account with its available balance (`balanceLL`'s AVAIL entry). */
const accountBalance = async (
  call: GolomtCall,
  owner: { registerNo: string },
  number: string,
): Promise<BankAccount> => {
  const answer = parse(
    NAME,
    Balance,
    await call('/v1/account/balance/inq', 'ACCTBALINQ', { ...owner, accountId: number }),
    'no balance',
  );

  const currency = answer.currency ?? 'MNT';
  const available = answer.balanceLL?.find((item) => item.type === 'AVAIL');

  return {
    number: answer.accountId ?? number,
    iban: null,
    name: answer.accountName ?? null,
    currency,
    balance: null,
    available: available ? minorOrNull(available.amount.value, currency) : null,
    hold: null,
    status: null,
  };
};

/**
 * A transfer (CGWTXNADD) with the 30-second code: one leg from our account
 * to one recipient, at Golomt (bank 15) or another bank.
 */
const sendTransfer = async (config: GolomtBankConfig, call: GolomtCall, input: TransferInput) => {
  if (!config.transferSecret)
    throw new GatewayError('Golomt Bank transfers need the transfer code secret Golomt gave');

  if (input.type === 'interbank' && (!input.toBank || input.toBank === GOLOMT_BANK))
    throw new GatewayError('A transfer to another bank needs that bank’s code');

  const amount = (currency: string) => ({
    value: fromMinor(input.amount, input.currency),
    currency,
  });

  const answer = parse(
    NAME,
    TransferAnswer,
    await call(
      '/v1/transaction/cgw/transfer',
      'CGWTXNADD',
      {
        registerNumber: config.registerNumber,
        type: 'TSF',
        refCode: input.reference,
        remarks: input.description,
        initiator: {
          acctNo: input.fromAccount,
          acctName: '',
          particulars: input.description,
          amount: amount(input.currency),
          bank: GOLOMT_BANK,
        },
        receives: [
          {
            acctNo: input.toAccount,
            acctName: input.toAccountName ?? '',
            particulars: input.description,
            amount: amount(input.toCurrency ?? input.currency),
            bank: input.type === 'domestic' ? GOLOMT_BANK : input.toBank,
          },
        ],
      },
      { 'X-Golomt-Code': golomtTransferCode(config.transferSecret) },
    ),
    'an unreadable transfer answer',
  );

  // Golomt answers 200 even when a leg fails.
  if ((answer.failedCount ?? 0) > 0 || answer.successCount === 0)
    throw new GatewayError(
      `Golomt Bank did not make the transfer (${answer.failedCount ?? 0} failed)`,
    );

  return { bankReference: answer.part?.find((part) => part.tranId)?.tranId ?? null };
};

export const golomtClient = (config: GolomtBankConfig, options: BankOptions = {}): BankClient => {
  const { call, cache } = golomtApi(config, options);
  const owner = { registerNo: config.registerNumber };

  return {
    kind: 'golomt',
    async verify() {
      cache.forget();
      await listAccounts(call, owner);
    },
    accounts: () => listAccounts(call, owner),
    account: (number) => accountBalance(call, owner, number),
    async statement({ account, from, to, page }) {
      const answer = parse(
        NAME,
        StatementAnswer,
        await call('/v1/account/operative/statement', 'OPERACCTSTA', {
          ...owner,
          accountId: account,
          startDate: from,
          endDate: to,
          page,
          size: PAGE_SIZE,
        }),
        'an unreadable statement',
      );

      const items = answer.statements ?? [];

      return {
        lines: items.flatMap((item) => {
          const parsed = Entry.safeParse(item);

          return parsed.success ? [entry(parsed.data, 'MNT')] : [];
        }),
        openingBalance: null,
        closingBalance: null,
        more: answer.totalPages ? page < answer.totalPages : items.length >= PAGE_SIZE,
      };
    },
    transfer: (input) => sendTransfer(config, call, input),
  };
};
