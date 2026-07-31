import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';

export type TeamTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<TeamTRPCContext>().create();

export const teamTrpcRouter = t.router({
  team: t.router({
    memberTeamIds: t.procedure
      .input(z.object({ memberId: z.string().min(1) }))
      .query(async ({ ctx, input }) => {
        const teamIds = await ctx.models.TeamMember.find({
          memberId: input.memberId,
        }).distinct('teamId');

        return teamIds.map(String);
      }),
  }),
});
