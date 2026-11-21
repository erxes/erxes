import { TR_STATUSES } from '../../../types/constants';
import {
  canRequestTrApproval,
  hasSavedWorkflow,
  isAddressedTrStatus,
  isTrResponder,
} from '../statusWorkflow';

const requested = {
  status: TR_STATUSES.REQUESTED,
  mentionUserIds: ['first', 'second'],
};

describe('transaction approval view', () => {
  it('shows recipients only for statuses addressed to someone', () => {
    expect(isAddressedTrStatus(TR_STATUSES.MENTIONED)).toBe(true);
    expect(isAddressedTrStatus(TR_STATUSES.REQUESTED)).toBe(true);
    expect(isAddressedTrStatus(TR_STATUSES.EXECUTING)).toBe(false);
    expect(isAddressedTrStatus(undefined)).toBe(false);
  });

  it('opens the decision view only for a listed user of an open request', () => {
    expect(isTrResponder(requested, 'second')).toBe(true);
    expect(isTrResponder(requested, 'owner')).toBe(false);
    expect(
      isTrResponder({ ...requested, status: TR_STATUSES.COMPLETE }, 'first'),
    ).toBe(false);
  });

  it('keeps Approve and Decline only while status and recipients are saved', () => {
    expect(
      hasSavedWorkflow(requested, {
        ...requested,
        mentionUserIds: ['second', 'first'],
      }),
    ).toBe(true);
    expect(
      hasSavedWorkflow(requested, {
        ...requested,
        status: TR_STATUSES.COMPLETE,
      }),
    ).toBe(false);
    expect(
      hasSavedWorkflow(requested, { ...requested, mentionUserIds: ['first'] }),
    ).toBe(false);
  });

  it('lets owners request approval from drafts and while executing', () => {
    expect(canRequestTrApproval(undefined)).toBe(true);
    expect(canRequestTrApproval(TR_STATUSES.EXECUTING)).toBe(true);
    expect(canRequestTrApproval(TR_STATUSES.REQUESTED)).toBe(false);
    expect(canRequestTrApproval(TR_STATUSES.COMPLETE)).toBe(false);
  });
});
