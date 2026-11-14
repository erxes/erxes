import { IModels } from '~/connectionResolvers';
import { loyaltyTimeZone } from '@/score/services/periodSchedule';
import { IActiveWindow, ScheduleMoment } from '../@types/schedule';
import { EligibilityCache, planMatchesContext } from './eligibility';
import {
  ParticipantKind,
  getMainConditions,
  typedParticipantContext,
} from './index';
import { getAllowedProducts } from './product';
import { scheduleMatchAt, scheduleTimesAt } from './schedule';

export interface IPricingScheduleStatus {
  planId: string;
  planName: string;
  scheduleMoment: ScheduleMoment;
  active: boolean;
  matchedMoment?: 'checkout' | 'orderCreated';
  // The window the purchase matched, or the one open now.
  window?: IActiveWindow;
  // Open now: when its window closes.
  endsAt?: Date;
  // Next window start after now.
  startsAt?: Date;
  // A window that closed earlier today.
  endedAt?: Date;
}

/**
 * Scheduled plans that would price these products for this buyer, and where
 * each stands in its schedule: what a cashier needs to say why a line is or
 * is not discounted.
 */
export const getScheduleStatus = async ({
  models,
  subdomain,
  productIds,
  branchId,
  departmentId,
  customerType,
  customerId,
  checkout = new Date(),
  orderCreatedAt,
}: {
  models: IModels;
  subdomain: string;
  productIds: string[];
  branchId?: string;
  departmentId?: string;
  customerType?: ParticipantKind;
  customerId?: string;
  checkout?: Date;
  orderCreatedAt?: Date;
}): Promise<IPricingScheduleStatus[]> => {
  if (!productIds.length) {
    return [];
  }

  const plans = await models.PricingPlans.find({
    ...getMainConditions({ branchId, departmentId, date: checkout }),
    isRepeatEnabled: true,
    'activeWindows.0': { $exists: true },
  }).lean();

  if (!plans.length) {
    return [];
  }

  const timeZone = await loyaltyTimeZone(subdomain);
  const eligibilityCache: EligibilityCache = new Map();
  const context = typedParticipantContext({
    type: customerType,
    id: customerId,
  });
  const statuses: IPricingScheduleStatus[] = [];

  for (const plan of plans) {
    if (
      !(await planMatchesContext(subdomain, plan, context, eligibilityCache))
    ) {
      continue;
    }

    const allowed = await getAllowedProducts(subdomain, plan, productIds);

    if (!allowed.some((productId) => productIds.includes(productId))) {
      continue;
    }

    const match = scheduleMatchAt(
      plan,
      { checkout, orderCreated: orderCreatedAt },
      timeZone,
    );
    const times = scheduleTimesAt(plan, checkout, timeZone);

    statuses.push({
      planId: plan._id,
      planName: plan.name,
      scheduleMoment: plan.scheduleMoment || 'checkout',
      active: !!match,
      ...(match
        ? { matchedMoment: match.moment, window: match.window }
        : times.current
        ? { window: times.current.window }
        : {}),
      ...(times.current ? { endsAt: times.current.endsAt } : {}),
      ...(times.startsAt ? { startsAt: times.startsAt } : {}),
      ...(times.endedAt ? { endedAt: times.endedAt } : {}),
    });
  }

  return statuses;
};
