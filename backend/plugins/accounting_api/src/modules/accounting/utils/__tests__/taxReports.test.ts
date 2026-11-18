/// <reference types="jest" />

import { JOURNALS } from '../../@types/constants';
import {
  calculateTaxReport,
  getTaxSide,
  getTaxTransactionAmounts,
  ITaxReportRowDoc,
} from '../taxReports/calculation';
import {
  calculateTaxRowValues,
  evaluateTaxFormula,
  expandTaxFormulaRanges,
} from '../taxReports/formula';
import { getLedgerDateMatch } from '../taxReports';
import { cleanTaxRowReportFields } from '../taxReports/rowValidation';

jest.mock('erxes-api-shared/utils', () => ({
  escapeRegExp: (value: string) => value,
  getPureDate: (value: Date) => value,
  sendTRPCMessage: jest.fn(),
}));

const row = (
  number: string,
  kind: string,
  formula = '',
  percent = 10,
  extra: Partial<ITaxReportRowDoc> = {},
): ITaxReportRowDoc => ({
  _id: `row-${number}`,
  number,
  name: `Row ${number}`,
  kind,
  formula,
  percent,
  ...extra,
});

const valueOf = (
  records: ReturnType<typeof calculateTaxReport>,
  number: string,
) => records.find((record) => record.number === number)?.value;

describe('tax row formulas', () => {
  it('expands Erkhet number ranges as a grouped sum', () => {
    expect(expandTaxFormulaRanges('10 * (3541..3543)')).toBe(
      '10 * (({3541} + {3542} + {3543}))',
    );
    expect(evaluateTaxFormula('2 * 1..3', (ref) => Number(ref))).toBe(12);    expect(expandTaxFormulaRanges('{1} + 5 .. 6 - 7..7')).toBe(
      '{1} + ({5} + {6}) - ({7})',
    );
    expect(expandTaxFormulaRanges('1...3 + a..b')).toBe('1...3 + a..b');
    expect(() => expandTaxFormulaRanges('9..2')).toThrow(
      'Invalid tax row range: 9..2',
    );
  });

  it('respects precedence, unary minus and parentheses', () => {
    const refs: Record<string, number> = { '60': 5, '61': 8 };
    expect(evaluateTaxFormula('-({60} - {61})', (ref) => refs[ref])).toBe(3);
    expect(evaluateTaxFormula('({48} + {49}) / 10', () => 50)).toBe(10);
  });

  it('rejects code and malformed input', () => {
    expect(() => evaluateTaxFormula('process.exit()', () => 0)).toThrow(
      'Unsupported character',
    );
    expect(() => evaluateTaxFormula('(1 + 2', () => 0)).toThrow(
      'Missing closing parenthesis',
    );
    expect(() => evaluateTaxFormula('{1} / 0', () => 1)).toThrow(
      'Division by zero',
    );
  });

  it('reads its own posted value on self reference and reports cycles', () => {
    const values = calculateTaxRowValues(
      [row('5', 'normal', '{5} * 10'), row('4', 'formula', '5..5')],
      new Map([['5', 7]]),
    );
    expect(values.get('5')).toBe(70);
    expect(values.get('4')).toBe(70);

    expect(() =>
      calculateTaxRowValues(
        [row('1', 'formula', '{2}'), row('2', 'formula', '{1}')],
        new Map(),
      ),
    ).toThrow('circular formula reference');
  });

  it('adds account formula amounts and keeps settlement rows non-negative', () => {
    const values = calculateTaxRowValues(
      [
        row('63', 'formula', '-({60})'),
        row('60', 'normal'),
        row('103', 'formula', '{63}', 10, { valueSide: 'credit' }),
        row('115', 'formula', '', 10, { valueSide: 'credit' }),
      ],
      new Map([['60', 40]]),
      new Map([
        ['103', 15],
        ['115', -20],
      ]),
    );

    expect(values.get('63')).toBe(-40);
    expect(values.get('103')).toBe(0);
    expect(values.get('115')).toBe(0);
  });
});

describe('tax transaction amounts', () => {
  it('uses the saved amount as net when tax is on the same side', () => {
    expect(getTaxSide(JOURNALS.INV_SALE, 'ct')).toBe('ct');
    expect(
      getTaxTransactionAmounts(
        'vat',
        {
          _id: 'tr',
          journal: JOURNALS.INV_SALE,
          side: 'ct',
          details: [{ amount: 1000 }, { amount: 500, excludeVat: true }],
        },
        { side: 'ct', details: [{ amount: 100 }] },
      ),
    ).toEqual({ taxSide: 'ct', tax: 100, pure: 1000 });
  });

  it('removes both taxes from gross amounts on the opposite side', () => {
    const tr = {
      _id: 'tr',
      journal: JOURNALS.CASH,
      side: 'dt',
      details: [{ amount: 1120 }],
    };
    const vatTr = { side: 'ct', details: [{ amount: 100 }] };
    const ctaxTr = { side: 'ct', details: [{ amount: 20 }] };

    expect(getTaxSide(JOURNALS.CASH, 'dt')).toBe('ct');
    expect(getTaxTransactionAmounts('vat', tr, vatTr, ctaxTr)).toEqual({
      taxSide: 'ct',
      tax: 100,
      pure: 1000,
    });
    expect(getTaxTransactionAmounts('ctax', tr, ctaxTr, vatTr)).toEqual({
      taxSide: 'ct',
      tax: 20,
      pure: 1000,
    });
  });

  it('derives the side from the journal when 0% rows create no tax entry', () => {
    expect(
      getTaxTransactionAmounts('vat', {
        _id: 'tr',
        journal: JOURNALS.PAYABLE,
        side: 'ct',
        details: [{ amount: 3000 }],
      }),
    ).toEqual({ taxSide: 'dt', tax: 0, pure: 3000 });
  });
});

