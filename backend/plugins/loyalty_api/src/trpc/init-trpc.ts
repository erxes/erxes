import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import * as z from 'zod';
import { IModels } from '~/connectionResolvers';
import { checkVouchersSale, confirmVoucherSale } from '~/utils';

export type LoyaltyTRPCContext = ITRPCContext<{ models: IModels }>;
const t = initTRPC.context<LoyaltyTRPCContext>().create();

export const appRouter = t.router({
  loyalty: t.router({
    checkLoyalties: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models, subdomain } = ctx;
      const { ownerType, ownerId, products, discountInfo } = input;

      return {
        data: await checkVouchersSale(
          models,
          subdomain,
          ownerType,
          ownerId,
          products,
          discountInfo
        ),
        status: "success",
      };
    }),
    handleLoyaltyReward: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { subdomain } = ctx;
      // return await handleLoyaltyReward({ subdomain }),
    }),
    confirmLoyalties: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models, subdomain } = ctx;
      const { checkInfo, extraInfo } = input;

      return await confirmVoucherSale(models, subdomain, checkInfo, extraInfo);
    }),
    changeCustomer: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      // await handleLoyaltyOwnerChange(subdomain, models, customerId, customerIds);
    }),
  }),
  pricing: t.router({}),
  assignment: t.router({}),
  coupon: t.router({
    checkCoupon: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      return;
    }),
  }),
  donate: t.router({}),
  lottery: t.router({}),
  score: t.router({
    scoreCampaign: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      return;
    }),
    checkScoreAviableSubtract: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      return await models.ScoreCampaigns.checkScoreAviableSubtract(input)
    }),
    updateScore: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      return;
    }),
    doScoreCampaign: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      return;
    }),
    refundLoyaltyScore: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      return;
    }),
  }),
  spin: t.router({}),
  voucher: t.router({
    voucherCampaigns: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      return;
    }),
  }),
});

export type AppRouter = typeof appRouter;
