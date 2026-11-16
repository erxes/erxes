// Paying with points: a pipeline or POS payment row with `accountTypeId` pays
// from that loyalty wallet. Each payment line on a deal or order carries the
// wallet it was paid from, so moving the record or editing the rows later
// never changes which wallet a past payment came from.

export type TWalletPaymentRow = { type?: string; accountTypeId?: string };

type TPaymentLine = { amount?: number; accountTypeId?: string };

// The key a wallet row gets when it is added; rows moved from score
// campaigns keep the key accounting and ebarimt already know them by.
export const walletPaymentType = (accountTypeId: string) =>
  `loyalty_${accountTypeId}`;

export const walletsByType = (rows?: TWalletPaymentRow[] | null) =>
  new Map(
    (rows || [])
      .filter(({ type, accountTypeId }) => type && accountTypeId)
      .map(({ type, accountTypeId }) => [type as string, accountTypeId as string]),
  );

/**
 * A wallet row always has a key; anything else about it is kept as sent.
 * A wallet given twice keeps its first row.
 */
export const normalizeWalletRows = <T extends TWalletPaymentRow>(
  rows?: T[] | null,
) => {
  const seen = new Set<string>();

  return (rows || [])
    .filter(({ accountTypeId }) => {
      if (!accountTypeId) {
        return true;
      }

      if (seen.has(accountTypeId)) {
        return false;
      }

      seen.add(accountTypeId);

      return true;
    })
    .map((row) =>
      row.accountTypeId && !row.type
        ? { ...row, type: walletPaymentType(row.accountTypeId) }
        : row,
    );
};

// The wallet a line is paid from: what the record already said for that
// key, else the row's wallet. A client never chooses it.
const lineWallet = (
  type: string,
  wallets: Map<string, string>,
  previous?: TPaymentLine,
) => previous?.accountTypeId || wallets.get(type);

const withWallet = <L extends TPaymentLine>(
  line: L,
  accountTypeId?: string,
): L => {
  const stamped = { ...line };

  delete stamped.accountTypeId;

  return accountTypeId ? { ...stamped, accountTypeId } : stamped;
};

/** Deal `paymentsData` with each line's wallet set by the server. */
export const stampWalletPayments = <L extends TPaymentLine>(
  paymentsData: Record<string, L> | undefined,
  rows?: TWalletPaymentRow[] | null,
  previous?: Record<string, TPaymentLine>,
) => {
  if (!paymentsData) {
    return paymentsData;
  }

  const wallets = walletsByType(rows);

  return Object.fromEntries(
    Object.entries(paymentsData).map(([type, line]) => [
      type,
      line ? withWallet(line, lineWallet(type, wallets, previous?.[type])) : line,
    ]),
  );
};

/**
 * POS `paidAmounts` with each line's wallet: as the POS client stamped it,
 * else as the order already had it for that key, else the row's wallet.
 */
export const stampWalletPaidAmounts = <
  L extends TPaymentLine & { type?: string },
>(
  paidAmounts: L[] | undefined,
  rows?: TWalletPaymentRow[] | null,
  previous?: (TPaymentLine & { type?: string })[] | null,
) => {
  if (!paidAmounts) {
    return paidAmounts;
  }

  const wallets = walletsByType(rows);
  const before = walletsByType(previous);

  return paidAmounts.map((line) => {
    const type = line.type || '';

    return withWallet(
      line,
      line.accountTypeId || before.get(type) || wallets.get(type),
    );
  });
};

/** Money paid from each wallet, by the lines' own wallets. */
export const walletAmounts = (lines: Iterable<TPaymentLine | undefined>) => {
  const sums = new Map<string, number>();

  for (const line of lines) {
    if (line?.accountTypeId) {
      sums.set(
        line.accountTypeId,
        (sums.get(line.accountTypeId) || 0) + (Number(line.amount) || 0),
      );
    }
  }

  return sums;
};

/** Money paid with points in all, from any wallet. */
export const pointsPaidAmount = (lines: Iterable<TPaymentLine | undefined>) =>
  [...walletAmounts(lines).values()].reduce((sum, amount) => sum + amount, 0);
