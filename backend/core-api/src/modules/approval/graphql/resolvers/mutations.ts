import {
  APPROVAL_APPROVER_SCOPES,
  APPROVAL_DECISIONS,
  APPROVAL_LOCK_STATUSES,
  APPROVAL_MODES,
  APPROVAL_REQUEST_STATUSES,
  ApprovalApproverScope,
  ApprovalDecision,
  ApprovalLock,
  ApprovalMode,
  ApprovalRequest,
  ApprovalRequestCreateInput,
} from 'erxes-api-shared/core-modules';
import { ExpectedError } from 'erxes-api-shared/utils';
import { PipelineStage } from 'mongoose';
import { IContext } from '~/connectionResolvers';

const unique = (ids: string[]) => [...new Set(ids.filter(Boolean))];

type ApprovalLockCreateResolverInput = {
  contentType: string;
  contentTypeId: string;
  ownerId: string;
  allowedUserIds?: string[];
  scope?: ApprovalApproverScope;
  mode?: ApprovalMode;
};

const assertPending = (request: ApprovalRequest) => {
  if (request.status !== APPROVAL_REQUEST_STATUSES.PENDING) {
    throw new ExpectedError('Approval request is already resolved', 'CONFLICT');
  }
};

const hasApproved = (decisions: ApprovalDecision[], approverId: string) =>
  decisions.some(
    (decision) =>
      decision.userId === approverId &&
      decision.decision === APPROVAL_DECISIONS.APPROVED,
  );

const shouldResolveApproved = (
  request: ApprovalRequest,
  lock: ApprovalLock,
  decisions: ApprovalDecision[],
) => {
  if (lock.approvalMode === APPROVAL_MODES.FIRST_WINS) {
    return decisions.some(
      (decision) => decision.decision === APPROVAL_DECISIONS.APPROVED,
    );
  }

  return request.requiredApproverIds.every((approverId) =>
    hasApproved(decisions, approverId),
  );
};

const decisionPipeline = (
  decision: ApprovalDecision,
  extraSet: Record<string, unknown> = {},
): PipelineStage[] => [
  {
    $set: {
      decisions: {
        $concatArrays: [
          {
            $filter: {
              input: '$decisions',
              as: 'decision',
              cond: { $ne: ['$$decision.userId', decision.userId] },
            },
          },
          [decision],
        ],
      },
      ...extraSet,
    },
  },
];

const recordPendingDecision = async (
  models: IContext['models'],
  requestId: string,
  decision: ApprovalDecision,
) => {
  const request = await models.ApprovalRequests.findOneAndUpdate(
    { _id: requestId, status: APPROVAL_REQUEST_STATUSES.PENDING },
    decisionPipeline(decision),
    { new: true },
  ).lean<ApprovalRequest | null>();

  if (!request) {
    throw new ExpectedError('Approval request is already resolved', 'CONFLICT');
  }

  return request;
};

