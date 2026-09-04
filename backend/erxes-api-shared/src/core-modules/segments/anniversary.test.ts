import { segmentFieldRef } from './nodeRefs';
import { SegmentOperator } from './operators';
import { decideSegmentNode } from './evaluate';
import { SegmentFieldMeta } from './fieldMeta';
import { compileSegmentMongoFilter } from './mongoFilter';
import { SegmentNode } from './nodes';

const TYPE = 'core:contacts.customers';
const UB = 'Asia/Ulaanbaatar';

const NOW = new Date('2026-08-31T15:19:00.000Z');

const fields: SegmentFieldMeta[] = [
  {
    key: 'birthDate',
    label: 'Birth date',
    kind: 'projected',
    path: 'birthDate',
    operators: [],
    input: 'date',
  },
];

const node = (operator: SegmentOperator, value?: number): SegmentNode => ({
  kind: 'field',
  contentType: TYPE,
  fieldKey: 'birthDate',
  operator,
  value,
});

const queryMatches = (tree: SegmentNode, birthDate: Date): boolean => {
  const { filter, unsupported } = compileSegmentMongoFilter(tree, {
    fields,
    now: NOW,
    timeZone: UB,
  });

  expect(unsupported).toEqual([]);

  const branches = (filter.$or || [filter]) as Record<string, unknown>[];

  return branches.some((branch) => {
    const range = branch.birthDate as { $gte: Date; $lt: Date };

    return birthDate >= range.$gte && birthDate < range.$lt;
  });
};

const decideMatches = (tree: SegmentNode, birthDate: Date): boolean =>
  decideSegmentNode(tree, {
    subjectType: TYPE,
    values: new Map([
      [
        segmentFieldRef({ contentType: TYPE, fieldKey: 'birthDate' }),
        birthDate,
      ],
    ]),
    now: NOW,
    timeZone: UB,
  }) === 'matched';

const bothAgree = (tree: SegmentNode, birthDate: Date): boolean => {
  const queried = queryMatches(tree, birthDate);

  expect(decideMatches(tree, birthDate)).toBe(queried);

  return queried;
};

describe('anniversary operators', () => {
  it('matches a birthday falling on the local day', () => {
    const tree = node(SegmentOperator.AnniversaryToday);

    expect(bothAgree(tree, new Date('1988-08-30T16:00:00Z'))).toBe(true);
    expect(bothAgree(tree, new Date('2004-08-30T20:00:00Z'))).toBe(true);
    expect(bothAgree(tree, new Date('1988-08-31T16:00:00Z'))).toBe(false);
  });

  it('counts forward to a birthday still to come', () => {
    const tree = node(SegmentOperator.AnniversaryFromNow, 7);

    expect(bothAgree(tree, new Date('1990-09-06T16:00:00Z'))).toBe(true);
    expect(bothAgree(tree, new Date('1990-09-05T16:00:00Z'))).toBe(false);
  });

  it('counts back to a birthday already past', () => {
    const tree = node(SegmentOperator.AnniversaryAgo, 30);

    expect(bothAgree(tree, new Date('1995-07-31T16:00:00Z'))).toBe(true);
    expect(bothAgree(tree, new Date('1995-08-01T16:00:00Z'))).toBe(false);
  });

  it('reads an old date against the offset that was in force then', () => {
    const tree = node(SegmentOperator.AnniversaryAgo, 30);

    expect(bothAgree(tree, new Date('1975-07-31T17:00:00Z'))).toBe(true);
    expect(bothAgree(tree, new Date('1975-07-31T16:00:00Z'))).toBe(false);
  });

  it('is undecidable neither way when the date is unset', () => {
    const tree = node(SegmentOperator.AnniversaryToday);

    expect(
      decideSegmentNode(tree, {
        subjectType: TYPE,
        values: new Map(),
        now: NOW,
        timeZone: UB,
      }),
    ).toBe('notMatched');
  });

  it('needs an amount for the counted forms', () => {
    expect(
      decideMatches(
        node(SegmentOperator.AnniversaryFromNow),
        new Date('1990-08-30T16:00:00Z'),
      ),
    ).toBe(false);
  });
});
