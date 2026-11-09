import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { IPricingActiveWindow, PricingScheduleMoment } from '@/pricing/types';
import { PRICING_PLAN_SCHEDULE_CHECK } from '@/pricing/graphql/queries';
import { toWindowInput } from '@/pricing/utils/schedule';

interface ScheduleCheckResult {
  pricingPlanScheduleCheck: {
    active: boolean;
    matchedMoment: 'checkout' | 'orderCreated' | null;
    timeZone: string;
    window: IPricingActiveWindow | null;
  };
}

const pad = (value: number) => String(value).padStart(2, '0');

// 'YYYY-MM-DDTHH:mm' on this browser's clock, as a datetime-local input holds it.
const localNow = (minutesAgo = 0) => {
  const now = new Date(Date.now() - minutesAgo * 60 * 1000);

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate(),
  )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

// Checks the schedule as edited, before it is saved.
export const useScheduleCheck = ({
  windows,
  closedDates,
  scheduleMoment,
}: {
  windows: IPricingActiveWindow[];
  closedDates: string[];
  scheduleMoment: PricingScheduleMoment;
}) => {
  const [orderCreatedAt, setOrderCreatedAt] = useState(localNow(20));
  const [checkoutAt, setCheckoutAt] = useState(localNow());

  const { data, loading, error } = useQuery<ScheduleCheckResult>(
    PRICING_PLAN_SCHEDULE_CHECK,
    {
      variables: {
        activeWindows: windows.map(toWindowInput),
        closedDates,
        scheduleMoment,
        checkoutAt,
        orderCreatedAt: orderCreatedAt || undefined,
      },
      skip: !checkoutAt || !windows.length,
    },
  );

  return {
    orderCreatedAt,
    checkoutAt,
    setOrderCreatedAt,
    setCheckoutAt,
    loading,
    error,
    result: windows.length ? data?.pricingPlanScheduleCheck : undefined,
  };
};
