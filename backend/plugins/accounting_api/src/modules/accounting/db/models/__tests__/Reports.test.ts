import { Mongoose, Schema } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  reportInputSchema,
  IReportDocument,
  IReportDefinition,
} from '../../../@types/report';
import { loadReportClass, IReportModel } from '../Reports';

jest.mock('erxes-api-shared/utils', () => {
  let sequence = 0;
  return {
    mongooseStringRandomId: {
      type: String,
      default: () => `report-${++sequence}`,
    },
    schemaWrapper: (schema: Schema): Schema => schema,
    escapeRegExp: (value: string): string =>
      value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  };
});

const input = () =>
  reportInputSchema.parse({
    code: 'R',
    name: 'Report',
    sections: [
      {
        _id: 's',
        name: 'S',
        columns: [{ _id: 'c', name: 'C', getDate: 'last' }],
        rows: [{ _id: 'r', name: 'R' }],
        formulas: [],
      },
    ],
  });
const setup = () => {
  const mongoose = new Mongoose();
  // The registry is filled after schema compilation, as in connectionResolvers.
  const models = {} as IModels;
  const sendDbEventLog = jest.fn();
  models.Reports = mongoose.model<IReportDocument, IReportModel>(
    'ReportsLifecycleTest',
    loadReportClass(models, {
      sendDbEventLog,
      sendAutomationTriggerTarget: jest.fn(),
      createActivityLog: jest.fn(),
      sendNotificationMessage: jest.fn(),
    }),
  );
  const Reports = models.Reports;
  const existing = new Reports({ ...input(), _id: 'saved', version: 4 });
  const find = jest.spyOn(Reports, 'find').mockReturnValue({
    lean: jest.fn().mockResolvedValue([]),
  } as unknown as ReturnType<typeof Reports.find>);
  jest.spyOn(Reports, 'findOne').mockResolvedValue(null);
  return { Reports, existing, find, sendDbEventLog };
};
afterEach(() => jest.restoreAllMocks());

test('create validates and persists a definition with actor metadata and a log', async () => {
  const { Reports, sendDbEventLog } = setup();
  const saved = new Reports({ ...input(), _id: 'created', version: 1 });
  const create = jest
    .spyOn(Reports, 'create')
    .mockResolvedValue(saved as never);
  await expect(Reports.saveReport(input(), 'member')).resolves.toBe(saved);
  expect(create).toHaveBeenCalledWith(
    expect.objectContaining({
      code: 'R',
      version: 1,
      createdBy: 'member',
      modifiedBy: 'member',
    }),
  );
  expect(sendDbEventLog).toHaveBeenCalledWith(
    expect.objectContaining({ action: 'create', docId: 'created' }),
  );
});
test('rejects a stale version before writing', async () => {
  const { Reports, existing } = setup();
  jest.spyOn(Reports, 'getReport').mockResolvedValue(existing);
  const update = jest.spyOn(Reports, 'findOneAndUpdate');
  await expect(
    Reports.saveReport(input(), 'member', 'saved', 3),
  ).rejects.toThrow('Reload');
  expect(update).not.toHaveBeenCalled();
});
test('update uses a compare-and-set version and handles a concurrent save', async () => {
  const { Reports, existing, sendDbEventLog } = setup();
  jest.spyOn(Reports, 'getReport').mockResolvedValue(existing);
  const update = jest
    .spyOn(Reports, 'findOneAndUpdate')
    .mockResolvedValue(null);
  await expect(
    Reports.saveReport(input(), 'member', 'saved', 4),
  ).rejects.toThrow('Reload');
  expect(update).toHaveBeenCalledWith(
    { _id: 'saved', version: 4 },
    expect.objectContaining({ $inc: { version: 1 } }),
    { new: true, runValidators: true },
  );
  expect(sendDbEventLog).not.toHaveBeenCalled();
});
test('rejects removal when another report references it', async () => {
  const { Reports, find } = setup();
  const dependent: IReportDefinition = {
    ...input(),
    _id: 'dependent',
    version: 1,
  };
  dependent.sections[0].formulas.push({
    _id: 'f',
    rowId: 'r',
    kind: 'from_row',
    plusOrMinus: true,
    percent: '100',
    ratioRule: 'divide',
    source: { reportId: 'saved', sectionId: 's', rowId: 'r' },
  });
  find.mockReturnValue({
    lean: jest.fn().mockResolvedValue([dependent]),
  } as unknown as ReturnType<typeof Reports.find>);
  const remove = jest.spyOn(Reports, 'findOneAndDelete');
  await expect(Reports.removeReport('saved', 4)).rejects.toThrow('missing');
  expect(remove).not.toHaveBeenCalled();
});
test('removes only the requested version and logs the deleted snapshot', async () => {
  const { Reports, existing, sendDbEventLog } = setup();
  const remove = jest
    .spyOn(Reports, 'findOneAndDelete')
    .mockResolvedValue(existing);
  await expect(Reports.removeReport('saved', 4)).resolves.toBe(true);
  expect(remove).toHaveBeenCalledWith({ _id: 'saved', version: 4 });
  expect(sendDbEventLog).toHaveBeenCalledWith(
    expect.objectContaining({
      action: 'delete',
      docId: 'saved',
      prevDocument: expect.objectContaining({ _id: 'saved' }),
    }),
  );
});

test('saves a report whose section has no name', async () => {
  const { Reports } = setup();
  const values = input();
  values.sections[0].name = '';
  const saved = new Reports({ ...values, _id: 'unnamed-section', version: 1 });
  expect(saved.validateSync()).toBeUndefined();
  const create = jest
    .spyOn(Reports, 'create')
    .mockResolvedValue(saved as never);
  await expect(Reports.saveReport(values, 'member')).resolves.toBe(saved);
  expect(create).toHaveBeenCalledWith(
    expect.objectContaining({
      sections: expect.arrayContaining([expect.objectContaining({ name: '' })]),
    }),
  );
});

test('generate loads a tenant report with validated run settings and does not persist results', async () => {
  const { Reports, existing } = setup();
  const read = jest.spyOn(Reports, 'getReport').mockResolvedValue(existing);
  const create = jest.spyOn(Reports, 'create');
  const update = jest.spyOn(Reports, 'findOneAndUpdate');
  const result = await Reports.generateReport({
    _id: 'saved',
    fromDate: '2026-01-01',
    toDate: '2026-12-31',
    amountUnit: 'thousands',
    decimals: 0,
  });
  expect(read).toHaveBeenCalledWith('saved');
  expect(result).toEqual({
    report: existing,
    fromDate: '2026-01-01',
    toDate: '2026-12-31',
    amountUnit: 'thousands',
    decimals: 0,
    cells: [],
  });
  expect(create).not.toHaveBeenCalled();
  expect(update).not.toHaveBeenCalled();
});
test.each([
  { fromDate: '2026-02-30' },
  { toDate: '2025-12-31' },
  { decimals: 7 },
])(
  'generate rejects invalid run settings before loading the report: %p',
  async (invalid) => {
    const { Reports } = setup();
    const read = jest.spyOn(Reports, 'getReport');
    await expect(
      Reports.generateReport({
        _id: 'saved',
        fromDate: '2026-01-01',
        toDate: '2026-12-31',
        ...invalid,
      }),
    ).rejects.toThrow();
    expect(read).not.toHaveBeenCalled();
  },
);
