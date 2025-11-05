import { initTRPC } from '@trpc/server';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { z } from 'zod';

import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export type FrontlineTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<FrontlineTRPCContext>().create();

export const carsTrpcRouter = t.router({
  cars: t.router({
    find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;

      return await models.Cars.find(query).lean();
    }),
  }),
});
