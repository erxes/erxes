import type { IModels } from '~/connectionResolvers';
import type { IAdjustClosing } from '../../../@types/adjustClosingEntry';
import {
  loadAdjustClosingClass,
  type IAdjustClosingEntryModel,
} from '../AdjustClosing';

type TClosing = Pick<IAdjustClosing, 'status' | 'date' | 'beginDate'> & {
  _id: string;
};
type TRange = { $gt?: Date; $gte?: Date; $lt?: Date };
type TSelector = {
  _id?: string | { $ne: string };
  status?: string | { $ne?: string; $in?: string[] };
  date?: TRange;
};

const matchStatus = (status: string, filter: TSelector['status']) => {
  if (filter === undefined) return true;
  if (typeof filter === 'string') return status === filter;
  if (filter.$ne !== undefined && status === filter.$ne) return false;
  if (filter.$in && !filter.$in.includes(status)) return false;
  return true;
};

const matchDate = (date: Date, range?: TRange) =>
  !range ||
  ((!range.$gt || date > range.$gt) &&
    (!range.$gte || date >= range.$gte) &&
    (!range.$lt || date < range.$lt));

const matches = (row: TClosing, selector: TSelector) => {
  const { _id } = selector;
  if (typeof _id === 'string' && row._id !== _id) return false;
  if (typeof _id === 'object' && row._id === _id.$ne) return false;
  return (
    matchStatus(row.status || 'draft', selector.status) &&
    matchDate(row.date, selector.date)
  );
};

const closing = (_id: string, date: string, status: string): TClosing => ({
  _id,
  date: new Date(`${date}T00:00:00`),
  status: status as TClosing['status'],
});

const setup = (rows: TClosing[], firstTempTrDate?: string) => {
  const query = <T>(value: T) => ({
    lean: async () => value,
    sort: () => ({ lean: async () => value }),
  });
  const findOne = (selector: TSelector) =>
    query(
      rows
        .filter((row) => matches(row, selector))
        .sort((a, b) => b.date.getTime() - a.date.getTime())[0] || null,
    );
  const updateOne = jest.fn(
    async ({ _id }: { _id: string }, { $set }: { $set: Partial<TClosing> }) => {
      const row = rows.find((item) => item._id === _id);
      if (row) Object.assign(row, $set);
    },
  );
  const create = jest.fn(async (doc: TClosing) => doc);
  const deleteOne = jest.fn();
  const removePTransaction = jest.fn();
  const findByIdAndUpdate = jest.fn(
    (_id: string, { $set }: { $set: Partial<TClosing> }) => {
      const row = rows.find((item) => item._id === _id);
      if (row) Object.assign(row, $set);
      return query(row);
    },
  );
  const AdjustClosings = {
    findOne,
    updateOne,
    create,
    deleteOne,
    findByIdAndUpdate,
  };
  const models = {
    AdjustClosings,
    Accounts: { find: () => query([{ _id: 'temp' }]) },
    Transactions: {
      findOne: () =>
        query(
          firstTempTrDate
            ? { date: new Date(`${firstTempTrDate}T10:30:00`) }
            : null,
        ),
      removePTransaction,
    },
  } as unknown as IModels;

  const statics = loadAdjustClosingClass(models, 'test')
    .statics as unknown as IAdjustClosingEntryModel;
  Object.assign(AdjustClosings, statics);

  return {
    methods: statics,
    updateOne,
    create,
    deleteOne,
    rows,
    removePTransaction,
  };
};

const newClosing = (date: string) =>
  ({
    date: new Date(`${date}T00:00:00`),
    integrateAccountId: 'i',
    periodGLAccountId: 'p',
    earningAccountId: 'e',
    taxPayableAccountId: 't',
    createdBy: 'user',
  } as IAdjustClosing);

