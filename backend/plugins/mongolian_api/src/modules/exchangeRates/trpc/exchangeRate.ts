import { initTRPC } from '@trpc/server';
import { z } from 'zod';

import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

/**
 * ExchangeRate TRPC Context
 * (matches Erkhet pattern exactly)
 */
export type ExchangeRateTRPCContext =
  ITRPCContext<{ models: IModels }>;

const t = initTRPC
  .context<ExchangeRateTRPCContext>()
  .create();

export const exchangeRateTrpcRouter = t.router({
  exchangeRates: {
    findOne: t.procedure
      .input(
        z.object({
          query: z.any(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { models } = ctx;

        return await models.ExchangeRates
          .findOne(input.query)
          .lean();
      }),

    create: t.procedure
      .input(
        z.object({
          data: z.any(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;

        return await models.ExchangeRates
          .createExchangeRate(input.data);
      }),

    update: t.procedure
      .input(
        z.object({
          selector: z.any(),
          modifier: z.any(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;

        return await models.ExchangeRates.updateOne(
          input.selector,
          input.modifier,
        );
      }),

    getActiveRate: t.procedure
      .input(
        z.object({
          date: z.date(),
          rateCurrency: z.string(),
          mainCurrency: z.string().optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { models } = ctx;

        return await models.ExchangeRates.getActiveRate(
          input,
        );
      }),
  },
});

export default exchangeRateTrpcRouter;
