import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { IReportDocument, reportInputSchema } from '../../../@types/report';
import { reportDateMatch, reportPeriod } from '../period';
import { applyReportPercent, validateReportPercent } from '../percent';
import {
  calculateLedgerFormula,
  createReportLedger,
  selectReportAccounts,
} from '../ledger';
import { generateTunableReport, roundReportAmount } from '..';
import { generateFilter } from '../../../graphql/resolvers/queries/accounts';

jest.mock('../../../graphql/resolvers/queries/accounts', () => ({
  generateFilter: jest.fn().mockResolvedValue({ _id: { $in: ['a', 'b'] } }),
}));
const user = { _id: 'member' } as IUserDocument;
const definition = (): IReportDocument =>
  ({
    ...reportInputSchema.parse({
      code: 'R',
      name: 'Report',
      sections: [
        {
          _id: 's',
          columns: [{ _id: 'c', name: 'Closing', getDate: 'last' }],
          rows: [
            { _id: 'r', name: 'Balance' },
            { _id: 'copy' },
            { _id: 'ratio' },
            { _id: 'negative', kind: 'plus_formula' },
          ],
          formulas: [
            { _id: 'f', rowId: 'r', kind: 'balance', debitAccountId: 'a' },
            {
              _id: 'copy-f',
              rowId: 'copy',
              kind: 'from_row',
              source: { rowId: 'r' },
              percent: '50',
            },
            {
              _id: 'ratio-f',
              rowId: 'ratio',
              kind: 'ratio',
              source: { rowId: 'r' },
              ratioSource: { rowId: 'copy' },
            },
            {
              _id: 'negative-f',
              rowId: 'negative',
              kind: 'from_row',
              source: { rowId: 'r' },
              plusOrMinus: false,
            },
          ],
        },
      ],
    }),
    _id: 'report',
    version: 1,
  } as IReportDocument);
const settings = {
  fromDate: '2026-01-11',
  toDate: '2026-01-20',
  amountUnit: 'units' as const,
  decimals: 2,
};
const setup = () => {
  const aggregate = jest
    .fn()
    .mockResolvedValue([{ _id: 'a', amount: 123.456 }]);
  const accounts = [
    { _id: 'a', code: '101', categoryId: 'child', kind: 'active' },
    { _id: 'b', code: '201', categoryId: 'root', kind: 'passive' },
  ];
  const categories = [{ _id: 'root' }, { _id: 'child', parentId: 'root' }];
  const models = {
    Accounts: { find: jest.fn(() => ({ lean: async () => accounts })) },
    AccountCategories: {
      find: jest.fn(() => ({ lean: async () => categories })),
    },
    Transactions: { aggregate },
    Reports: { getReport: jest.fn() },
  } as unknown as IModels;
  return { models, aggregate, accounts, categories };
};

