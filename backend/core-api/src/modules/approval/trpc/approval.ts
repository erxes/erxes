import { initTRPC } from '@trpc/server';
import {
  approvalLockCheckInputSchema,
  approvalLockStatesInputSchema,
} from 'erxes-api-shared/core-modules';
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

export const approvalTrpcRouter = t.router({
  approval: t.router({
    state: t.procedure
      .meta({
        agent: {
          description:
            'Check the approval-lock state of ONE record before editing it. Input: { contentType, contentId, action?, ownerId?, userId? } — contentType like "sales:deal", contentId is the record _id. Returns whether the current user has access and the lock reason. Always check this before mutating pipeline records (deals, tickets) so you do not fight an active approval lock. Use approval.states for multiple records at once.',
          permission: { module: 'approval', action: 'approvalLocksManage' },
        },
      })
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
      .meta({
        agent: {
          description:
            'Batch-check approval-lock states for MULTIPLE records of one content type. Input: { contentType, contentIds, ownerIdsByContentId?, action?, userId? }. Use instead of approval.state when working with a list of records.',
          permission: { module: 'approval', action: 'approvalLocksManage' },
        },
      })
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
