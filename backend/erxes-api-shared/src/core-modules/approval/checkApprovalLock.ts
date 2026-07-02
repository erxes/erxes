import { ExpectedError, sendTRPCMessage } from '../../utils';
import {
  ApprovalLockAssertResponse,
  ApprovalLockState,
  ApprovalRemoteLockCheckInput,
  ApprovalRemoteLockStatesInput,
} from './types';

const unavailableState = (
  input: Pick<
    ApprovalRemoteLockCheckInput,
    'contentType' | 'contentId' | 'action'
  >,
): ApprovalLockState => ({
  contentType: input.contentType,
  contentId: input.contentId,
  action: input.action,
  locked: true,
  hasAccess: false,
  reason: 'Approval lock check unavailable',
});

export const checkApprovalLock = {
  async state(input: ApprovalRemoteLockCheckInput): Promise<ApprovalLockState> {
    return (await sendTRPCMessage({
      subdomain: input.subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'approval',
      action: 'state',
      input,
      context: { userId: input.userId },
      defaultValue: unavailableState(input),
    })) as ApprovalLockState;
  },

  async states(
    input: ApprovalRemoteLockStatesInput,
  ): Promise<ApprovalLockState[]> {
    const defaultValue = input.contentIds.map((contentId) =>
      unavailableState({
        contentType: input.contentType,
        contentId,
        action: input.action,
      }),
    );

    return (await sendTRPCMessage({
      subdomain: input.subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'approval',
      action: 'states',
      input,
      context: { userId: input.userId },
      defaultValue,
    })) as ApprovalLockState[];
  },

  async assert(
    input: ApprovalRemoteLockCheckInput,
  ): Promise<ApprovalLockState> {
    const defaultState = unavailableState(input);
    const result = (await sendTRPCMessage({
      subdomain: input.subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'approval',
      action: 'assert',
      input,
      context: { userId: input.userId },
      defaultValue: {
        allowed: false,
        message: defaultState.reason,
        state: defaultState,
      },
    })) as ApprovalLockAssertResponse;

    if (!result.allowed) {
      throw new ExpectedError(result.message || 'Locked', 'FORBIDDEN');
    }

    return result.state;
  },
};
