import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import * as z from 'zod';
import { IModels } from '~/connectionResolvers';
import {
  checkVouchersSale,
  confirmVoucherSale,
  handleLoyaltyReward,
  doScoreCampaign,
  refundLoyaltyScore,
  handleScore,
} from '~/utils/utils';
import {
  checkPricing,
  getMainConditions,
} from '~/modules/pricing/utils';
import { calculateDiscountValue, calculatePriceAdjust } from '~/modules/pricing/utils/rule';
import { getAllowedProducts } from '~/modules/pricing/utils/product';

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
        status: 'success',
      };
    }),

    handleLoyaltyReward: t.procedure
      .input(z.any())
      .mutation(async ({ ctx }) => {
        const { subdomain } = ctx;
        const result = await handleLoyaltyReward({ subdomain });
        return { data: result, status: 'success' };
      }),

    confirmLoyalties: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        const { checkInfo, extraInfo } = input;
        const result = await confirmVoucherSale(
          models,
          subdomain,
          checkInfo,
          extraInfo
        );
        return { data: result, status: 'success' };
      }),

    changeCustomer: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      // If handleLoyaltyOwnerChange is needed, implement it similarly.
      // Not present in the provided 2.x files – leave as is or add later.
      return;
    }),
  }),

  pricing: t.router({
    checkPricing: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { subdomain } = ctx;
      const models = await ctx.models;
      const {
        prioritizeRule,
        totalAmount,
        departmentId,
        branchId,
        products,
        pipelineId,
      } = input;

      // Use 'orderItems' instead of 'products' to match the expected function signature
      const data = await checkPricing({
        models,
        subdomain,
        prioritizeRule,
        totalAmount,
        departmentId,
        branchId,
        pipelineId,
        orderItems: products, // renamed to orderItems
      });
      return { data: data || {}, status: 'success' };
    }),

    getQuantityRules: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { subdomain } = ctx;
      const models = await ctx.models;
      const { products, branchId, departmentId } = input;

      const productsById = {};
      for (const product of products) {
        productsById[product._id] = product;
      }

      const productIds = products.map((pr) => pr._id);
      const rulesByProductId = {};

      const conditions = getMainConditions({ branchId, departmentId });
      conditions.isPriority = false;

      const plans = await models.PricingPlans.find({
        ...conditions,
        'quantityRules.0': { $exists: true },
      }).sort({ value: -1 });

      let value = 0;
      let discountValue = 0;
      let adjustType;
      let adjustFactor;

      for (const plan of plans) {
        const allowedProductIds = await getAllowedProducts(
          subdomain,
          plan,
          productIds || []
        );

        const rules = plan.quantityRules || [];
        if (!(allowedProductIds.length > 0 && rules.length > 0)) {
          continue;
        }

        const firstRule = rules[0];
        discountValue = firstRule.discountValue;
        value = firstRule.value;
        adjustType = firstRule.priceAdjustType;
        adjustFactor = firstRule.priceAdjustFactor;

        for (const allowProductId of allowedProductIds) {
          const product = productsById[allowProductId];
          const unitPrice = product.unitPrice || 0;
          const prePrice = (rulesByProductId[allowProductId] || {}).price || unitPrice;

          const price =
            unitPrice -
            calculatePriceAdjust(
              unitPrice,
              calculateDiscountValue(
                firstRule.discountType,
                discountValue,
                unitPrice
              ),
              adjustType,
              adjustFactor
            );

          if (price < prePrice) {
            rulesByProductId[allowProductId] = {
              value,
              price,
            };
          }
        }
      }

      return { data: rulesByProductId, status: 'success' };
    }),
  }),

  assignment: t.router({}),

  coupon: t.router({
    checkCoupon: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const data = await models.Coupons.checkCoupon(input);
      return { data, status: 'success' };
    }),
  }),

  donate: t.router({}),
  lottery: t.router({}),

  score: t.router({
    scoreCampaign: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const data = await models.ScoreCampaigns.findOne(input);
      return { data, status: 'success' };
    }),

    checkScoreAviableSubtract: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const data = await models.ScoreCampaigns.checkScoreAviableSubtract(input);
        return { data, status: 'success' };
      }),

    updateScore: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      await handleScore(models, input);
      return { data: null, status: 'success' };
    }),

    doScoreCampaign: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const data = await doScoreCampaign(models, input);
      return { data, status: 'success' };
    }),

    refundLoyaltyScore: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const data = await refundLoyaltyScore(models, input);
      return { data, status: 'success' };
    }),
  }),

  spin: t.router({}),

  voucher: t.router({
    voucherCampaigns: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
      const { models } = ctx;
      const data = await models.VoucherCampaigns.find(input).lean();
      return { data, status: 'success' };
    }),
  }),
});

export type AppRouter = typeof appRouter;