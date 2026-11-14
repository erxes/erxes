import { initTRPC } from '@trpc/server';
import {
  APPROVAL_REQUEST_KINDS,
  APPROVAL_REQUEST_STATUSES,
  approvalLockCheckInputSchema,
  approvalLockStatesInputSchema,
} from 'erxes-api-shared/core-modules';
import { z } from 'zod';
import { ExpectedError } from 'erxes-api-shared/utils';
import { CoreTRPCContext } from '~/init-trpc';
import { IModels } from '~/connectionResolvers';

type ApprovalTrpcUser = {
  _id: string;
  isOwner?: boolean;
};

type ApprovalTrpcContext = {
  models: IModels;
  userId?: string;
};

const t = initTRPC.context<CoreTRPCContext>().create();

const getTrpcUser = async (
  ctx: ApprovalTrpcContext,
  inputUserId?: string,
): Promise<ApprovalTrpcUser> => {
  const userId = inputUserId || ctx.userId;

  if (!userId) {
    throw new ExpectedError('Login required', 'UNAUTHORIZED');
  }

  const user = await ctx.models.Users.findOne(
    { _id: userId },
    { _id: 1, isOwner: 1 },
  ).lean<ApprovalTrpcUser | null>();

  if (!user) {
    throw new ExpectedError('Login required', 'UNAUTHORIZED');
  }

  return user;
};

const automationRequestInputSchema = z.object({
  contentType: z.string().min(1),
  contentId: z.string().min(1),
  requesterId: z.string().min(1),
  approverIds: z.array(z.string().min(1)).min(1),
  change: z.object({
    changeType: z.string().min(1),
    payload: z.record(z.string(), z.unknown()).optional(),
    summary: z.string().min(1),
  }),
});

export const approvalTrpcRouter = t.router({
  approval: t.router({
    /**
     * A change request an automation step asks for, in its owner's name. Unlike
     * a person's request, the owner may approve it: the step is asking, not
     * the owner, and the owner is often the manager who decides.
     */
    createAutomationRequest: t.procedure
      .input(automationRequestInputSchema)
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        const requiredApproverIds = [...new Set(input.approverIds)];

        const pending = await models.ApprovalRequests.getPendingRequest({
          contentType: input.contentType,
          contentId: input.contentId,
          changeType: input.change.changeType,
        });

        if (pending) {
          return pending;
        }

        const request = await models.ApprovalRequests.createRequest({
          contentType: input.contentType,
          contentId: input.contentId,
          change: input.change,
          kind: APPROVAL_REQUEST_KINDS.CHANGE,
          requesterId: input.requesterId,
          requiredApproverIds,
        });

        const notificationIds = await models.ApprovalRequests.notifyApprovers({
          subdomain,
          request,
          content: {
            contentType: input.contentType,
            contentId: input.contentId,
            label: input.change.summary,
          },
        });

        return models.ApprovalRequests.resolveRequest(request._id, {
          status: request.status,
          notificationIds,
        });
      }),

    /** Closes an automation's pending request whose wait ran out. */
    cancelAutomationRequest: t.procedure
      .input(z.object({ requestId: z.string().min(1) }))
      .mutation(async ({ ctx, input }) =>
        ctx.models.ApprovalRequests.findOneAndUpdate(
          { _id: input.requestId, status: APPROVAL_REQUEST_STATUSES.PENDING },
          {
            $set: {
              status: APPROVAL_REQUEST_STATUSES.CANCELLED,
              resolvedAt: new Date(),
            },
          },
          { new: true },
        ).lean(),
      ),

    state: t.procedure
      .input(approvalLockCheckInputSchema)
      .query(async ({ ctx, input }) => {
        const user = await getTrpcUser(ctx, input.userId);

        return ctx.models.ApprovalLocks.getState({
          user,
          contentType: input.contentType,
          contentId: input.contentId,
          ownerId: input.ownerId,
          action: input.action,
        });
      }),

    states: t.procedure
      .input(approvalLockStatesInputSchema)
      .query(async ({ ctx, input }) => {
        const user = await getTrpcUser(ctx, input.userId);

        return ctx.models.ApprovalLocks.getStates({
          user,
          contentType: input.contentType,
          contentIds: input.contentIds,
          ownerIdsByContentId: input.ownerIdsByContentId,
          action: input.action,
        });
      }),

    assert: t.procedure
      .input(approvalLockCheckInputSchema)
      .mutation(async ({ ctx, input }) => {
        const user = await getTrpcUser(ctx, input.userId);
        const state = await ctx.models.ApprovalLocks.getState({
          user,
          contentType: input.contentType,
          contentId: input.contentId,
          ownerId: input.ownerId,
          action: input.action,
        });

        return {
          allowed: state.hasAccess,
          message: state.hasAccess ? undefined : state.reason || 'Locked',
          state,
        };
      }),
  }),
});
