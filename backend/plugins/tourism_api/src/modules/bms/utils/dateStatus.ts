import { ITour } from '@/bms/@types/tour';
import { getEnv, sendTRPCMessage } from 'erxes-api-shared/utils';
import { tz } from 'moment-timezone';

export const TOUR_DATE_STATUSES = {
  RUNNING: 'running',
  COMPLETED: 'completed',
  SCHEDULED: 'scheduled',
  UNSCHEDULED: 'unscheduled',
  CANCELLED: 'cancelled',
} as const;

export type TourDateStatus =
  (typeof TOUR_DATE_STATUSES)[keyof typeof TOUR_DATE_STATUSES];

type TourDateFields = Pick<
  Partial<ITour>,
  | 'dateType'
  | 'startDate'
  | 'endDate'
  | 'availableFrom'
  | 'availableTo'
  | 'date_status'
>;

type ResolveTourDateStatusParams = {
  doc?: TourDateFields;
  existingTour?: TourDateFields | null;
  timezone?: string;
  now?: Date;
};

const pickRelevantDates = (tour: TourDateFields) => {
  if (tour.dateType === 'flexible') {
    return {
      startDate: tour.availableFrom,
      endDate: tour.availableTo,
    };
  }

  return {
    startDate: tour.startDate,
    endDate: tour.endDate,
  };
};

export const computeTourDateStatus = (
  tour: TourDateFields,
  timezone = 'UTC',
  now = new Date(),
): TourDateStatus => {
  if (tour.date_status === TOUR_DATE_STATUSES.CANCELLED) {
    return TOUR_DATE_STATUSES.CANCELLED;
  }

  const { startDate, endDate } = pickRelevantDates(tour);

  if (!startDate) {
    return TOUR_DATE_STATUSES.UNSCHEDULED;
  }

  const nowAtTimezone = tz(now, timezone);
  const startAtTimezone = tz(startDate, timezone);

  if (nowAtTimezone.isBefore(startAtTimezone, 'day')) {
    return TOUR_DATE_STATUSES.SCHEDULED;
  }

  if (endDate) {
    const endAtTimezone = tz(endDate, timezone);

    if (nowAtTimezone.isAfter(endAtTimezone, 'day')) {
      return TOUR_DATE_STATUSES.COMPLETED;
    }
  }

  return TOUR_DATE_STATUSES.RUNNING;
};

export const resolveTourDateStatus = ({
  doc = {},
  existingTour,
  timezone = 'UTC',
  now = new Date(),
}: ResolveTourDateStatusParams): TourDateStatus => {
  if (
    doc.date_status === TOUR_DATE_STATUSES.CANCELLED ||
    (doc.date_status === undefined &&
      existingTour?.date_status === TOUR_DATE_STATUSES.CANCELLED)
  ) {
    return TOUR_DATE_STATUSES.CANCELLED;
  }

  return computeTourDateStatus(
    {
      dateType: doc.dateType ?? existingTour?.dateType,
      startDate: doc.startDate ?? existingTour?.startDate,
      endDate: doc.endDate ?? existingTour?.endDate,
      availableFrom: doc.availableFrom ?? existingTour?.availableFrom,
      availableTo: doc.availableTo ?? existingTour?.availableTo,
    },
    timezone,
    now,
  );
};

export const getTourTimezone = async (subdomain: string): Promise<string> => {
  const defaultTimezone = getEnv({ name: 'TIMEZONE', defaultValue: 'UTC' });

  return await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'configs',
    action: 'getConfig',
    input: {
      code: 'TIMEZONE',
    },
    defaultValue: defaultTimezone,
  });
};
