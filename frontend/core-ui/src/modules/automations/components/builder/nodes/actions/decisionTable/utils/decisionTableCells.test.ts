import { analyzeDecisionTable } from './analyzeDecisionTable';
import {
  findDecisionTableRowIndex,
  getDecisionCellError,
  matchesDecisionCell,
  TDecisionTableConfig,
  TDecisionTableInput,
} from './decisionTableCells';

// Same cases as erxes-api-shared decisionTable.test.ts; keep them in step

const khoroo: TDecisionTableInput = {
  key: 'khoroo',
  type: 'number',
  value: '',
  options: [],
  range: [1, 24],
};

const category: TDecisionTableInput = {
  key: 'category',
  type: 'option',
  value: '',
  options: ['light', 'waste', 'road'],
};

const branch: TDecisionTableInput = {
  key: 'branch',
  type: 'segment',
  value: '',
  options: [],
};

const complaintTable: TDecisionTableConfig = {
  inputs: [category, khoroo],
  outputs: [{ key: 'assigneeId', type: 'user' }],
  rows: [
    {
      id: 'r1',
      when: { category: 'light', khoroo: '1-13, 20, 21' },
      then: { assigneeId: 'max-voltage' },
    },
    {
      id: 'r2',
      when: { category: 'waste', khoroo: '17-19,23,24' },
      then: { assigneeId: 'naishi' },
    },
    { id: 'r3', when: { category: 'road' }, then: { assigneeId: 'road-team' } },
  ],
  noMatch: { mode: 'default', then: { assigneeId: 'dispatcher' } },
};

describe('matchesDecisionCell', () => {
  it('matches numbers against lists and ranges', () => {
    expect(matchesDecisionCell(khoroo, '1-6, 20', 4)).toBe(true);
    expect(matchesDecisionCell(khoroo, '1-6, 20', '20')).toBe(true);
    expect(matchesDecisionCell(khoroo, '1-6, 20', 7)).toBe(false);
  });

  it('compares text without case or surrounding space', () => {
    expect(matchesDecisionCell(category, 'Light, road', ' light ')).toBe(true);
    expect(matchesDecisionCell(category, 'light', 'waste')).toBe(false);
  });

  it('never matches an empty value, not even with *', () => {
    expect(matchesDecisionCell(khoroo, '*', '')).toBe(false);
    expect(matchesDecisionCell(khoroo, '*', null)).toBe(false);
    expect(matchesDecisionCell(khoroo, '*', 5)).toBe(true);
  });

  it('does not match a number cell with a non-numeric value', () => {
    expect(matchesDecisionCell(khoroo, '1-24', '13-р хороо')).toBe(false);
  });
});

describe('getDecisionCellError', () => {
  it('rejects malformed and reversed ranges', () => {
    expect(getDecisionCellError(khoroo, '1-6,,20')).toBeNull();
    expect(getDecisionCellError(khoroo, '6-1')).not.toBeNull();
    expect(getDecisionCellError(khoroo, '1-2-3')).not.toBeNull();
    expect(getDecisionCellError(khoroo, 'abc')).not.toBeNull();
  });

  it('rejects numbers outside the declared range', () => {
    expect(getDecisionCellError(khoroo, '20-30')).not.toBeNull();
  });

  it('rejects options the input does not declare', () => {
    expect(getDecisionCellError(category, 'light, park')).not.toBeNull();
  });
});

describe('findDecisionTableRowIndex', () => {
  it('returns the first row whose every cell matches', () => {
    expect(
      findDecisionTableRowIndex(
        complaintTable,
        { category: 'road', khoroo: 13 },
        new Set(),
      ),
    ).toBe(2);
  });

  it('returns -1 when no row covers the values', () => {
    expect(
      findDecisionTableRowIndex(
        complaintTable,
        { category: 'light', khoroo: 15 },
        new Set(),
      ),
    ).toBe(-1);
  });

  it('does not let an empty input fall into a row that ignores it', () => {
    expect(
      findDecisionTableRowIndex(
        complaintTable,
        { category: 'road', khoroo: '' },
        new Set(),
      ),
    ).toBe(-1);
  });

  it('matches a segment cell when the record is in any listed segment', () => {
    const config: TDecisionTableConfig = {
      inputs: [category, branch],
      outputs: [{ key: 'stageId', type: 'text' }],
      rows: [
        { id: 'r1', when: { category: 'waste', branch: 'seg-1' }, then: {} },
        {
          id: 'r2',
          when: { category: 'road', branch: 'seg-2, seg-3' },
          then: {},
        },
      ],
      noMatch: { mode: 'fail' },
    };

    expect(
      findDecisionTableRowIndex(
        config,
        { category: 'road' },
        new Set(['seg-3']),
      ),
    ).toBe(1);
  });
});

describe('analyzeDecisionTable', () => {
  it('lists the values no row covers, grouped and compressed', () => {
    const { gaps } = analyzeDecisionTable(complaintTable);

    expect(gaps).toEqual([
      {
        fixed: [{ key: 'category', value: 'light' }],
        key: 'khoroo',
        values: '14–19, 22–24',
      },
      {
        fixed: [{ key: 'category', value: 'waste' }],
        key: 'khoroo',
        values: '1–16, 20–22',
      },
    ]);
  });

  it('flags a row an earlier row already covers', () => {
    const { unreachableRows } = analyzeDecisionTable({
      ...complaintTable,
      rows: [
        { id: 'r1', when: { category: 'light', khoroo: '1-6' }, then: {} },
        { id: 'r2', when: { category: 'light', khoroo: '7-13' }, then: {} },
        { id: 'r3', when: { category: 'light', khoroo: '2, 5' }, then: {} },
        { id: 'r4', when: { category: '*', khoroo: '*' }, then: {} },
        { id: 'r5', when: { category: 'road', khoroo: '2' }, then: {} },
      ],
    });

    expect(unreachableRows).toEqual([
      { row: 3, coveredBy: 1 },
      { row: 5, coveredBy: 4 },
    ]);
  });
});
