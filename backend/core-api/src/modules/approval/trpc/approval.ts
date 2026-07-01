import { initTRPC } from '@trpc/server';
import {
  approvalLockCheckInputSchema,
  approvalLockStatesInputSchema,
} from 'erxes-api-shared/core-modules';
import { ExpectedError } from 'erxes-api-shared/utils';
import { CoreTRPCContext } from '~/init-trpc';
import { IModels } from '~/connectionResolvers';
import { checkApprovalLock } from '../utils/checkApprovalLock';

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
      .input(approvalLockCheckInputSchema)
      .query(async ({ ctx, input }) => {
        const user = await getTrpcUser(ctx, input.userId);

        return checkApprovalLock.state({
          models: ctx.models,
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

        return checkApprovalLock.states({
          models: ctx.models,
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
        const state = await checkApprovalLock.state({
          models: ctx.models,
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
