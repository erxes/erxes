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
  IActiveWindow,
  SCHEDULE_MOMENTS,
  ScheduleMoment,
} from '@/pricing/@types/schedule';
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

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_DAY = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const isMonthDay = (value?: string): value is string =>
  !!value &&
  MONTH_DAY.test(value) &&
  Number(value.slice(3)) <= DAYS_IN_MONTH[Number(value.slice(0, 2)) - 1];

const uniqueSorted = (values: number[] = []) =>
  [...new Set(values.map(Number))].sort((a, b) => a - b);

const outOfRange = (values: number[], min: number, max: number) =>
  values.some(
    (value) => !Number.isInteger(value) || value < min || value > max,
  );

// updatePlan writes through the raw collection, so the schema never checks
// these. A window keeps only the fields its type reads.
const cleanActiveWindow = (window: IActiveWindow): IActiveWindow => {
  const { type, startTime, endTime } = window;

  if (!TIME.test(startTime) || !(TIME.test(endTime) || endTime === '24:00')) {
    throw new Error('Window times must be HH:mm');
  }

  if (startTime === endTime) {
    throw new Error('A window cannot start and end at the same time');
  }

  switch (type) {
    case 'daily':
      return { type, startTime, endTime };
    case 'weekly': {
      const weekDays = uniqueSorted(window.weekDays);

      if (!weekDays.length || outOfRange(weekDays, 0, 6)) {
        throw new Error('A weekly window needs week days 0 (Sunday) to 6');
      }

      return { type, startTime, endTime, weekDays };
    }
    case 'monthly': {
      const monthDays = uniqueSorted(window.monthDays);

      if (!monthDays.length || outOfRange(monthDays, 1, 31)) {
        throw new Error('A monthly window needs days of the month 1 to 31');
      }

      return { type, startTime, endTime, monthDays };
    }
    case 'yearly': {
      const { fromMonthDay, toMonthDay } = window;

      if (!isMonthDay(fromMonthDay) || !isMonthDay(toMonthDay)) {
        throw new Error('A yearly window needs MM-DD start and end days');
      }

      return { type, startTime, endTime, fromMonthDay, toMonthDay };
    }
    default:
      throw new Error(`Unknown window type "${type}"`);
  }
};

const cleanClosedDates = (dates: string[]): string[] => {
  if (dates.some((date) => !DATE.test(date))) {
    throw new Error('Closed dates must be YYYY-MM-DD');
  }

  return [...new Set(dates)].sort();
};

const assertScheduleMoment = (moment?: ScheduleMoment) => {
  if (
    moment !== undefined &&
    !(SCHEDULE_MOMENTS as readonly string[]).includes(moment)
  ) {
    throw new Error(`Unknown schedule moment "${moment}"`);
  }
};

// Public and base prices are written ahead of time, so they cannot follow a clock.
const assertScheduleFitsPriority = (plan: Partial<IPricingPlan>) => {
  if (plan.isRepeatEnabled && plan.priority) {
    throw new Error('A scheduled plan cannot have a priority');
  }
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
    ...(doc.activeWindows
      ? { activeWindows: doc.activeWindows.map(cleanActiveWindow) }
      : {}),
    ...(doc.closedDates
      ? { closedDates: cleanClosedDates(doc.closedDates) }
      : {}),
  };

  assertScheduleMoment(normalizedDoc.scheduleMoment);

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
      const normalizedDoc = normalizePlanDoc(doc, { defaultPriority: true });

      assertScheduleFitsPriority(normalizedDoc);

      return models.PricingPlans.create({
        ...normalizedDoc,
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

      assertScheduleFitsPriority({
        ...(result as Partial<IPricingPlan>),
        ...normalizedDoc,
      });

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
