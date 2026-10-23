import { ITrDetail } from '../../../accounting/@types/transaction';
import { matchProductionDetailIds } from '../productionTransactionDetails';

describe('production detail identity matching', () => {
  it('matches by account and product instead of position and leaves inputs unchanged', () => {
    const previous: ITrDetail[] = [
      {
        _id: 'old-a',
        accountId: 'inventory',
        productId: 'a',
        count: 1,
        amount: 3,
      },
      {
        _id: 'old-b',
        accountId: 'inventory',
        productId: 'b',
        count: 2,
        amount: 6,
      },
    ];
    const details: ITrDetail[] = [
      {
        _id: 'new-b',
        accountId: 'inventory',
        productId: 'b',
        count: 4,
        amount: 12,
      },
      {
        _id: 'new-c',
        accountId: 'inventory',
        productId: 'c',
        count: 1,
        amount: 8,
      },
    ];
    expect(matchProductionDetailIds(details, previous)).toEqual([
      { ...details[0], _id: 'old-b' },
      details[1],
    ]);
    expect(details[0]._id).toBe('new-b');
    expect(previous[1].count).toBe(2);
  });

  it('never reuses an old id for two details and keeps different accounts separate', () => {
    const previous: ITrDetail[] = [
      { _id: 'one', accountId: 'a', productId: 'product', amount: 1 },
      { _id: 'two', accountId: 'a', productId: 'product', amount: 2 },
      { _id: 'three', accountId: 'b', productId: 'product', amount: 3 },
    ];
    const details: ITrDetail[] = [
      { _id: 'new-1', accountId: 'a', productId: 'product', amount: 4 },
      { _id: 'new-2', accountId: 'b', productId: 'product', amount: 5 },
      { _id: 'new-3', accountId: 'a', productId: 'product', amount: 6 },
      { _id: 'new-4', accountId: 'a', productId: 'product', amount: 7 },
    ];
    expect(
      matchProductionDetailIds(details, previous).map((row) => row._id),
    ).toEqual(['one', 'three', 'two', 'new-4']);
  });

  it('matches single-journal cost details without a product and copies newly generated details', () => {
    const details: ITrDetail[] = [
      { _id: 'new', accountId: 'labor', amount: 0 },
    ];
    expect(
      matchProductionDetailIds(details, [
        { _id: 'old', accountId: 'labor', amount: 10 },
      ])[0],
    ).toEqual({ ...details[0], _id: 'old' });
    const copied = matchProductionDetailIds(details);
    copied[0].amount = 20;
    expect(details[0].amount).toBe(0);
  });
});
