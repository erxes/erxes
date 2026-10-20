import type { PricingPlanDetailQuery, PricingPlansQuery } from '~/gql/graphql';

export type PricingPriority = '' | 'public' | 'posBase' | 'pipelineBase';
export type PricingAppliesTo =
  | 'category'
  | 'product'
  | 'segment'
  | 'vendor'
  | 'tag'
  | 'bundle';

type TPricingPlanRow = NonNullable<
  NonNullable<PricingPlansQuery['pricingPlans']>[number]
>;

export type IPricing = Pick<
  TPricingPlanRow,
  '_id' | 'name' | 'status' | 'applyType' | 'createdAt' | 'updatedAt'
> & {
  priority: PricingPriority;
  createdBy: string;
};

export type IPricingPlanDetail = NonNullable<
  PricingPlanDetailQuery['pricingPlanDetail']
>;

export type IPricingQuantityRule = NonNullable<
  NonNullable<IPricingPlanDetail['quantityRules']>[number]
>;

export type IPricingPriceRule = NonNullable<
  NonNullable<IPricingPlanDetail['priceRules']>[number]
>;

export type IPricingExpiryRule = NonNullable<
  NonNullable<IPricingPlanDetail['expiryRules']>[number]
>;

export type TPricingConditionRuleRow = NonNullable<
  NonNullable<IPricingPlanDetail['conditionRules']>[number]
>;

// A line sold under the core product condition with this code is priced by
// this rule instead of the plan's own rules.
export interface IPricingConditionRule {
  conditionCode: string;
  discountType: 'default' | 'subtraction' | 'percentage' | 'bonus';
  discountValue: number;
  discountBonusProduct?: string | null;
  priceAdjustType: string;
  priceAdjustFactor: number;
}
