import { Job } from 'bullmq';
import {
  getEnv,
  getSaasOrganizations,
  sendTRPCMessage,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import {
  computeTourDateStatus,
  TOUR_DATE_STATUSES,
  type TourDateStatus,
} from '@/bms/utils/dateStatus';

type TourStatusJobData = {
  subdomain: string;
  timezone?: string;
};

type TourDateStatusSyncParams = {
  subdomain: string;
  timezone?: string;
};

export type TourDateStatusSyncResult = {
  matchedCount: number;
  modifiedCount: number;
  skippedCount: number;
};

export const scheduleTourDateStatusSync = async () => {
  const version = getEnv({ name: 'VERSION' });

  if (version && version === 'saas') {
    const organizations = await getSaasOrganizations();

    for (const organization of organizations) {
      await sendWorkerQueue('tourism', 'tour-date-status-sync').add(
        'tour-date-status-sync',
        {
          subdomain: organization.subdomain,
          timezone: organization.timezone || 'UTC',
        },
      );
    }

    return 'success';
  }

  const timezone = await sendTRPCMessage({
    subdomain: 'os',
    pluginName: 'core',
    method: 'query',
    module: 'configs',
    action: 'getConfig',
    input: {
      code: 'TIMEZONE',
    },
    defaultValue: getEnv({ name: 'TIMEZONE', defaultValue: 'UTC' }),
  });

  await sendWorkerQueue('tourism', 'tour-date-status-sync').add(
    'tour-date-status-sync',
    {
      subdomain: 'os',
      timezone,
    },
  );

  return 'success';
};

export const syncTourDateStatuses = async ({
  subdomain,
  timezone = 'UTC',
}: TourDateStatusSyncParams): Promise<TourDateStatusSyncResult> => {
  if (!subdomain) {
    return {
      matchedCount: 0,
      modifiedCount: 0,
      skippedCount: 0,
    };
  }

  const models = await generateModels(subdomain);
  const tours = await models.Tours.find(
    {
      date_status: { $ne: TOUR_DATE_STATUSES.CANCELLED },
    },
    {
      _id: 1,
      dateType: 1,
      startDate: 1,
      endDate: 1,
      availableFrom: 1,
      availableTo: 1,
      date_status: 1,
    },
  ).lean();

  const nextModifiedAt = new Date();
  const operations = tours.reduce<
    Array<{
      updateOne: {
        filter: { _id: string };
        update: {
          $set: {
            date_status: TourDateStatus;
            modifiedAt: Date;
          };
        };
      };
    }>
  >((acc, tour) => {
    const nextStatus = computeTourDateStatus(tour, timezone);

    if (nextStatus === tour.date_status) {
      return acc;
    }

    acc.push({
      updateOne: {
        filter: { _id: tour._id },
        update: {
          $set: {
            date_status: nextStatus,
            modifiedAt: nextModifiedAt,
          },
        },
      },
    });

    return acc;
  }, []);

  if (!operations.length) {
    return {
      matchedCount: tours.length,
      modifiedCount: 0,
      skippedCount: tours.length,
    };
  }

  await models.Tours.bulkWrite(operations);

  return {
    matchedCount: tours.length,
    modifiedCount: operations.length,
    skippedCount: tours.length - operations.length,
  };
};

export const syncTourDateStatus = async (job: Job<TourStatusJobData>) => {
  const { subdomain, timezone = 'UTC' } = job?.data ?? {};

  const result = await syncTourDateStatuses({ subdomain, timezone });

  if (!result.modifiedCount) {
    return;
  }

  console.log(
    `[Tourism] Updated date_status for ${result.modifiedCount} tours in ${subdomain}`,
  );
};
