/// <reference types="jest" />

import { IModels } from '~/connectionResolvers';
import { processVatRows } from '../processVatRows';

const queryResult = <T>(value: T) => ({
  lean: jest.fn().mockResolvedValue(value),
});

const ACCOUNTS: Record<string, string> = {
  '121004': 'vat-receivable',
  '311004': 'vat-payable',
};
const CATEGORIES: Record<string, string> = { '10': 'cash-category' };

const makeModels = () => ({
  Accounts: {
    findOne: jest.fn(({ code }: { code: string }) =>
      queryResult(ACCOUNTS[code] ? { _id: ACCOUNTS[code] } : null),
    ),
  },
  AccountCategories: {
    findOne: jest.fn(({ code }: { code: string }) =>
      queryResult(CATEGORIES[code] ? { _id: CATEGORIES[code] } : null),
    ),
  },
  VatRows: {
    find: jest.fn().mockReturnValue(queryResult([])),
    updateOne: jest.fn(),
    createVatRow: jest.fn(async (doc: Record<string, unknown>) => ({
      ...doc,
      _id: `row-${doc.number}`,
    })),
  },
});

const run = (models: ReturnType<typeof makeModels>, rows: object[]) =>
  processVatRows(
    'test',
    models as unknown as IModels,
    rows as Record<string, unknown>[],
  );

describe('processVatRows settlement columns', () => {
  it('resolves account and category codes in ledger formulas', async () => {
    const models = makeModels();
    const { successRows, errorRows } = await run(models, [
      {
        number: '105',
        kind: 'formula',
        value_side: 'credit',
        ledger_formulas: JSON.stringify([
          {
            kind: 'transaction',
            plusOrMinus: true,
            percent: '100',
            debitAccountCode: '311004',
            creditAccountCategoryCode: '10',
            getDate: 'between',
            valueSide: 'credit',
          },
        ]),
      },
    ]);

    expect(errorRows).toEqual([]);
    expect(successRows).toHaveLength(1);
    const doc = models.VatRows.createVatRow.mock.calls[0][0];
    expect(doc.valueSide).toBe('credit');
    expect(doc.ledgerFormulas).toEqual([
      expect.objectContaining({
        kind: 'transaction',
        debitAccountId: 'vat-payable',
        creditAccountCategoryId: 'cash-category',
        getDate: 'between',
        valueSide: 'credit',
      }),
    ]);
    expect(doc.ledgerFormulas[0]._id).toEqual(expect.any(String));
    expect(doc.ledgerFormulas[0]).not.toHaveProperty('debitAccountCode');
  });

  it('reports unknown codes and leaves formulas alone without the column', async () => {
    const models = makeModels();
    const { errorRows } = await run(models, [
      {
        number: '101',
        kind: 'formula',
        ledger_formulas:
          '[{"kind":"balance","debitAccountCode":"999","getDate":"first"}]',
      },
      { number: '5', kind: 'normal' },
    ]);

    expect(errorRows).toEqual([
      expect.objectContaining({ error: 'Account code 999 not found' }),
    ]);
    const doc = models.VatRows.createVatRow.mock.calls[0][0];
    expect(doc).not.toHaveProperty('ledgerFormulas');
    expect(doc).not.toHaveProperty('valueSide');
  });
});
