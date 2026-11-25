import { CustomerType } from 'ui-modules';
import { cleanTrDocs } from '../../components/utils';
import { transactionGroupSchema } from '../../contants/transactionSchema';
import type { ITransaction } from '../../../types/Transaction';
import { TrJournalEnum } from '../../../types/constants';
import { getRelatedAccountGroups } from '../relatedAccounts';

jest.mock('react-i18next', () => ({
  getI18n: () => ({ t: (key: string) => key }),
}));

jest.mock('ui-modules', () => ({ CustomerType: { CUSTOMER: 'customer' } }));

const detail = (code: string) => ({
  _id: `detail-${code}`,
  accountId: `account-${code}`,
  account: { _id: `account-${code}`, code, name: code },
  amount: 1,
});

const transaction = (code: string, side: 'dt' | 'ct', ptrId = 'pointer') => ({
  _id: code,
  journal: TrJournalEnum.MAIN,
  customerType: CustomerType.CUSTOMER,
  ptrId,
  side,
  details: [detail(code)],
});

it('replaces a code once for all main transactions with the same pointer', () => {
  const data = transactionGroupSchema.parse({
    date: new Date(),
    status: 'complete',
    trDocs: [
      transaction('a', 'dt'),
      transaction('b', 'ct'),
      transaction('c', 'ct'),
      transaction('a2', 'dt', 'other'),
      { ...transaction('c', 'ct', 'other'), _id: 'c2' },
    ],
    relatedAccountReplacements: [
      { ptrId: 'pointer', side: 'ct', code: 'c', replacement: 'd' },
    ],
  });

  const groups = getRelatedAccountGroups(data.trDocs, []);
  expect(
    groups.get('pointer')?.map(({ dt, ct }) => [dt.codes, ct.codes]),
  ).toEqual([
    [[], ['b', 'c']],
    [['a'], ['c']],
    [['a'], ['b']],
  ]);

  const payload = cleanTrDocs(data);
  expect(payload.map(({ relAccounts }) => relAccounts)).toEqual([
    { customCt: ['b', 'd'] },
    { customCt: ['d'] },
    undefined,
    undefined,
    undefined,
  ]);
  expect(payload[2].details[0].accountId).toBe('account-c');
  expect(payload[0]).not.toHaveProperty('relatedAccountReplacements');
});

it('includes matching generated entries and restores saved overrides', () => {
  const data = transactionGroupSchema.parse({
    date: new Date(),
    status: 'complete',
    trDocs: [
      {
        ...transaction('a', 'dt'),
        relAccounts: { ct: ['b', 'tax'], customCt: ['b', 'report-tax'] },
      },
      {
        ...transaction('b', 'ct'),
        relAccounts: { ct: ['old-tax'], customCt: ['old-tax'] },
      },
    ],
  });
  const generated: ITransaction[] = [
    { ...transaction('tax', 'ct'), originId: 'a' },
    { ...transaction('cost', 'ct', 'other'), originId: 'a' },
  ];

  const groups = getRelatedAccountGroups(data.trDocs, generated);
  expect(
    groups.get('pointer')?.map(({ accounts, ct }) => [accounts, ct.codes]),
  ).toEqual([
    [['a'], ['b', 'report-tax']],
    [['b'], ['tax']],
    [['tax'], ['b']],
  ]);
  expect(groups.has('other')).toBe(false);

  const relatedAccountReplacements = [
    {
      ptrId: 'pointer',
      side: 'ct' as const,
      code: 'tax',
      replacement: 'new-tax',
    },
    { ptrId: 'pointer', side: 'ct' as const, code: 'b', replacement: 'new-b' },
  ];
  const preview = getRelatedAccountGroups(
    data.trDocs,
    generated,
    relatedAccountReplacements,
  );
  expect(
    preview.get('pointer')?.find(({ transactionId }) => transactionId === 'tax')
      ?.ct.codes,
  ).toEqual(['b']);

  const payload = cleanTrDocs(
    { ...data, relatedAccountReplacements },
    generated,
  );
  expect(payload.map(({ relAccounts }) => relAccounts)).toEqual([
    { customCt: ['new-b', 'report-tax'] },
    { customCt: ['new-tax'] },
  ]);
});

it('adds distinct shared codes, skips the source account, and inherits a cleared side', () => {
  const data = transactionGroupSchema.parse({
    date: new Date(),
    status: 'complete',
    trDocs: [
      transaction('a', 'dt'),
      {
        ...transaction('b', 'ct'),
        relAccounts: { dt: ['a'], customDt: ['report-a'] },
      },
    ],
    relatedAccountReplacements: [
      { ptrId: 'pointer', side: 'dt', code: 'report-a', replacement: '' },
      { ptrId: 'pointer', side: 'ct', code: '', replacement: 'b' },
      { ptrId: 'pointer', side: 'ct', code: '', replacement: 'd' },
      { ptrId: 'pointer', side: 'ct', code: '', replacement: 'd' },
    ],
  });

  const groups = getRelatedAccountGroups(
    data.trDocs,
    [],
    data.relatedAccountReplacements,
  );
  expect(groups.get('pointer')?.[1].dt).toMatchObject({
    defaults: ['a'],
    codes: ['a'],
    differs: false,
  });
  expect(cleanTrDocs(data).map(({ relAccounts }) => relAccounts)).toEqual([
    { customCt: ['b', 'd'] },
    { customCt: ['d'] },
  ]);
});
