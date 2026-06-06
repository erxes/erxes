import {
  ActivityLogInput,
  activityBuilder,
  Config,
} from 'erxes-api-shared/core-modules';
import { ICustomerDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { CUSTOMER_ACTIVITY_FIELDS } from './constants';
import { customerActivityResolvers } from './resolvers';
import { buildCustomerTarget } from './utils';

const CUSTOMER_ACTIVITY_CONFIG: Config<ActivityLogInput> = {
  assignmentFields: ['tagIds'],
  commonFields: [
    ...CUSTOMER_ACTIVITY_FIELDS.map(({ field }) => field),
    'sex',
    'ownerId',
    'links.*',
  ],
  resolvers: customerActivityResolvers,
  buildTarget: (document) => buildCustomerTarget(document),
};

export async function generateCustomerUpdateActivityLogs(
  context: { subdomain: string; models: IModels },
  prevDocument: ICustomerDocument,
  currentDocument: ICustomerDocument,
  createActivityLog: (
    activities: ActivityLogInput | ActivityLogInput[],
  ) => void,
): Promise<void> {
  try {
    const activities = await activityBuilder(
      prevDocument,
      currentDocument,
      CUSTOMER_ACTIVITY_CONFIG,
      {
        ...context,
        customer: currentDocument,
      },
    );

    if (activities.length > 0) {
      createActivityLog(activities);
    }
  } catch (error) {
    console.error('Failed to generate customer activity logs', error, {
      customerId: currentDocument?._id || prevDocument?._id,
      subdomain: context.subdomain,
    });
  }
}
