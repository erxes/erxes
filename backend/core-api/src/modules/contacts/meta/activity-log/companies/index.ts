import {
  ActivityLogInput,
  activityBuilder,
  Config,
} from 'erxes-api-shared/core-modules';
import { ICompanyDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { COMPANY_ACTIVITY_FIELDS } from './constants';
import { companyActivityResolvers } from './resolvers';
import { buildCompanyTarget } from './utils';

const COMPANY_ACTIVITY_CONFIG: Config<ActivityLogInput> = {
  assignmentFields: ['tagIds'],
  commonFields: [
    ...COMPANY_ACTIVITY_FIELDS.map(({ field }) => field),
    'links.*',
  ],
  resolvers: companyActivityResolvers,
  buildTarget: (document) => buildCompanyTarget(document),
};

export async function generateCompanyUpdateActivityLogs(
  prevDocument: ICompanyDocument,
  currentDocument: ICompanyDocument,
  models: IModels,
  createActivityLog: (
    activities: ActivityLogInput | ActivityLogInput[],
  ) => void,
): Promise<void> {
  const activities = await activityBuilder(
    prevDocument,
    currentDocument,
    COMPANY_ACTIVITY_CONFIG,
    { company: currentDocument, models },
  );

  if (activities.length > 0) {
    createActivityLog(activities);
  }
}
