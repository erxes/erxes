import { TRANSACTION_STATUS_TYPES, TR_STATUSES } from '../../@types/constants';
import { resolveTrStatusWorkflow } from '../trStatusWorkflow';

const requested = {
  status: TR_STATUSES.REQUESTED,
  mentionOwnerId: 'owner',
  mentionUserIds: ['first', 'second'],
};

describe('transaction status tiers', () => {
  it('classifies all transaction statuses', () => {
    expect(TRANSACTION_STATUS_TYPES.REAL_STATUSES).toEqual([
      'estimated',
      'complete',
    ]);
    expect(TRANSACTION_STATUS_TYPES.SOON_STATUSES).toEqual([
      'executing',
      'requested',
    ]);
    expect(TRANSACTION_STATUS_TYPES.OMIT_STATUSES).toEqual([
      'draft',
      'mentioned',
      'plan',
    ]);
    expect(TR_STATUSES.ACTIVE).toEqual(TRANSACTION_STATUS_TYPES.REAL_STATUSES);
  });
});

describe('resolveTrStatusWorkflow', () => {
  it('requires someone to approve an approval request', () => {
    expect(() =>
      resolveTrStatusWorkflow({
        next: { ...requested, mentionUserIds: [] },
        userId: 'owner',
      }),
    ).toThrow('Select at least one approver');
  });

  it('waits for every distinct approver and ignores form changes to approver ids during a decision', () => {
    const first = resolveTrStatusWorkflow({
      next: { ...requested, mentionUserIds: ['first'] },
      old: { ...requested, mentionUserIds: ['first', 'second', 'second'] },
      userId: 'first',
      decision: 'APPROVE',
    });
    expect(first).toEqual({ ...requested, mentionUserIds: ['second'] });

    expect(() =>
      resolveTrStatusWorkflow({
        next: first,
        old: first,
        userId: 'first',
        decision: 'APPROVE',
      }),
    ).toThrow('Only a listed approver');

    expect(
      resolveTrStatusWorkflow({
        next: first,
        old: first,
        userId: 'second',
        decision: 'APPROVE',
      }),
    ).toEqual({
      ...requested,
      status: TR_STATUSES.COMPLETE,
      mentionUserIds: [],
    });
  });

  it('moves to executing immediately after any listed approver declines', () => {
    expect(
      resolveTrStatusWorkflow({
        next: requested,
        old: { ...requested, mentionUserIds: ['second'] },
        userId: 'second',
        decision: 'DECLINE',
      }),
    ).toEqual({
      ...requested,
      status: TR_STATUSES.EXECUTING,
      mentionUserIds: ['second'],
    });
  });

  it('returns an addressed draft to the owner once answered and rejects outsiders', () => {
    const mentioned = { ...requested, status: TR_STATUSES.MENTIONED };
    const first = resolveTrStatusWorkflow({
      next: mentioned,
      old: mentioned,
      userId: 'first',
      decision: 'APPROVE',
    });
    expect(first).toEqual({ ...mentioned, mentionUserIds: ['second'] });
    expect(
      resolveTrStatusWorkflow({
        next: first,
        old: first,
        userId: 'second',
        decision: 'APPROVE',
      }),
    ).toEqual({ ...mentioned, status: TR_STATUSES.DRAFT, mentionUserIds: [] });
    expect(
      resolveTrStatusWorkflow({
        next: mentioned,
        old: mentioned,
        userId: 'second',
        decision: 'DECLINE',
      }).status,
    ).toBe(TR_STATUSES.DRAFT);
    expect(() =>
      resolveTrStatusWorkflow({
        next: { ...mentioned, mentionUserIds: [] },
        userId: 'owner',
      }),
    ).toThrow('Select at least one user');

    expect(() =>
      resolveTrStatusWorkflow({
        next: mentioned,
        old: mentioned,
        userId: 'owner',
        decision: 'DECLINE',
      }),
    ).toThrow('Only a listed approver');
  });

  it('preserves remaining recipients when omitted and permits direct edits to recipients and status', () => {
    const old = { ...requested, mentionUserIds: ['second'] };
    expect(
      resolveTrStatusWorkflow({
        next: { status: requested.status },
        old,
        userId: 'second',
      }),
    ).toEqual(old);
    expect(
      resolveTrStatusWorkflow({
        next: { ...requested, mentionUserIds: ['third'] },
        old,
        userId: 'owner',
      }).mentionUserIds,
    ).toEqual(['third']);
    expect(
      resolveTrStatusWorkflow({
        next: { status: TR_STATUSES.ESTIMATED },
        old,
        userId: 'second',
      }).status,
    ).toBe(TR_STATUSES.ESTIMATED);
  });
});
