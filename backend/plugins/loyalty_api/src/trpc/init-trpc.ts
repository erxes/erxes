import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import * as z from 'zod';
import { IModels } from '~/connectionResolvers';
import {
  checkVouchersSale,
  confirmVoucherSale,
  handleLoyaltyOwnerChange,
  handleLoyaltyReward,
  doScoreCampaign,
  refundLoyaltyScore,
  handleScore,
  consumeScoreTargetChange,
} from '~/utils/utils';
import { checkPricing, getMainConditions } from '~/modules/pricing/utils';
import {
  calculateDiscountValue,
  calculatePriceAdjust,
} from '~/modules/pricing/utils/rule';
import { getAllowedProducts } from '~/modules/pricing/utils/product';
import { SCORE_CAMPAIGN_STATUSES } from '~/modules/score/constants';

export type LoyaltyTRPCContext = ITRPCContext<{ models: IModels }>;
const t = initTRPC.context<LoyaltyTRPCContext>().create();

// Zod schemas

const productSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative().optional(),
  price: z.number().nonnegative().optional(),
});

const discountInfoSchema = z
  .object({
    couponCode: z.string().optional(),
    voucherId: z.string().optional(),
  })
  .optional();

const checkLoyaltiesInput = z.object({
  ownerType: z.string().optional().default('customer'),
  ownerId: z
    .string()
    .nullish()
    .transform((value) => value || ''),
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
      targetId: z.string().optional(),
      targetType: z.string().optional(),
      serviceName: z.string().optional(),
      totalAmount: z.union([z.string(), z.number()]).optional(),
    })
    .passthrough()
    .optional(),
});

const pricingProductSchema = z.object({
  _id: z.string().optional(),
  itemId: z.string().optional(),
  productId: z.string().optional(),
  unitPrice: z.number().nonnegative().optional(),
  price: z.number().nonnegative().optional(),
  quantity: z.number().int().positive(),
  manufacturedDate: z.string().optional(),
});

const checkPricingInput = z.object({
  prioritizeRule: z.string(),
  totalAmount: z.number().nonnegative(),
  departmentId: z.string().optional().default(''),
  branchId: z.string().optional().default(''),
  products: z.array(pricingProductSchema),
  pipelineId: z.string().optional(),
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
  ownerId: z
    .string()
    .nullish()
    .transform((value) => value || ''),
  totalAmount: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => (value === undefined ? undefined : Number(value))),
});

const scoreCampaignInput = z.object({
  _id: z.string(),
});

const checkScoreAviableSubtractInput = z
  .object({
    ownerType: z.string(),
    ownerId: z.string(),
    actionMethod: z.string().optional(),
    targetId: z.string().optional(),
    campaignId: z.string().optional(),
    target: z.record(z.any()).optional(),
  })
  .passthrough();

const updateScoreInput = z.object({
  action: z.enum(['add', 'subtract', 'set']),
  ownerId: z.string(),
  ownerType: z.string(),
  campaignId: z.string(),
  target: z.record(z.any()),
  description: z.string(),
  createdBy: z.string().optional(),
  serviceName: z.string().optional(),
  targetId: z.string().optional(),
  amount: z.number().optional(),
  quantity: z.number().optional(),
});

const doScoreCampaignInput = z
  .object({
    ownerType: z.string(),
    ownerId: z.string(),
    actionMethod: z.string(),
    campaignId: z.string().optional(),
    serviceName: z.string().optional(),
    target: z.record(z.any()).optional(),
    oldTarget: z.record(z.any()).optional(),
    targetId: z.string(),
  })
  .passthrough();

const consumeTargetChangeInput = z
  .object({
    contentType: z.string(),
    serviceName: z.string().optional(),
    targetId: z.string().optional(),
    target: z.record(z.any()).optional(),
    oldTarget: z.record(z.any()).optional(),
    stageContexts: z.record(z.any()).optional(),
    ownerHints: z.record(z.string().optional()).optional(),
  })
  .passthrough();

const getScoreCampaignsByStageInput = z.object({
  boardId: z.string(),
  pipelineId: z.string(),
  stageId: z.string(),
});

const refundLoyaltyScoreInput = z.object({
  targetId: z.string(),
  ownerType: z.string(),
  ownerId: z.string(),
  scoreCampaignIds: z.array(z.string()),
  checkInId: z.string(),
});

