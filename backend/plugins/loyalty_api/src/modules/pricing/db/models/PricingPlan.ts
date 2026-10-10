import { Model, Types } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { pricingPlanSchema } from '../definitions/pricingPlan';
import {
  IPricingConditionRule,
  IPricingPlan,
  IPricingPlanDocument,
  PricingPlanPriority,
} from '@/pricing/@types/pricingPlan';
import {
  PRICE_ADJUST_TYPES,
  PRIORITY_TYPES,
  RULE_DISCOUNT_TYPES,
} from '../definitions/constants';

type ParticipantField =
  | 'customerIds'
  | 'customerTags'
  | 'customerExcludeTags'
  | 'customerSegmentIds'
  | 'companyIds'
  | 'companyTags'
  | 'companyExcludeTags'
  | 'companySegmentIds'
  | 'userIds'
  | 'userPositions'
  | 'userSegmentIds'
  | 'brokerCustomerIds'
  | 'brokerCustomerTags'
  | 'brokerCustomerExcludeTags'
  | 'brokerCustomerSegmentIds'
  | 'brokerCompanyIds'
  | 'brokerCompanyTags'
  | 'brokerCompanyExcludeTags'
  | 'brokerCompanySegmentIds'
  | 'brokerUserIds'
  | 'brokerUserPositions'
  | 'brokerUserSegmentIds';

const participantFields: ParticipantField[] = [
  'customerIds',
  'customerTags',
  'customerExcludeTags',
  'customerSegmentIds',
  'companyIds',
  'companyTags',
  'companyExcludeTags',
  'companySegmentIds',
  'userIds',
  'userPositions',
  'userSegmentIds',
  'brokerCustomerIds',
  'brokerCustomerTags',
  'brokerCustomerExcludeTags',
  'brokerCustomerSegmentIds',
  'brokerCompanyIds',
  'brokerCompanyTags',
  'brokerCompanyExcludeTags',
  'brokerCompanySegmentIds',
  'brokerUserIds',
  'brokerUserPositions',
  'brokerUserSegmentIds',
];

// updatePlan writes through the raw collection, so the schema never checks these.
const cleanConditionRules = (
  rules: IPricingConditionRule[],
): IPricingConditionRule[] => {
  const seen = new Set<string>();

  return rules.map((rule) => {
    const code = (rule.conditionCode || '').trim();
    const discountType = rule.discountType || RULE_DISCOUNT_TYPES.DEFAULT;
    const discountValue = Number(rule.discountValue) || 0;
    const priceAdjustType = rule.priceAdjustType || PRICE_ADJUST_TYPES.NONE;
    const priceAdjustFactor = Number(rule.priceAdjustFactor) || 0;
    const discountBonusProduct = (rule.discountBonusProduct || '').trim();

    if (!code) {
      throw new Error('Choose a condition for each condition discount');
    }

    if (seen.has(code)) {
      throw new Error(`Condition "${code}" has more than one discount`);
    }

    if (
      !(RULE_DISCOUNT_TYPES.ALL as readonly string[]).includes(discountType)
    ) {
      throw new Error(`Unknown condition discount type "${discountType}"`);
    }

    if (discountValue < 0) {
      throw new Error('A condition discount cannot be negative');
    }

    if (
      discountType === RULE_DISCOUNT_TYPES.PERCENTAGE &&
      discountValue > 100
    ) {
      throw new Error('A condition discount must be at most 100%');
    }

    if (discountType === RULE_DISCOUNT_TYPES.BONUS && !discountBonusProduct) {
      throw new Error(`Choose a bonus product for condition "${code}"`);
    }

    if (
      !(PRICE_ADJUST_TYPES.ALL as readonly string[]).includes(priceAdjustType)
    ) {
      throw new Error(`Unknown price adjust type "${priceAdjustType}"`);
    }

    seen.add(code);

    return {
      conditionCode: code,
      discountType,
      discountValue,
      ...(discountType === RULE_DISCOUNT_TYPES.BONUS
        ? { discountBonusProduct }
        : {}),
      priceAdjustType,
      priceAdjustFactor,
    };
  });
};

