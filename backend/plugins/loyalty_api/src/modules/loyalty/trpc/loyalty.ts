import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import {
  checkVouchersSale,
  confirmVoucherSale,
  doScoreCampaign,
  handleLoyaltyReward,
  handleScore,
  refundLoyaltyScore,
} from '~/modules/loyalty/trpc/utils';
import { LoyaltyTRPCContext } from '~/trpc/init-trpc';

const t = initTRPC.context<LoyaltyTRPCContext>().create();

export const loyaltyTrpcRouter = t.router({
  loyalty: t.router({
    updateScore: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;
      await handleScore(models, input);
      return {
        data: null,
        status: 'success',
      };
    }),
    refundLoyaltyScore: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;
        return {
          data: await refundLoyaltyScore(models, input),
          status: 'success',
        };
      }),
    doScoreCampaign: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;
        return {
          data: await doScoreCampaign(models, input),
          status: 'success',
        };
      }),

    checkCoupon: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { query } = input;
      const { models } = ctx;
      return {
        data: await models.Coupons.checkCoupon(input),
        status: 'success',
      };
    }),
    scoreCampaign: t.router({
      findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;
        return {
          data: await models.ScoreCampaigns.findOne(input),
          status: 'success',
        };
      }),
    }),
    checkScoreAviableSubtract: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;
        return {
          data: await models.ScoreCampaigns.checkScoreAviableSubtract(input),
          status: 'success',
        };
      }),
    automations: t.router({
      receiveSetPropertyForwardTo: t.procedure
        .input(z.any())
        .query(async ({ ctx, input }) => {
          const { query } = input;
          const { models } = ctx;

          const target = input.target;

          const response = await models.ScoreLogs.create({
            ownerId: target._id,
            ownerType: input.collectionType,
            changeScore: input.setDoc[Object.keys(input.setDoc)[0]],
            createdAt: new Date(),
            description: 'Via automation',
          });

          return {
            data: response,
            status: 'success',
          };
        }),
    }),
    confirmLoyalties: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { checkInfo, extraInfo } = input;

        const { models, subdomain } = ctx;
        return {
          data: await confirmVoucherSale(
            models,
            subdomain,
            checkInfo,
            extraInfo,
          ),
          status: 'success',
        };
      }),
    handleLoyaltyReward: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        return {
          data: await handleLoyaltyReward({ subdomain }),
          status: 'success',
        };
      }),
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
          discountInfo,
        ),
        status: 'success',
      };
    }),
    voucherCampaigns: t.router({
      findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
        const { query } = input;
        const { models } = ctx;
        return {
          data: await models.VoucherCampaigns.findOne(input),
          status: 'success',
        };
      }),
    }),
  }),
});
