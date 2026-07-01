import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';

type OperationFavoritesTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<OperationFavoritesTRPCContext>().create();

export const operationFavoritesTrpcRouter = t.router({
  favorites: t.router({
    resolveTeamNames: t.procedure
      .input(
        z.object({
          teamIds: z.array(z.string()),
        }),
      )
      .query(async ({ ctx, input }) => {
        const uniqueTeamIds = Array.from(new Set(input.teamIds));

        const teams = await ctx.models.Team.find({
          _id: { $in: uniqueTeamIds },
        })
          .select('_id name')
          .lean();

        return teams.reduce<Record<string, string>>((acc, team) => {
          acc[String(team._id)] = team.name;
          return acc;
        }, {});
      }),
  }),
});