describe('calculateTaxReport', () => {
  const vatRows = [
    row('4', 'formula', '5..5'),
    row('5', 'normal', '{5} * 10'),
    row('35', 'normal', '{35} * 10 + 10 * (3541..3542)'),
    row('3541', 'hidden', '', 0),
    row('3542', 'hidden', '', 0),
    row('41', 'normal', '{41} + {3541}'),
    row('54', 'title'),
  ];

  it('builds bases and non-deductible VAT from hidden 0% rows', () => {
    const records = calculateTaxReport(
      'vat',
      vatRows,
      [
        {
          _id: 'import',
          journal: JOURNALS.INV_INCOME,
          side: 'dt',
          vatRowId: 'row-35',
          details: [{ amount: 2000 }],
        },
        {
          _id: 'car',
          journal: JOURNALS.INV_INCOME,
          side: 'dt',
          vatRowId: 'row-3541',
          details: [{ amount: 5000 }],
        },
      ],
      [
        {
          originId: 'import',
          originType: 'vat',
          side: 'dt',
          details: [{ amount: 200 }],
        },
      ],
    );

    expect(valueOf(records, '35')).toBe(7000);
    expect(valueOf(records, '41')).toBe(500);
    expect(records.some((record) => record.kind === 'hidden')).toBe(false);
    expect(valueOf(records, '54')).toBe(0);
  });

  it('nets returns on the opposite side of the same row', () => {
    const records = calculateTaxReport(
      'vat',
      vatRows,
      [
        {
          _id: 'sale',
          journal: JOURNALS.INV_SALE,
          side: 'ct',
          vatRowId: 'row-5',
          details: [{ amount: 1000 }],
        },
        {
          _id: 'return',
          journal: JOURNALS.INV_SALE_RETURN,
          side: 'dt',
          vatRowId: 'row-5',
          details: [{ amount: 300 }],
        },
      ],
      [
        {
          originId: 'sale',
          originType: 'vat',
          side: 'ct',
          details: [{ amount: 100 }],
        },
        {
          originId: 'return',
          originType: 'vat',
          side: 'dt',
          details: [{ amount: 30 }],
        },
      ],
    );

    expect(valueOf(records, '5')).toBe(700);
    expect(valueOf(records, '4')).toBe(700);
  });

  it('reports city tax from ctax rows and their follow entries', () => {
    const records = calculateTaxReport(
      'ctax',
      [row('1', 'normal', '', 2, { valueSide: '' })],
      [
        {
          _id: 'sale',
          journal: JOURNALS.INV_SALE,
          side: 'ct',
          ctaxRowId: 'row-1',
          details: [{ amount: 1000 }],
        },
      ],
      [
        {
          originId: 'sale',
          originType: 'ctax',
          side: 'ct',
          details: [{ amount: 20 }],
        },
      ],
    );

    expect(valueOf(records, '1')).toBe(20);
  });
});

describe('tax report helpers', () => {
  it('maps account formula periods to ledger date windows', () => {
    const from = new Date('2026-10-01');
    const to = new Date('2026-10-31');

    expect(getLedgerDateMatch('first', from, to)).toEqual({ $lt: from });
    expect(getLedgerDateMatch('last', from, to)).toEqual({ $lte: to });
    expect(getLedgerDateMatch('between', from, to)).toEqual({
      $gte: from,
      $lte: to,
    });
  });

  it('validates submitted formulas, settlement column and account formulas', () => {
    expect(() => cleanTaxRowReportFields({ formula: '{1} +' })).toThrow(
      'Invalid formula',
    );
    expect(() =>
      cleanTaxRowReportFields({
        valueSide: 'side' as unknown as 'debit',
      }),
    ).toThrow('Invalid settlement column');
    expect(() =>
      cleanTaxRowReportFields({
        ledgerFormulas: [
          {
            _id: 'f',
            kind: 'balance',
            getDate: 'first',
            percent: '100',
            plusOrMinus: true,
          },
        ],
      }),
    ).toThrow('choose an account');
    expect(
      cleanTaxRowReportFields({
        ledgerFormulas: [
          {
            _id: 'f',
            kind: 'balance',
            getDate: 'first',
            percent: '100',
            plusOrMinus: false,
            debitAccountId: 'acc',
            creditAccountId: '',
          },
        ],
      }).ledgerFormulas?.[0],
    ).toEqual({
      _id: 'f',
      kind: 'balance',
      getDate: 'first',
      percent: '100',
      plusOrMinus: false,
      debitAccountId: 'acc',
      creditAccountId: undefined,
      debitAccountCategoryId: undefined,
      creditAccountCategoryId: undefined,
    });
  });
});
