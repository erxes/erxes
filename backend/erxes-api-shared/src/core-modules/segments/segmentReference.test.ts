import { segmentReferenceRef } from './nodeRefs';
import { collectSegmentReferences } from './walkNodes';
import { segmentDependencies, segmentDependencyKey } from './dependencies';
import { decideSegmentNode } from './evaluate';
import { splitSegmentFieldRequests } from './fieldRequests';
import { compileSegmentMongoFilter } from './mongoFilter';
import { SEGMENT_MEMBERSHIP_FIELD, SegmentNode } from './nodes';
import { buildSegmentEvaluationPlan } from './plan';

const SUBJECT = 'core:contacts.customers';
const REF = segmentReferenceRef(SUBJECT);

const reference = (segmentId: string, exclude?: boolean): SegmentNode => ({
  kind: 'segment',
  segmentId,
  ...(exclude ? { exclude } : {}),
});

const decide = (node: SegmentNode, memberships: string[] | undefined) =>
  decideSegmentNode(node, {
    subjectType: SUBJECT,
    values: new Map(memberships === undefined ? [] : [[REF, memberships]]),
  });

describe('a segment used as a condition', () => {
  it('matches a record carrying the referenced id', () => {
    expect(decide(reference('vip'), ['vip', 'other'])).toBe('matched');
    expect(decide(reference('vip'), ['other'])).toBe('notMatched');
  });

  it('reads a record with no membership at all as outside it', () => {
    expect(decide(reference('vip'), undefined)).toBe('notMatched');
    expect(decide(reference('vip', true), undefined)).toBe('matched');
  });

  it('inverts when excluded', () => {
    expect(decide(reference('vip', true), ['vip'])).toBe('notMatched');
    expect(decide(reference('vip', true), ['other'])).toBe('matched');
  });

  it('stays undecided when the membership could not be read', () => {
    expect(
      decideSegmentNode(reference('vip'), {
        subjectType: SUBJECT,
        values: new Map(),
        unavailable: new Set([REF]),
      }),
    ).toBe('unknown');
  });

  it('compiles to the same answer it decides', () => {
    expect(compileSegmentMongoFilter(reference('vip'), { fields: [] })).toEqual(
      {
        filter: { [SEGMENT_MEMBERSHIP_FIELD]: 'vip' },
        unsupported: [],
      },
    );

    expect(
      compileSegmentMongoFilter(reference('vip', true), { fields: [] }),
    ).toEqual({
      filter: { [SEGMENT_MEMBERSHIP_FIELD]: { $ne: 'vip' } },
      unsupported: [],
    });
  });

  it('costs one value however many references a tree makes', () => {
    const plan = buildSegmentEvaluationPlan({
      subjectType: SUBJECT,
      subjectIds: ['c-1'],
      segments: [
        {
          _id: 'seg-1',
          root: {
            kind: 'group',
            conjunction: 'and',
            children: [reference('vip'), reference('churned', true)],
          },
        },
      ],
    });

    expect(plan.requestsByPlugin.get('core')).toEqual([
      {
        kind: 'field',
        ref: REF,
        contentType: SUBJECT,
        fieldKey: SEGMENT_MEMBERSHIP_FIELD,
      },
    ]);
  });

  it('is answerable without the owning plugin declaring the field', () => {
    const split = splitSegmentFieldRequests(
      [
        {
          kind: 'field',
          ref: REF,
          contentType: SUBJECT,
          fieldKey: SEGMENT_MEMBERSHIP_FIELD,
        },
      ],
      {},
    );

    expect(split.undeclared).toEqual([]);
    expect(split.projected).toEqual([
      {
        ref: REF,
        contentType: SUBJECT,
        fieldKey: SEGMENT_MEMBERSHIP_FIELD,
        path: SEGMENT_MEMBERSHIP_FIELD,
      },
    ]);
  });

  it('records what it reads, so a membership move finds it again', () => {
    const root: SegmentNode = {
      kind: 'group',
      conjunction: 'and',
      children: [reference('vip')],
    };

    expect(segmentDependencies(SUBJECT, root)).toEqual([
      SUBJECT,
      segmentDependencyKey('vip'),
    ]);

    expect(collectSegmentReferences(root)).toEqual(['vip']);
  });

  it('finds a reference nested inside a relation predicate', () => {
    const root: SegmentNode = {
      kind: 'relation',
      relationKey: 'customer.deals',
      measure: { op: 'exists' },
      child: reference('won'),
    };

    expect(collectSegmentReferences(root)).toEqual(['won']);
  });
});