describe('adjust closing lifecycle rules', () => {
  it('begins the first closing on the earliest temporary account transaction date', async () => {
    const { methods, create } = setup([], '2026-02-14');

    await methods.createAdjustClosing(newClosing('2026-03-31'));

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        beginDate: new Date('2026-02-14T00:00:00'),
        status: 'draft',
      }),
    );
  });

  it('begins the day after the previous closing', async () => {
    const { methods, create } = setup(
      [closing('jan', '2026-01-31', 'publish')],
      '2025-06-01',
    );

    await methods.createAdjustClosing(newClosing('2026-02-28'));

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ beginDate: new Date('2026-02-01T00:00:00') }),
    );
  });

  it('rejects a new closing while any closing is not published', async () => {
    const { methods, create } = setup([
      closing('jan', '2026-01-31', 'complete'),
    ]);

    await expect(
      methods.createAdjustClosing(newClosing('2026-02-28')),
    ).rejects.toThrow('Previous Adjust Closing is not published yet');
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects a new closing dated on or before an existing closing', async () => {
    const { methods } = setup([closing('feb', '2026-02-28', 'publish')]);

    await expect(
      methods.createAdjustClosing(newClosing('2026-02-28')),
    ).rejects.toThrow('A later closing adjustment already exists.');
  });

  it('keeps a published closing when a later closing is published', async () => {
    const { methods, rows } = setup([
      closing('jan', '2026-01-31', 'publish'),
      closing('feb', '2026-02-28', 'publish'),
    ]);

    await expect(methods.cancelAdjustClosing('jan', 'user')).rejects.toThrow(
      'A later closing adjustment already exists.',
    );
    expect(rows[0].status).toBe('publish');
  });

  it('reopens a published closing when no later closing is published', async () => {
    const { methods, rows } = setup([
      closing('jan', '2026-01-31', 'publish'),
      closing('feb', '2026-02-28', 'draft'),
    ]);

    await methods.cancelAdjustClosing('jan', 'user');

    expect(rows[0].status).toBe('complete');
  });

  it('rejects publishing while an earlier closing is not published', async () => {
    const { methods, rows } = setup([
      closing('jan', '2026-01-31', 'complete'),
      closing('feb', '2026-02-28', 'complete'),
    ]);

    await expect(methods.publishAdjustClosing('feb')).rejects.toThrow(
      'Adjust Closing must be published in order',
    );
    expect(rows[1].status).toBe('complete');
  });

  it('publishes a completed closing after earlier ones are published', async () => {
    const { methods, rows } = setup([
      closing('jan', '2026-01-31', 'publish'),
      closing('feb', '2026-02-28', 'complete'),
    ]);

    await methods.publishAdjustClosing('feb');

    expect(rows[1].status).toBe('publish');
  });

  it('rejects publishing a closing without completed transactions', async () => {
    const { methods } = setup([closing('feb', '2026-02-28', 'process')]);

    await expect(methods.publishAdjustClosing('feb')).rejects.toThrow(
      'Only completed Adjust Closing can be published',
    );
  });

  it('never removes a published closing', async () => {
    const { methods, deleteOne } = setup([
      closing('jan', '2026-01-31', 'publish'),
    ]);

    await expect(methods.removeAdjustClosing('jan')).rejects.toThrow(
      'Published Adjust Closing cannot be removed',
    );
    expect(deleteOne).not.toHaveBeenCalled();
  });

  it('clears completed closing transactions back to process', async () => {
    const { methods, rows, removePTransaction } = setup(
      [
        {
          ...closing('jan', '2026-01-31', 'complete'),
          closePeriodTrId: 'parent',
        } as TClosing,
      ],
      '2026-01-05',
    );

    await methods.clearAdjustClosingTransactions('jan', 'user');

    expect(removePTransaction).toHaveBeenCalledWith({ parentId: 'parent' });
    expect(rows[0]).toMatchObject({ status: 'process', closePeriodTrId: '' });
  });

  it('clears transactions only from a completed latest closing', async () => {
    const { methods } = setup([
      closing('jan', '2026-01-31', 'publish'),
      closing('feb', '2026-02-28', 'process'),
    ]);

    await expect(
      methods.clearAdjustClosingTransactions('jan', 'user'),
    ).rejects.toThrow('Published Adjust Closing cannot be edited');
    await expect(
      methods.clearAdjustClosingTransactions('feb', 'user'),
    ).rejects.toThrow(
      'Only completed Adjust Closing transactions can be cleared',
    );
  });

  it('removes only the latest unpublished closing', async () => {
    const { methods, deleteOne } = setup([
      closing('jan', '2026-01-31', 'complete'),
      closing('feb', '2026-02-28', 'draft'),
    ]);

    await expect(methods.removeAdjustClosing('jan')).rejects.toThrow(
      'Only the latest Adjust Closing can be removed',
    );
    await methods.removeAdjustClosing('feb');
    expect(deleteOne).toHaveBeenCalledWith({ _id: 'feb' });
  });
});
