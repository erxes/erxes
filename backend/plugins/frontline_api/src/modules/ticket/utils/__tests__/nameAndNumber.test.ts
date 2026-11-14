import { IModels } from '~/connectionResolvers';
import { assignTicketNumber } from '@/ticket/utils/nameAndNumber';

type TPipelineRow = {
  _id: string;
  numberConfig?: string;
  numberSize?: string;
  lastNum?: string;
};

const fakeModels = (rows: TPipelineRow[]) => {
  const matches = (row: TPipelineRow, query: Record<string, unknown>) =>
    Object.entries(query).every(([key, value]) => {
      const field = row[key as keyof TPipelineRow];
      return value instanceof RegExp
        ? typeof field === 'string' && value.test(field)
        : field === value;
    });

  const Pipeline = {
    findOne: (query: Record<string, unknown>) => ({
      lean: async () => rows.find((row) => matches(row, query)) || null,
    }),
    updateMany: async (
      query: Record<string, unknown>,
      { $set }: { $set: Partial<TPipelineRow> },
    ) => {
      rows
        .filter((row) => matches(row, query))
        .forEach((row) => Object.assign(row, $set));
    },
  };

  return { Pipeline } as unknown as IModels;
};

const year = new Date().getFullYear();

describe('assignTicketNumber', () => {
  it('Starts a configured pipeline at zero and counts up', async () => {
    const rows: TPipelineRow[] = [
      { _id: 'p1', numberConfig: 'C{year}-', numberSize: '4' },
    ];
    const models = fakeModels(rows);

    expect(await assignTicketNumber(models, 'p1')).toBe(`C${year}-0000`);
    expect(await assignTicketNumber(models, 'p1')).toBe(`C${year}-0001`);
    expect(rows[0].lastNum).toBe(`C${year}-0001`);
  });

  it('Falls back to a timestamp without a number format', async () => {
    const models = fakeModels([{ _id: 'p1' }]);

    expect(await assignTicketNumber(models, 'p1')).toMatch(/^\d{13}$/);
    expect(await assignTicketNumber(models)).toMatch(/^\d{13}$/);
  });
});
