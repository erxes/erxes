import {
  normalizeWalletRows,
  pointsPaidAmount,
  stampWalletPaidAmounts,
  stampWalletPayments,
  walletAmounts,
} from '../walletPayments';

const ROWS = [
  { type: 'cash' },
  { type: 'loyalty', accountTypeId: 'w1' },
  { type: 'stamps', accountTypeId: 'w2' },
];

describe('stampWalletPayments', () => {
  it('takes the wallet from the row of the same key', () => {
    expect(
      stampWalletPayments({ loyalty: { amount: 10 }, cash: { amount: 5 } }, ROWS),
    ).toEqual({
      loyalty: { amount: 10, accountTypeId: 'w1' },
      cash: { amount: 5 },
    });
  });

  it('keeps the wallet a line was already paid from', () => {
    expect(
      stampWalletPayments({ loyalty: { amount: 10 } }, ROWS, {
        loyalty: { amount: 8, accountTypeId: 'old' },
      }),
    ).toEqual({ loyalty: { amount: 10, accountTypeId: 'old' } });
  });

  it('never keeps a wallet the client sent', () => {
    expect(
      stampWalletPayments({ cash: { amount: 5, accountTypeId: 'w9' } }, ROWS),
    ).toEqual({ cash: { amount: 5 } });
  });
});

describe('stampWalletPaidAmounts', () => {
  it('keeps the POS client stamp, else the order, else the row', () => {
    expect(
      stampWalletPaidAmounts(
        [
          { type: 'loyalty', amount: 1, accountTypeId: 'pos' },
          { type: 'stamps', amount: 2 },
          { type: 'loyalty', amount: 3 },
        ],
        ROWS,
        [{ type: 'stamps', accountTypeId: 'kept' }],
      ),
    ).toEqual([
      { type: 'loyalty', amount: 1, accountTypeId: 'pos' },
      { type: 'stamps', amount: 2, accountTypeId: 'kept' },
      { type: 'loyalty', amount: 3, accountTypeId: 'w1' },
    ]);
  });
});

describe('walletAmounts', () => {
  it('sums money per wallet and in all', () => {
    const lines = [
      { amount: 10, accountTypeId: 'w1' },
      { amount: 5, accountTypeId: 'w1' },
      { amount: 7, accountTypeId: 'w2' },
      { amount: 100 },
    ];

    expect([...walletAmounts(lines)]).toEqual([
      ['w1', 15],
      ['w2', 7],
    ]);
    expect(pointsPaidAmount(lines)).toBe(22);
  });
});

describe('normalizeWalletRows', () => {
  it('gives a wallet row its key and keeps one row per wallet', () => {
    expect(
      normalizeWalletRows([
        { accountTypeId: 'w1' },
        { type: 'other', accountTypeId: 'w1' },
        { type: 'cash' },
      ]),
    ).toEqual([{ accountTypeId: 'w1', type: 'loyalty_w1' }, { type: 'cash' }]);
  });
});
