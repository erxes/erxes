import { buildTransactionsFilterVariables } from '@/transactions/hooks/useTransactionVars';

jest.mock('erxes-ui', () => ({ parseDateRangeFromString: jest.fn() }));

test('chosen account filters reach the transaction query', () => {
  expect(
    buildTransactionsFilterVariables({
      accountKind: 'active',
      accountStatus: 'deleted',
      accountCategoryId: 'category-1',
    }),
  ).toEqual({
    accountKind: 'active',
    accountStatus: 'deleted',
    accountCategoryId: 'category-1',
  });
});

test.each([
  ['True', true],
  ['False', false],
])('the off-balance answer %s is sent as %s', (value, expected) => {
  expect(
    buildTransactionsFilterVariables({ accountIsOutBalance: value }),
  ).toEqual({ accountIsOutBalance: expected });
});

test('cleared filters are not sent', () => {
  expect(
    buildTransactionsFilterVariables({
      accountKind: null,
      accountStatus: '',
      accountIsOutBalance: null,
    }),
  ).toEqual({});
});