// Secure input for voucher campaigns (only allow specific fields)
const voucherCampaignsInput = z
  .object({
    _id: z.string().optional(),
    status: z.string().optional(),
    title: z.string().optional(),
    voucherType: z.string().optional(),
    // Add other allowed filter fields as needed
  })
  .optional();

// ============================================================================
// tRPC router
// ============================================================================
export const appRouter = t.router({
  loyalty: t.router({
    checkLoyalties: t.procedure
      .input(checkLoyaltiesInput)
      .query(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        const { ownerType, ownerId, products, discountInfo } = input;

        return (
          (await checkVouchersSale(
            models,
            subdomain,
            ownerType,
            ownerId,
            products.map((product) => ({
              ...product,
              unitPrice: product.unitPrice ?? product.price ?? 0,
            })),
            discountInfo,
          )) || {}
        );
      }),

    handleLoyaltyReward: t.procedure
      .input(z.undefined())
      .mutation(async ({ ctx }) => {
        const { subdomain } = ctx;
        const result = await handleLoyaltyReward({ subdomain });
        return result;
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
        return result;
      }),

    changeCustomer: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        const { customerId, customerIds } = input || {};

        await handleLoyaltyOwnerChange(
          subdomain,
          models,
          customerId,
          customerIds || [],
        );

        return null;
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
          itemId: p.itemId || p._id || p.productId || '',
          productId: p.productId || p._id || p.itemId || '',
          price: p.unitPrice ?? p.price ?? 0,
          quantity: p.quantity,
          manufacturedDate: p.manufacturedDate || new Date().toISOString(),
        }));

        return await checkPricing({
          models,
          subdomain,
          prioritizeRule,
          totalAmount,
          departmentId,
          branchId,
          pipelineId: pipelineId || '',
          orderItems,
        });
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
              rulesByProductId[allowProductId]?.price || unitPrice;

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

        return rulesByProductId;
      }),
  }),

  assignment: t.router({}),

  coupon: t.router({
    checkCoupon: t.procedure
      .input(checkCouponInput)
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        return await models.Coupons.checkCoupon(input);
      }),
  }),

  donate: t.router({}),
  lottery: t.router({}),

  score: t.router({
    scoreCampaign: t.procedure
      .input(scoreCampaignInput)
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        return await models.ScoreCampaigns.findOne(input);
      }),

    checkScoreAviableSubtract: t.procedure
      .input(checkScoreAviableSubtractInput)
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        return await models.ScoreCampaigns.checkScoreAviableSubtract(
          input as any,
        );
      }),

    getScoreCampaignsByStage: t.procedure
      .input(getScoreCampaignsByStageInput)
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        return await models.ScoreCampaigns.find({
          status: SCORE_CAMPAIGN_STATUSES.PUBLISHED,
          'additionalConfig.cardBasedRule': {
            $elemMatch: {
              boardId: input.boardId,
              pipelineId: input.pipelineId,
              stageIds: { $in: [input.stageId] },
            },
          },
        })
          .sort({ order: 1, createdAt: 1 })
          .lean();
      }),

    updateScore: t.procedure
      .input(updateScoreInput)
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        return await handleScore(models, input);
      }),

    doScoreCampaign: t.procedure
      .input(doScoreCampaignInput)
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        // Type assertion to bypass persistent TypeScript mismatch; input is validated by Zod
        return await doScoreCampaign(models, input);
      }),

    consumeTargetChange: t.procedure
      .input(consumeTargetChangeInput)
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        return await consumeScoreTargetChange({ models, subdomain, input });
      }),

    refundLoyaltyScore: t.procedure
      .input(refundLoyaltyScoreInput)
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        return await refundLoyaltyScore(models, input);
      }),
  }),

  spin: t.router({}),

  voucher: t.router({
    voucherCampaigns: t.procedure
      .input(voucherCampaignsInput)
      .query(async ({ ctx, input }) => {
        const { models } = ctx;
        return await models.VoucherCampaigns.find(input || {}).lean();
      }),
  }),
  // At the top of appRouter in init-trpc.ts:
  health: t.procedure.query(() => ({ status: 'ok' })),
});

export type AppRouter = typeof appRouter;
