import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { pricingPlanSchema } from '../definitions/pricingPlan';
import {
  IPricingPlan,
  IPricingPlanDocument,
  PricingPlanPriority,
} from '@/pricing/@types/pricingPlan';
import { PRIORITY_TYPES } from '../definitions/constants';

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

const normalizePlanDoc = (doc: IPricingPlan): IPricingPlan => {
  const priority: PricingPlanPriority =
    doc.priority ?? (PRIORITY_TYPES.NONE as PricingPlanPriority);

  const normalizedDoc: IPricingPlan = {
    ...doc,
    priority,
  };

  if (priority === PRIORITY_TYPES.POS_BASE) {
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
    userId: string
  ): Promise<IPricingPlanDocument>;
  removePlan(id: string): Promise<IPricingPlanDocument>;
}

export const loadPricingPlanClass = (models: IModels) => {
  class PricingPlan {
    public static async getPricingPlan(id) {
      const plan = await models.PricingPlans.findOne({_id: id}).lean();
      if(!plan) {
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
        ...normalizePlanDoc(doc),
        // createdAt: new Date(),
        createdBy: userId,
        // updatedAt: new Date(),
        updatedBy: userId
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
      userId: string
    ) {
      const result = await models.PricingPlans.findById(id);

      if (!result) {
        throw new Error(`Can't find plan`);
      }
      if (doc._id) delete doc._id;
      const normalizedDoc = normalizePlanDoc(doc);

      await models.PricingPlans.findByIdAndUpdate(id, {
        $set: {
          ...normalizedDoc,
          updatedAt: new Date(),
          updatedBy: userId
        }
      });

      return await models.PricingPlans.findById(id);
    }

    /**
     * Remove plan
     * @param id Plan ID to remove
     * @returns Removed plan document
     */
    public static async removePlan(id: string) {
      const result = await models.PricingPlans.findById(id);

      if (!result) {
        throw new Error(`Can't find plan`);
      }

      return await models.PricingPlans.findByIdAndDelete(id);
    }
  }

  pricingPlanSchema.loadClass(PricingPlan);

  return pricingPlanSchema;
};