const normalizePlanDoc = (
  doc: Partial<IPricingPlan>,
  options: { defaultPriority?: boolean } = {},
): Partial<IPricingPlan> => {
  const priority: PricingPlanPriority | undefined =
    doc.priority ??
    (options.defaultPriority
      ? (PRIORITY_TYPES.NONE as PricingPlanPriority)
      : undefined);

  const normalizedDoc: Partial<IPricingPlan> = {
    ...doc,
    ...(priority ? { priority } : {}),
    ...(doc.conditionRules
      ? { conditionRules: cleanConditionRules(doc.conditionRules) }
      : {}),
  };

  if (
    priority === PRIORITY_TYPES.POS_BASE ||
    priority === PRIORITY_TYPES.PIPELINE_BASE
  ) {
    const participants = normalizedDoc as Record<
      ParticipantField,
      string[] | undefined
    >;

    for (const field of participantFields) {
      participants[field] = [];
    }
  }

  return normalizedDoc;
};

export interface IPricingPlanModel extends Model<IPricingPlanDocument> {
  getPricingPlan(id: string): Promise<IPricingPlanDocument>;
  createPlan(doc: IPricingPlan, userId: string): Promise<IPricingPlanDocument>;
  updatePlan(
    id: string,
    doc: IPricingPlan,
    userId: string,
  ): Promise<IPricingPlanDocument>;
  removePlan(id: string): Promise<IPricingPlanDocument>;
}

export const loadPricingPlanClass = (models: IModels) => {
  class PricingPlan {
    public static async getPricingPlan(id) {
      // Use raw collection to bypass schema String-cast on _id,
      // so existing ObjectId documents are found alongside new nanoid ones.
      const filter: any = { _id: id };
      if (Types.ObjectId.isValid(id) && id.length === 24) {
        filter.$or = [{ _id: id }, { _id: new Types.ObjectId(id) }];
        delete filter._id;
      }
      const plan = await models.PricingPlans.collection.findOne(filter);
      if (!plan) {
        throw new Error('not found pricing plan');
      }
      return plan;
    }

    /**
     * Create pricing plan
     * @param doc Plan document to create
     * @param userId Requested user id
     * @returns Created plan document
     */
    public static async createPlan(doc: IPricingPlan, userId: string) {
      return models.PricingPlans.create({
        ...normalizePlanDoc(doc, { defaultPriority: true }),
        // createdAt: new Date(),
        createdBy: userId,
        // updatedAt: new Date(),
        updatedBy: userId,
      });
    }

    /**
     * Update plan
     * @param id Plan ID to update
     * @param doc Plan document to update
     * @param userId Requested user id
     * @returns Updated plan document
     */
    public static async updatePlan(
      id: string,
      doc: IPricingPlan & { _id?: string },
      userId: string,
    ) {
      const filter: any = { _id: id };
      if (Types.ObjectId.isValid(id) && id.length === 24) {
        filter.$or = [{ _id: id }, { _id: new Types.ObjectId(id) }];
        delete filter._id;
      }

      const result = await models.PricingPlans.collection.findOne(filter);
      if (!result) throw new Error(`Can't find plan`);
      if (doc._id) delete doc._id;
      const normalizedDoc = normalizePlanDoc(doc);
      const unsetDates: Record<string, string> = {};

      if (normalizedDoc.isStartDateEnabled === false) {
        delete normalizedDoc.startDate;
        unsetDates.startDate = '';
      }

      if (normalizedDoc.isEndDateEnabled === false) {
        delete normalizedDoc.endDate;
        unsetDates.endDate = '';
      }

      await models.PricingPlans.collection.updateOne(filter, {
        $set: {
          ...normalizedDoc,
          updatedAt: new Date(),
          updatedBy: userId,
        },
        ...(Object.keys(unsetDates).length ? { $unset: unsetDates } : {}),
      });

      return models.PricingPlans.collection.findOne(filter);
    }

    /**
     * Remove plan
     * @param id Plan ID to remove
     * @returns Removed plan document
     */
    public static async removePlan(id: string) {
      const result = await models.PricingPlans.findById(id);

      if (!result) throw new Error(`Can't find plan`);

      await models.PricingFixedValues.removeByPlanId(id);

      return models.PricingPlans.findByIdAndDelete(id);
    }
  }

  pricingPlanSchema.loadClass(PricingPlan);

  return pricingPlanSchema;
};