export const approvalMutations = {
  async approvalLockCreate(
    _root: undefined,
    { input }: { input: ApprovalLockCreateResolverInput },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('approvalLocksManage');

    return models.ApprovalLocks.createLock({
      contentType: input.contentType,
      contentId: input.contentTypeId,
      ownerIdSnapshot: input.ownerId,
      lockedBy: user._id,
      allowedUserIds: unique(input.allowedUserIds || []),
      approverScope: input.scope || APPROVAL_APPROVER_SCOPES.LOCKER_ONLY,
      approvalMode: input.mode || APPROVAL_MODES.FIRST_WINS,
    });
  },

  async approvalLockRelease(
    _root: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('approvalLocksManage');

    const lock = await models.ApprovalLocks.getLock(_id);

    if (lock.lockedBy !== user._id) {
      throw new ExpectedError(
        'Only the locker can release this lock',
        'FORBIDDEN',
      );
    }

    return models.ApprovalLocks.releaseLock(_id, {
      releasedBy: user._id,
    });
  },

  async approvalLockForceRelease(
    _root: undefined,
    { _id, reason }: { _id: string; reason: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('approvalLocksForceRelease');

    if (!reason.trim()) {
      throw new ExpectedError(
        'Force release reason is required',
        'BAD_REQUEST',
      );
    }

    return models.ApprovalLocks.releaseLock(_id, {
      releasedBy: user._id,
      releaseReason: reason,
    });
  },

  async approvalRequestCreate(
    _root: undefined,
    { input }: { input: ApprovalRequestCreateInput },
    { models, user, subdomain }: IContext,
  ) {
    const state = await models.ApprovalLocks.getState({
      user,
      contentType: input.contentType,
      contentId: input.contentId,
      action: 'view',
    });

    if (!state.lock) {
      throw new ExpectedError('Resource is not locked', 'BAD_REQUEST');
    }

    if (state.hasAccess) {
      throw new ExpectedError('You already have access', 'BAD_REQUEST');
    }

    const pending = await models.ApprovalRequests.getPendingRequest({
      lockId: state.lock._id,
      requesterId: user._id,
    });

    if (pending) {
      return pending;
    }

    const requiredApproverIds = models.ApprovalRequests.getRequiredApproverIds(
      state.lock,
      user._id,
    );

    if (!requiredApproverIds.length) {
      throw new ExpectedError('No approver is available', 'BAD_REQUEST');
    }

    const request = await models.ApprovalRequests.createRequest({
      ...input,
      lockId: state.lock._id,
      requesterId: user._id,
      requiredApproverIds,
    });

    const notificationIds = await models.ApprovalRequests.notifyApprovers({
      subdomain,
      request,
      lock: state.lock,
      content: state.content || {
        contentType: input.contentType,
        contentId: input.contentId,
      },
    });

    return models.ApprovalRequests.resolveRequest(request._id, {
      status: request.status,
      notificationIds,
    });
  },

  async approvalRequestApprove(
    _root: undefined,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) {
    const request = await models.ApprovalRequests.getRequest(_id);
    assertPending(request);

    if (!request.requiredApproverIds.includes(user._id)) {
      throw new ExpectedError('Not an approver', 'FORBIDDEN');
    }

    const lock = await models.ApprovalLocks.getLock(request.lockId);

    if (lock.status !== APPROVAL_LOCK_STATUSES.ACTIVE) {
      throw new ExpectedError('Approval lock is not active', 'CONFLICT');
    }

    const decision: ApprovalDecision = {
      userId: user._id,
      decision: APPROVAL_DECISIONS.APPROVED,
      at: new Date(),
    };
    const updatedRequest = await recordPendingDecision(models, _id, decision);
    const approved = shouldResolveApproved(
      updatedRequest,
      lock,
      updatedRequest.decisions,
    );

    if (approved) {
      const resolvedRequest = await models.ApprovalRequests.findOneAndUpdate(
        { _id, status: APPROVAL_REQUEST_STATUSES.PENDING },
        {
          $set: {
            status: APPROVAL_REQUEST_STATUSES.APPROVED,
            resolvedAt: new Date(),
          },
        },
        { new: true },
      ).lean<ApprovalRequest | null>();

      const finalRequest =
        resolvedRequest || (await models.ApprovalRequests.getRequest(_id));

      if (finalRequest.status === APPROVAL_REQUEST_STATUSES.APPROVED) {
        await models.ApprovalLocks.updateOne(
          { _id: lock._id },
          { $addToSet: { allowedUserIds: request.requesterId } },
        );
      }

      return finalRequest;
    }

    return updatedRequest;
  },

  async approvalRequestReject(
    _root: undefined,
    { _id, reason }: { _id: string; reason?: string },
    { models, user }: IContext,
  ) {
    const request = await models.ApprovalRequests.getRequest(_id);
    assertPending(request);

    if (!request.requiredApproverIds.includes(user._id)) {
      throw new ExpectedError('Not an approver', 'FORBIDDEN');
    }

    const decision: ApprovalDecision = {
      userId: user._id,
      decision: APPROVAL_DECISIONS.REJECTED,
      reason,
      at: new Date(),
    };

    const rejected = await models.ApprovalRequests.findOneAndUpdate(
      { _id, status: APPROVAL_REQUEST_STATUSES.PENDING },
      decisionPipeline(decision, {
        status: APPROVAL_REQUEST_STATUSES.REJECTED,
        resolvedAt: new Date(),
      }),
      { new: true },
    ).lean<ApprovalRequest | null>();

    if (!rejected) {
      throw new ExpectedError(
        'Approval request is already resolved',
        'CONFLICT',
      );
    }

    return rejected;
  },

  async approvalRequestCancel(
    _root: undefined,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) {
    const request = await models.ApprovalRequests.getRequest(_id);
    assertPending(request);

    if (request.requesterId !== user._id) {
      throw new ExpectedError('Only the requester can cancel', 'FORBIDDEN');
    }

    const cancelled = await models.ApprovalRequests.findOneAndUpdate(
      { _id, status: APPROVAL_REQUEST_STATUSES.PENDING },
      {
        $set: {
          status: APPROVAL_REQUEST_STATUSES.CANCELLED,
          resolvedAt: new Date(),
        },
      },
      { new: true },
    ).lean<ApprovalRequest | null>();

    if (!cancelled) {
      throw new ExpectedError(
        'Approval request is already resolved',
        'CONFLICT',
      );
    }

    return cancelled;
  },
};
