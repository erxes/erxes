import {
  TR_INVENTORY_STATUS_TYPES,
  TR_STATUSES,
} from '../../@types/constants';
import { resolveTrStatusWorkflow } from '../trStatusWorkflow';

const mentioned = {
  status: TR_STATUSES.MENTIONED,
  mentionOwnerId: 'owner',
  mentionUserIds: ['approver'],
};

describe('transaction status tiers', () => {
  it('omits conversation and cancelled, reserves business, posts ongoing and complete', () => {
    expect(TR_INVENTORY_STATUS_TYPES.OMIT_STATUSES).toEqual(
      expect.arrayContaining([
        ...TR_STATUSES.CONVERSATION,
        TR_STATUSES.CANELLED,
      ]),
    );
    expect(TR_INVENTORY_STATUS_TYPES.SOON_STATUSES).toEqual([
      TR_STATUSES.PROGRESS,
      TR_STATUSES.ASSIGNED,
      TR_STATUSES.CONFIRMED,
    ]);
    expect(TR_INVENTORY_STATUS_TYPES.REAL_STATUSES).toEqual([
      TR_STATUSES.ONGOING,
      TR_STATUSES.COMPLETE,
    ]);
    expect(TR_STATUSES.ACTIVE).toEqual(TR_INVENTORY_STATUS_TYPES.REAL_STATUSES);
    expect(TR_STATUSES.ALL).toContain(TR_STATUSES.ONGOING);
  });
});

describe('resolveTrStatusWorkflow', () => {
  it('requires an approver when requesting approval', () => {
    expect(() =>
      resolveTrStatusWorkflow({
        next: { status: TR_STATUSES.MENTIONED, mentionUserIds: [] },
        userId: 'owner',
      }),
    ).toThrow('Select at least one approver');
  });

  it('lets only a mentioned approver approve, reject or return', () => {
    expect(() =>
      resolveTrStatusWorkflow({
        next: { ...mentioned, status: TR_STATUSES.APPROVED },
        old: mentioned,
        userId: 'owner',
      }),
    ).toThrow('Only the mentioned approvers');

    expect(
      resolveTrStatusWorkflow({
        next: { ...mentioned, status: TR_STATUSES.REJECED },
        old: mentioned,
        userId: 'approver',
      }),
    ).toEqual({ ...mentioned, status: TR_STATUSES.REJECED });
  });

  it('makes a forwarding approver the requester of the next stage', () => {
    expect(
      resolveTrStatusWorkflow({
        next: { ...mentioned, mentionUserIds: ['next', 'next'] },
        old: mentioned,
        userId: 'approver',
      }),
    ).toEqual({
      status: TR_STATUSES.MENTIONED,
      mentionOwnerId: 'approver',
      mentionUserIds: ['next'],
    });
  });

  it('reverses the request once when returned and keeps it on later saves', () => {
    const returned = resolveTrStatusWorkflow({
      next: { ...mentioned, status: TR_STATUSES.RETURNED },
      old: mentioned,
      userId: 'approver',
    });

    expect(returned).toEqual({
      status: TR_STATUSES.RETURNED,
      mentionOwnerId: 'approver',
      mentionUserIds: ['owner'],
    });
    expect(
      resolveTrStatusWorkflow({ next: returned, old: returned, userId: 'owner' }),
    ).toEqual(returned);
  });

  it('leaves business and posted transitions to journal permissions', () => {
    expect(
      resolveTrStatusWorkflow({
        next: { status: TR_STATUSES.COMPLETE },
        old: { status: TR_STATUSES.CONFIRMED, mentionOwnerId: 'owner' },
        userId: 'someone',
      }),
    ).toEqual({
      status: TR_STATUSES.COMPLETE,
      mentionOwnerId: 'owner',
      mentionUserIds: [],
    });
  });
});
