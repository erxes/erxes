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
import { checkPricing, getMainConditions } from '~/modules/pricing/utils';
import {
  calculateDiscountValue,
  calculatePriceAdjust,
} from '~/modules/pricing/utils/rule';
import { getAllowedProducts } from '~/modules/pricing/utils/product';

export type LoyaltyTRPCContext = ITRPCContext<{ models: IModels }>;
const t = initTRPC.context<LoyaltyTRPCContext>().create();

// Zod schemas
const productSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
});

const discountInfoSchema = z
  .object({
    couponCode: z.string().optional(),
    voucherId: z.string().optional(),
  })
  .optional();

const checkLoyaltiesInput = z.object({
  ownerType: z.string(),
  ownerId: z.string(),
  products: z.array(productSchema),
  discountInfo: discountInfoSchema,
});

const confirmLoyaltiesInput = z.object({
  checkInfo: z.record(
    z.object({
      voucherId: z.string(),
      count: z.number().int().nonnegative(),
    }),
  ),
  extraInfo: z
    .object({
      couponCode: z.string().optional(),
      voucherId: z.string().optional(),
      ownerType: z.string().optional(),
      ownerId: z.string().optional(),
      targetid: z.string().optional(),
      serviceName: z.string().optional(),
      totalAmount: z.string().optional(),
    })
    .optional(),
});

const pricingProductSchema = z.object({
  _id: z.string(),
  unitPrice: z.number().nonnegative(),
  quantity: z.number().int().positive(),
});

const checkPricingInput = z.object({
  prioritizeRule: z.string(), // FIXED: changed from boolean to string
  totalAmount: z.number().nonnegative(),
  departmentId: z.string(),
  branchId: z.string(),
  products: z.array(pricingProductSchema),
  pipelineId: z.string(),
});

const quantityRulesInput = z.object({
  products: z.array(
    z.object({
      _id: z.string(),
      unitPrice: z.number().nonnegative(),
    }),
  ),
  branchId: z.string(),
  departmentId: z.string(),
});

const checkCouponInput = z.object({
  code: z.string(),
  ownerId: z.string(),
  totalAmount: z.number().optional(),
});

const scoreCampaignInput = z.object({
  _id: z.string(),
});

const checkScoreAviableSubtractInput = z.object({
  ownerType: z.string(),
  ownerId: z.string(),
  actionMethod: z.string(),
  targetId: z.string(),
});

const updateScoreInput = z.object({
  action: z.enum(['add', 'subtract']),
  ownerId: z.string(),
  ownerType: z.string(),
  campaignId: z.string(),
  target: z.record(z.any()),
  description: z.string(),
});

const doScoreCampaignInput = z.object({
  ownerType: z.string(),
  ownerId: z.string(),
  actionMethod: z.string(),
  targetId: z.string(),
});

const refundLoyaltyScoreInput = z.object({
  targetId: z.string(),
  ownerType: z.string(),
  ownerId: z.string(),
  scoreCampaignIds: z.array(z.string()),
  checkInId: z.string(),
});

// For voucherCampaigns: allow any query object, but default to empty object
const voucherCampaignsInput = z.record(z.any()).optional();

// tRPC router
export const appRouter = t.router({
  loyalty: t.router({
    checkLoyalties: t.procedure
      .input(checkLoyaltiesInput)
      .query(async ({ ctx, input }) => {
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

    handleLoyaltyReward: t.procedure
      .input(z.undefined())
      .mutation(async ({ ctx }) => {
        const { subdomain } = ctx;
        const result = await handleLoyaltyReward({ subdomain });
        return { data: result, status: 'success' };
      }),

    confirmLoyalties: t.procedure
      .input(confirmLoyaltiesInput)
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        const { checkInfo, extraInfo } = input;
        const result = await confirmVoucherSale(
          models,
          subdomain,
          checkInfo,
          extraInfo,
        );
        return { data: result, status: 'success' };
      }),

    changeCustomer: t.procedure.input(z.any()).mutation(async () => {
      return;
    }),
  }),

  pricing: t.router({
    checkPricing: t.procedure
      .input(checkPricingInput)
      .query(async ({ ctx, input }) => {
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

        // Map products to OrderItem type expected by checkPricing
        const orderItems = products.map((p) => ({
          itemId: p._id,
          productId: p._id,
          price: p.unitPrice,
          quantity: p.quantity,
          manufacturedDate: new Date().toISOString(), // FIXED: now a string
        }));

        const data = await checkPricing({
          models,
          subdomain,
          prioritizeRule,
          totalAmount,
          departmentId,
          branchId,
          pipelineId,
          orderItems,
        });
        return { data: data || {}, status: 'success' };
      }),

    getQuantityRules: t.procedure
      .input(quantityRulesInput)
      .query(async ({ ctx, input }) => {
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
            productIds || [],
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
            const prePrice =
              (rulesByProductId[allowProductId] || {}).price || unitPrice;

            const price =
              unitPrice -
              calculatePriceAdjust(
                unitPrice,
                calculateDiscountValue(
                  firstRule.discountType,
                  discountValue,
                  unitPrice,
                ),
                adjustType,
                adjustFactor,
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
    checkCoupon: t.procedure
      .input(checkCouponInput)
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const data = await models.Coupons.checkCoupon(input);
        return { data, status: 'success' };
      }),
  }),

  donate: t.router({}),
  lottery: t.router({}),

  score: t.router({
    scoreCampaign: t.procedure
      .input(scoreCampaignInput)
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const data = await models.ScoreCampaigns.findOne(input);
        return { data, status: 'success' };
      }),

    checkScoreAviableSubtract: t.procedure
      .input(checkScoreAviableSubtractInput)
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const data = await models.ScoreCampaigns.checkScoreAviableSubtract(
          input as any,
        );
        return { data, status: 'success' };
      }),

    updateScore: t.procedure
      .input(updateScoreInput)
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        await handleScore(models, input);
        return { data: null, status: 'success' };
      }),

    doScoreCampaign: t.procedure
      .input(doScoreCampaignInput)
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        // Type assertion to bypass persistent TypeScript mismatch; input is validated by Zod
        const data = await doScoreCampaign(models, input as any);
        return { data, status: 'success' };
      }),

    refundLoyaltyScore: t.procedure
      .input(refundLoyaltyScoreInput)
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        const data = await refundLoyaltyScore(models, input);
        return { data, status: 'success' };
      }),
  }),

  spin: t.router({}),

  voucher: t.router({
    voucherCampaigns: t.procedure
      .input(voucherCampaignsInput)
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        const data = await models.VoucherCampaigns.find(input || {}).lean();
        return { data, status: 'success' };
      }),
  }),
});

export type AppRouter = typeof appRouter;
