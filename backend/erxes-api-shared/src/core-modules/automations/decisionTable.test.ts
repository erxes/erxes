import {
  findDecisionTableRow,
  getDecisionCellError,
  matchesDecisionCell,
  TDecisionTableConfig,
  TDecisionTableInput,
  validateDecisionTableConfig,
} from './decisionTable';

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

const noSegments = async () => false;

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

  it('matches a list value when any item matches', () => {
    expect(matchesDecisionCell(category, 'road', ['light', 'road'])).toBe(true);
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

  it('asks for * instead of a blank cell', () => {
    expect(getDecisionCellError(category, ' ')).not.toBeNull();
  });
});

describe('validateDecisionTableConfig', () => {
  it('accepts a well-formed table', () => {
    expect(validateDecisionTableConfig(complaintTable)).toEqual([]);
  });

  it('reports cells and keys the table does not declare', () => {
    const errors = validateDecisionTableConfig({
      ...complaintTable,
      rows: [
        {
          id: 'r1',
          when: { category: 'park', ward: '1' },
          then: { cc: 'a@b.mn' },
        },
      ],
    });

    expect(errors).toEqual([
      'Row 1: "category": "park" is not one of its options',
      'Row 1: unknown input "ward"',
      'Row 1: unknown output "cc"',
    ]);
  });

  it('reports duplicate keys', () => {
    const errors = validateDecisionTableConfig({
      ...complaintTable,
      inputs: [khoroo, khoroo],
    });

    expect(errors).toContain('Input keys must be unique');
  });
});

describe('findDecisionTableRow', () => {
  it('returns the first row whose every cell matches', async () => {
    const match = await findDecisionTableRow({
      config: complaintTable,
      values: { category: 'road', khoroo: 13 },
      isInSegment: noSegments,
    });

    expect(match?.row.id).toBe('r3');
    expect(match?.rowIndex).toBe(2);
  });

  it('returns null when no row covers the values', async () => {
    const match = await findDecisionTableRow({
      config: complaintTable,
      values: { category: 'light', khoroo: 15 },
      isInSegment: noSegments,
    });

    expect(match).toBeNull();
  });

  it('does not let an empty input fall into a row that ignores it', async () => {
    const match = await findDecisionTableRow({
      config: complaintTable,
      values: { category: 'road', khoroo: '' },
      isInSegment: noSegments,
    });

    expect(match).toBeNull();
  });

  it('checks segments only for rows whose values already match', async () => {
    const asked: string[] = [];
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

    const match = await findDecisionTableRow({
      config,
      values: { category: 'road' },
      isInSegment: async (segmentId) => {
        asked.push(segmentId);
        return segmentId === 'seg-3';
      },
    });

    expect(match?.row.id).toBe('r2');
    expect(asked).toEqual(['seg-2', 'seg-3']);
  });
});
