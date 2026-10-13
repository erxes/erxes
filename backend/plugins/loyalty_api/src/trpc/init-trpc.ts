import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import * as z from 'zod';
import { IModels } from '~/connectionResolvers';
import {
  checkVouchersSale,
  confirmVoucherSale,
  handleLoyaltyOwnerChange,
} from '~/utils/utils';
import { checkPricing, getMainConditions } from '~/modules/pricing/utils';
import {
  calculateDiscountValue,
  calculatePriceAdjust,
} from '~/modules/pricing/utils/rule';
import { getAllowedProducts } from '~/modules/pricing/utils/product';
import { getOwnerSummary } from '~/utils/ownerSummary';
import { TScoreSkip } from '@/score/@types/earnTable';
import { applyOwnerTier, tierForPurchase } from '@/score/services/purchaseTier';

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

const ownerSummaryInput = z.object({
  ownerType: z.enum(['customer', 'company', 'user']),
  ownerId: z.string().min(1),
  // The sale's total, so reward vouchers can be checked against it.
  totalAmount: z.number().min(0).optional(),
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
  manufacturedDate: z.string().nullish(),
  conditionCode: z.string().nullish(),
});

const participantKindSchema = z.preprocess(
  (value) => value || 'customer',
  z.enum(['customer', 'company', 'user']),
);

const checkPricingInput = z.object({
  prioritizeRule: z.string(),
  totalAmount: z.number().nonnegative(),
  departmentId: z.string().optional().default(''),
  branchId: z.string().optional().default(''),
  products: z.array(pricingProductSchema),
  pipelineId: z.string().nullish(),
  customerType: participantKindSchema,
  customerId: z.string().optional(),
  brokerType: participantKindSchema,
  brokerId: z.string().optional(),
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

// Loyalty's spending contract: the selling side says what a purchase paid
// with points; loyalty checks it against the campaign's rules and records it.
const spendInput = z.object({
  ownerType: z.string(),
  ownerId: z.string(),
  campaignId: z.string(),
  targetId: z.string(),
  // The record paid for, e.g. `sales:pos.orders`.
  targetType: z.string(),
  serviceName: z.string().optional(),
  // Money paid with points on this purchase; the whole amount, not a delta.
  pointsPaymentAmount: z.number().min(0),
  totalAmount: z.number().min(0),
  actorId: z.string().optional(),
});

const purchaseInput = z.object({
  totalAmount: z.number().min(0),
  paidAmount: z.number().min(0),
  items: z
    .array(
      z.object({
        productId: z.string(),
        amount: z.number(),
        discounted: z.boolean().optional(),
      }),
    )
    .optional(),
});

// What a purchase earns as it stands now; saying it again moves the standing
// entry to the new amount instead of adding another.
const earnInput = z.object({
  ownerType: z.string(),
  ownerId: z.string(),
  campaignId: z.string(),
  targetId: z.string(),
  targetType: z.string(),
  serviceName: z.string().optional(),
  actorId: z.string().optional(),
  purchase: purchaseInput,
});

// What a purchase would earn, asked before it is paid; nothing is written.
const earnPreviewInput = z.object({
  ownerType: z.string(),
  ownerId: z.string(),
  rules: z.array(
    z.object({
      campaignId: z.string(),
      earnRowKeys: z.array(z.string()).optional(),
    }),
  ),
  purchase: purchaseInput,
});

// The tier one purchase earns by amount, written straight to the owner.
const applyPurchaseTierInput = z.object({
  ownerType: z.string(),
  ownerId: z.string(),
  accountTypeId: z.string(),
  bands: z
    .array(
      z.object({
        tier: z.string(),
        min: z.number().nullish(),
        max: z.number().nullish(),
      }),
    )
    .min(1),
  onlyUpgrade: z.boolean().optional(),
  totalAmount: z.number().min(0),
  // The record paid for and who saved it, kept on the tier log.
  targetId: z.string().optional(),
  targetType: z.string().optional(),
  targetName: z.string().optional(),
  actorId: z.string().optional(),
});

const refundInput = z.object({
  targetId: z.string(),
  description: z.string().optional(),
  actorId: z.string().optional(),
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

// #region Router
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

    // Balances, tiers and sale vouchers for the owner a selling screen serves.
    ownerSummary: t.procedure
      .input(ownerSummaryInput)
      .query(async ({ ctx, input }) =>
        getOwnerSummary(ctx.models, ctx.subdomain, input),
      ),

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
          customerType,
          customerId,
          brokerType,
          brokerId,
        } = input;

        // Map products to OrderItem type expected by checkPricing
        const orderItems = products.map((p) => ({
          itemId: p.itemId || p._id || p.productId || '',
          productId: p.productId || p._id || p.itemId || '',
          price: p.unitPrice ?? p.price ?? 0,
          quantity: p.quantity,
          manufacturedDate: p.manufacturedDate || new Date().toISOString(),
          conditionCode: p.conditionCode || undefined,
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
          customerType,
          customerId,
          brokerType,
          brokerId,
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
        conditions.$and = [
          ...(conditions.$and || []),
          {
            $or: [{ priority: { $ne: 'posBase' } }],
          },
        ];

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

    checkSpend: t.procedure
      .input(spendInput)
      .query(async ({ ctx, input }) =>
        ctx.models.ScoreCampaigns.checkSpend(input),
      ),

    spend: t.procedure
      .input(spendInput)
      .mutation(async ({ ctx, input }) =>
        ctx.models.ScoreCampaigns.spend(input),
      ),

    earn: t.procedure.input(earnInput).mutation(async ({ ctx, input }) => {
      const skips: TScoreSkip[] = [];
      const log = await ctx.models.ScoreCampaigns.earn(input, (found) =>
        skips.push(...found),
      );

      return { changeScore: Number(log?.changeScore) || 0, skips };
    }),

    earnPreview: t.procedure
      .input(earnPreviewInput)
      .query(async ({ ctx, input }) =>
        ctx.models.ScoreCampaigns.previewEarnRules(input),
      ),

    applyPurchaseTier: t.procedure
      .input(applyPurchaseTierInput)
      .mutation(async ({ ctx, input }) => {
        const accountType =
          await ctx.models.LoyaltyAccountTypes.getActiveAccountType(
            input.accountTypeId,
          );
        const outcome = tierForPurchase(
          accountType.tiers,
          { bands: input.bands },
          input.totalAmount,
        );

        if ('skip' in outcome) {
          return { changed: false, skip: outcome.skip };
        }

        return applyOwnerTier({
          models: ctx.models,
          subdomain: ctx.subdomain,
          accountType,
          ownerType: input.ownerType,
          ownerId: input.ownerId,
          tier: outcome.tier,
          keepHigher: input.onlyUpgrade,
          via: {
            createdBy: input.actorId,
            targetId: input.targetId,
            targetType: input.targetType,
            targetName: input.targetName,
          },
        });
      }),

    refund: t.procedure
      .input(refundInput)
      .mutation(async ({ ctx, input }) =>
        ctx.models.ScoreCampaigns.refundTarget(input),
      ),
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