test('opening excludes start day; closing includes entire last day; previous period has equal inclusive length', () => {
  expect(
    reportDateMatch('2026-01-11', '2026-01-20', {
      getDate: 'first',
      isPre: false,
    }),
  ).toEqual({ $lt: new Date('2026-01-11T00:00:00Z') });
  expect(
    reportDateMatch('2026-01-11', '2026-01-20', {
      getDate: 'last',
      isPre: false,
    }),
  ).toEqual({ $lt: new Date('2026-01-21T00:00:00Z') });
  expect(
    reportDateMatch('2026-01-11', '2026-01-20', {
      getDate: 'between',
      isPre: true,
    }),
  ).toEqual({
    $gte: new Date('2026-01-01T00:00:00Z'),
    $lt: new Date('2026-01-11T00:00:00Z'),
  });
  expect(
    reportDateMatch('2024-03-01', '2024-03-01', {
      getDate: 'first',
      isPre: true,
    }),
  ).toEqual({ $lt: new Date('2024-02-29T00:00:00Z') });
});
test('previous period shifts whole months by months and other ranges by days', () => {
  const pre = (from: string, to: string) => {
    const { from: start, end } = reportPeriod(from, to, true);
    return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)];
  };
  expect(pre('2026-01-01', '2026-12-31')).toEqual(['2025-01-01', '2026-01-01']);
  expect(pre('2025-01-01', '2025-12-31')).toEqual(['2024-01-01', '2025-01-01']);
  expect(pre('2026-02-01', '2026-02-28')).toEqual(['2026-01-01', '2026-02-01']);
  expect(pre('2026-03-01', '2026-03-31')).toEqual(['2026-02-01', '2026-03-01']);
  expect(pre('2026-01-01', '2026-06-30')).toEqual(['2025-07-01', '2026-01-01']);
  expect(pre('2026-02-05', '2026-02-10')).toEqual(['2026-01-30', '2026-02-05']);
});
test('amounts round half away from zero at the requested unit and precision', () => {
  expect(roundReportAmount(1.005, { amountUnit: 'units', decimals: 2 })).toBe(
    1.01,
  );
  expect(roundReportAmount(-1.005, { amountUnit: 'units', decimals: 2 })).toBe(
    -1.01,
  );
  expect(
    roundReportAmount(123456.789, { amountUnit: 'thousands', decimals: 1 }),
  ).toBe(123500);
  expect(roundReportAmount(-0.001, { amountUnit: 'units', decimals: 2 })).toBe(
    0,
  );
});
test('percent rules support conditional/progressive values without executing text', () => {
  expect(applyReportPercent(200, 'if(value>100:[20])10')).toBe(30);
  expect(applyReportPercent(50, 'if(value>100:20)10')).toBe(5);
  expect(applyReportPercent(-20, '-50')).toBe(10);
  expect(() => validateReportPercent('process.exit()')).toThrow();
});
test('category selectors include descendants and deduplicate explicitly selected accounts', () => {
  const { accounts, categories } = setup();
  expect(selectReportAccounts(accounts, categories, 'a', 'root')).toHaveLength(
    2,
  );
});
test('calculates dependencies once from rounded amounts; ratios keep full precision; clamps positive-only rows', async () => {
  const { models, aggregate } = setup();
  const report = definition();
  report.sections[0].formulas[1].percent = '33';
  const result = await generateTunableReport(models, report, settings, user);
  // 33% of the rounded 123.46 is 40.7418 → 40.74; the ratio is unrounded.
  const [balance, copy, ratio, negative] = result.map((cell) => cell.value);
  expect([balance, copy, negative]).toEqual([123.46, 40.74, 0]);
  expect(ratio).toBeCloseTo(123.46 / 40.74, 12);
  expect(aggregate).toHaveBeenCalledTimes(1);
  expect(generateFilter).toHaveBeenCalledWith(
    models,
    { permissionMode: 'read' },
    user,
  );
  expect(models.Accounts.find).toHaveBeenCalledWith(
    { _id: { $in: ['a', 'b'] } },
    expect.any(Object),
  );
});
test('one balance aggregate per date window serves every formula; passive accounts reverse', async () => {
  const { models, aggregate, accounts, categories } = setup();
  aggregate.mockResolvedValue([
    { _id: 'a', amount: 80 },
    { _id: 'b', amount: -30 },
  ]);
  const ledger = createReportLedger(models, ['a', 'b']);
  const formula = definition().sections[0].formulas[0];
  const date = { $lt: new Date('2026-01-01T00:00:00Z') };
  const run = (debitAccountCategoryId?: string, debitAccountId = 'a') =>
    calculateLedgerFormula(
      ledger,
      { ...formula, debitAccountId, debitAccountCategoryId },
      accounts,
      categories,
      { ...date },
      'debit',
    );
  expect(await run('root')).toBe(110);
  expect(await run(undefined, 'b')).toBe(30);
  expect(aggregate).toHaveBeenCalledTimes(1);
  expect(aggregate.mock.calls[0][0].slice(1, 3)).toEqual([
    { $unwind: '$details' },
    { $match: { 'details.accountId': { $in: ['a', 'b'] } } },
  ]);
});
test('turnovers group by account, side and effective opposite codes without pointer grouping', async () => {
  const { models, aggregate, accounts, categories } = setup();
  aggregate.mockResolvedValue([
    { _id: { accountId: 'a', side: 'dt', related: ['201'] }, amount: 50 },
    { _id: { accountId: 'a', side: 'dt', related: ['999'] }, amount: 7 },
    { _id: { accountId: 'a', side: 'ct', related: ['201'] }, amount: 11 },
    { _id: { accountId: 'b', side: 'ct', related: ['101'] }, amount: 50 },
  ]);
  const ledger = createReportLedger(models, ['a', 'b']);
  const formula = {
    ...definition().sections[0].formulas[0],
    kind: 'transaction' as const,
  };
  const date = { $gte: new Date('2026-01-01T00:00:00Z') };
  const run = (side: 'debit' | 'credit', extra: Partial<typeof formula> = {}) =>
    calculateLedgerFormula(
      ledger,
      { ...formula, ...extra },
      accounts,
      categories,
      date,
      side,
    );
  expect(await run('debit', { creditAccountId: 'b' })).toBe(50);
  expect(await run('debit')).toBe(57);
  expect(
    await run('credit', { debitAccountId: 'a', creditAccountId: 'b' }),
  ).toBe(50);
  expect(await run('debit', { creditAccountId: 'missing' })).toBe(0);
  expect(aggregate).toHaveBeenCalledTimes(1);
  const pipeline = JSON.stringify(aggregate.mock.calls[0][0]);
  expect(pipeline).toContain('relAccounts.customCt');
  expect(pipeline).toContain('relAccounts.ct');
  expect(pipeline).not.toContain('ptrId');
});
test('transaction formulas reject opening or closing periods at run time', async () => {
  const { models } = setup();
  const report = definition();
  report.sections[0].formulas[0] = {
    ...report.sections[0].formulas[0],
    kind: 'transaction',
  };
  await expect(
    generateTunableReport(models, report, settings, user),
  ).rejects.toThrow('between period');
});
test('runtime guard rejects stale cycles and division by zero', async () => {
  const { models, aggregate } = setup();
  const report = definition();
  report.sections[0].formulas[0] = {
    ...report.sections[0].formulas[0],
    kind: 'from_row',
    source: { rowId: 'copy' },
  };
  await expect(
    generateTunableReport(models, report, settings, user),
  ).rejects.toThrow('Circular');
  aggregate.mockResolvedValue([]);
  await expect(
    generateTunableReport(models, definition(), settings, user),
  ).rejects.toThrow('divide by zero');
});

test('cross-report cell references reuse computed values and load the source report once', async () => {
  const { models, aggregate } = setup();
  const report = definition();
  const source = definition();
  source._id = 'source';
  source.sections[0].formulaType = 'cell';
  source.sections[0].formulas = [
    { ...source.sections[0].formulas[0], columnId: 'c' },
  ];
  report.sections[0].formulaType = 'cell';
  report.sections[0].formulas = report.sections[0].formulas.map((formula) => ({
    ...formula,
    columnId: 'c',
  }));
  report.sections[0].formulas[0] = {
    ...report.sections[0].formulas[0],
    kind: 'from_row',
    source: { reportId: source._id, sectionId: 's', rowId: 'r', columnId: 'c' },
  };
  const load = jest
    .spyOn(models.Reports, 'getReport')
    .mockResolvedValue(source);
  expect(
    (await generateTunableReport(models, report, settings, user)).map(
      (cell) => cell.value,
    ),
  ).toEqual([123.46, 61.73, 2, 0]);
  expect(load).toHaveBeenCalledTimes(1);
  expect(aggregate).toHaveBeenCalledTimes(1);
});
