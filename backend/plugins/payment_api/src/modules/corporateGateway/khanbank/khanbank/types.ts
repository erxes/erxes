export type TransferParams = {
  fromAccount: string;
  toAccount: string;
  amount: number;
  description: string;
  currency: string;

  loginName: string;
  password: string;
  transferid: string;
};

export type KhanbankAccount = {
  number: string;
  ibanAcctNo: string;
  type: string;
  currency: string;
  status: string;
  balance: number;
  name: string;
  holdBalance: number;
  availableBalance: number;
  openDate: string;
  homeBranch: string;
  intMethod: string;
  intRate: string;
  homePhone: string;
  businessPhone: string;

  lastMaintenceDate: string;
  lastFinancialTranDate: string;

  intFrom: string;
  intTo: string;
  addr1: string;
};

// One line of a Khanbank account statement (CG005). Only the fields payment
// matching reads are listed; the bank sends more.
export type KhanbankStatementLine = {
  record: number;
  tranDate?: string;
  postDate?: string;
  // hhmmssss
  time?: string;
  amount: number;
  description?: string;
  relatedAccount?: string;
  journal?: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

// Narrows one raw statement line; lines without a numeric record or amount
// cannot be matched or reserved and are dropped.
export const toStatementLine = (
  value: unknown,
): KhanbankStatementLine | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const record = Number(value.record);
  const amount = Number(value.amount);

  if (!Number.isFinite(record) || !Number.isFinite(amount)) {
    return undefined;
  }

  const text = (key: string) => {
    const field = value[key];

    return typeof field === 'string' ? field : undefined;
  };

  return {
    record,
    amount,
    tranDate: text('tranDate'),
    postDate: text('postDate'),
    time: value.time === undefined ? undefined : String(value.time),
    description: text('description'),
    relatedAccount: text('relatedAccount'),
    journal: Number.isFinite(Number(value.journal))
      ? Number(value.journal)
      : undefined,
  };
};

export const toStatementLines = (response: unknown): KhanbankStatementLine[] => {
  const listOf = (value: unknown): unknown[] | undefined =>
    Array.isArray(value) ? value : undefined;

  const raw = Array.isArray(response)
    ? response
    : isRecord(response)
      ? (listOf(response.transactions) ?? listOf(response.content) ?? [])
      : [];

  return raw
    .map(toStatementLine)
    .filter((line): line is KhanbankStatementLine => !!line);
};
