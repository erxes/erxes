import { ApprovalLockStatesInput } from 'erxes-api-shared/core-modules';
import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { cursorPaginate, ExpectedError } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IApprovalRequestDocument } from '../../db/definitions/approvalRequests';
import { checkApprovalLock } from '../../utils/checkApprovalLock';

type ApprovalLockStateArgs = {
  contentType: string;
  contentId: string;
  ownerId?: string;
  action?: string;
};

type ApprovalLockStatesArgs = ApprovalLockStatesInput;

type ApprovalRequestsArgs = ICursorPaginateParams & {
  status?: string;
  contentType?: string;
  requesterIds?: string[];
  approverIds?: string[];
};

const normalizeOwnerIdsByContentId = (
  ownerIdsByContentId?: Record<string, unknown>,
): Record<string, string> => {
  if (!ownerIdsByContentId) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(ownerIdsByContentId).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );
};

const generateApprovalRequestsFilter = (
  params: ApprovalRequestsArgs,
  user: IContext['user'],
) => {
  const filter: Record<string, unknown> = {};

  if (params.status && params.status !== 'all') {
    filter.status = params.status;
  }

  if (params.contentType) {
    filter.contentType = params.contentType;
  }

  if (params.requesterIds?.length) {
    filter.requesterId = { $in: params.requesterIds };
  }

  if (params.approverIds?.length) {
    filter.requiredApproverIds = { $in: params.approverIds };
  }

  if (!user.isOwner) {
    filter.$or = [{ requesterId: user._id }, { requiredApproverIds: user._id }];
  }

  return filter;
};

export const approvalQueries = {
  async approvalLockState(
    _root: undefined,
    args: ApprovalLockStateArgs,
    { models, user }: IContext,
  ) {
    return checkApprovalLock.state({
      models,
      user,
      ...args,
    });
  },

  async approvalLockStates(
    _root: undefined,
    args: ApprovalLockStatesArgs,
    { models, user }: IContext,
  ) {
    return checkApprovalLock.states({
      models,
      user,
      ...args,
      ownerIdsByContentId: normalizeOwnerIdsByContentId(
        args.ownerIdsByContentId,
      ),
    });
  },

  async approvalRequestDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) {
    const request = await models.ApprovalRequests.getRequest(_id);

    if (
      user.isOwner ||
      request.requesterId === user._id ||
      request.requiredApproverIds.includes(user._id)
    ) {
      return request;
    }

    const state = await checkApprovalLock.state({
      models,
      user,
      contentType: request.contentType,
      contentId: request.contentId,
      action: 'view',
    });

    if (!state.hasAccess) {
      throw new ExpectedError('Approval request not found', 'NOT_FOUND');
    }

    return request;
  },

  async approvalRequests(
    _root: undefined,
    params: ApprovalRequestsArgs,
    { models, user }: IContext,
  ) {
    const { list, totalCount, pageInfo } =
      await cursorPaginate<IApprovalRequestDocument>({
        model: models.ApprovalRequests,
        params: {
          ...params,
          orderBy: params.orderBy || { createdAt: -1 },
        },
        query: generateApprovalRequestsFilter(params, user),
      });

    return {
      list,
      totalCount,
      pageInfo,
    };
  },
};
