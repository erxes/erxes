import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';

type SalesFavoritesTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<SalesFavoritesTRPCContext>().create();

export const salesFavoritesTrpcRouter = t.router({
  favorites: t.router({
    resolveBoardPipelineNames: t.procedure
      .input(
        z.object({
          boardIds: z.array(z.string()),
          pipelineIds: z.array(z.string()),
        }),
      )
      .query(async ({ ctx, input }) => {
        const uniqueBoardIds = Array.from(new Set(input.boardIds));
        const uniquePipelineIds = Array.from(new Set(input.pipelineIds));

        const [boards, pipelines] = await Promise.all([
          ctx.models.Boards.find({ _id: { $in: uniqueBoardIds } })
            .select('_id name')
            .lean(),
          ctx.models.Pipelines.find({ _id: { $in: uniquePipelineIds } })
            .select('_id name')
            .lean(),
        ]);

        return {
          boards: boards.reduce<Record<string, string>>((acc, board) => {
            if (board.name) {
              acc[String(board._id)] = board.name;
            }

            return acc;
          }, {}),
          pipelines: pipelines.reduce<Record<string, string>>(
            (acc, pipeline) => {
              if (pipeline.name) {
                acc[String(pipeline._id)] = pipeline.name;
              }

              return acc;
            },
            {},
          ),
        };
      }),
  }),
});
