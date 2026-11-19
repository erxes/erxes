import { TR_STATUSES } from '../../../types/constants';
import { getTrWorkflowActions } from '../statusWorkflow';

const keys = (actions: { key: string }[]) => actions.map(({ key }) => key);

const mentioned = {
  status: TR_STATUSES.MENTIONED,
  mentionOwnerId: 'owner',
  mentionUserIds: ['approver'],
};

describe('getTrWorkflowActions', () => {
  it('shows approve and reject to a mentioned approver, with forward and return under More', () => {
    const { primary, more } = getTrWorkflowActions({
      ...mentioned,
      currentUserId: 'approver',
    });

    expect(keys(primary)).toEqual(['approve-request', 'reject']);
    expect(keys(more)).toEqual([
      'approve-and-forward',
      'return-for-clarification',
    ]);
    expect(primary[0].getFields()).toEqual({
      ...mentioned,
      status: TR_STATUSES.APPROVED,
    });
    expect(more[0].needsApprovers).toBe(true);
    expect(more[0].getFields(['next'])).toEqual({
      status: TR_STATUSES.MENTIONED,
      mentionOwnerId: 'approver',
      mentionUserIds: ['next'],
    });
    expect(more[1].getFields()).toEqual({
      status: TR_STATUSES.RETURNED,
      mentionOwnerId: 'approver',
      mentionUserIds: ['owner'],
    });
  });

  it('never lets the requester decide their own request', () => {
    const { primary, more } = getTrWorkflowActions({
      ...mentioned,
      currentUserId: 'owner',
    });

    expect(primary).toEqual([]);
    expect(keys(more)).toEqual(['back-to-draft']);
  });

  it('offers business confirm/cancel and posted complete/cancel', () => {
    expect(
      keys(getTrWorkflowActions({ status: TR_STATUSES.APPROVED }).primary),
    ).toEqual(['confirm-transaction']);
    expect(
      keys(getTrWorkflowActions({ status: TR_STATUSES.CONFIRMED }).primary),
    ).toEqual(['complete-transaction', 'cancel-transaction']);

    const ongoing = getTrWorkflowActions({ status: TR_STATUSES.ONGOING });
    expect(keys(ongoing.primary)).toEqual(['complete-transaction']);
    expect(ongoing.more[0].confirmMessage).toBe(
      'cancel-posted-transaction-confirm',
    );
  });

  it('lets the returned requester resubmit to the approver who asked', () => {
    const { primary } = getTrWorkflowActions({
      status: TR_STATUSES.RETURNED,
      mentionOwnerId: 'approver',
      mentionUserIds: ['owner'],
      currentUserId: 'owner',
    });

    expect(primary[0].getFields()).toEqual({
      status: TR_STATUSES.MENTIONED,
      mentionOwnerId: 'owner',
      mentionUserIds: ['approver'],
    });
  });
});
