import {
  ActivityLogInput,
  activityBuilder,
  Config,
} from 'erxes-api-shared/core-modules';
import { IProductDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { PRODUCT_ACTIVITY_FIELDS } from './constants';
import { productActivityResolvers } from './resolvers';
import { buildProductTarget } from './utils';

const PRODUCT_ACTIVITY_CONFIG: Config<ActivityLogInput> = {
  assignmentFields: ['tagIds'],
  commonFields: [
    ...PRODUCT_ACTIVITY_FIELDS.map(({ field }) => field),
    'description',
  ],
  resolvers: productActivityResolvers,
  buildTarget: (document) => buildProductTarget(document),
};

export async function generateProductUpdateActivityLogs(
  prevDocument: IProductDocument,
  currentDocument: IProductDocument,
  models: IModels,
  createActivityLog: (
    activities: ActivityLogInput | ActivityLogInput[],
  ) => void,
): Promise<void> {
  const activities = await activityBuilder(
    prevDocument,
    currentDocument,
    PRODUCT_ACTIVITY_CONFIG,
    { product: currentDocument, models },
  );

  if (activities.length > 0) {
    createActivityLog(activities);
  }
}
