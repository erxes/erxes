import {
  ActivityLogInput,
  activityBuilder,
  Config,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { DEAL_ACTIVITY_FIELDS } from './constants';
import {
  generateDealConvertedActivityLog,
  generateDealCreatedActivityLog,
  generateDealMovedActivityLog,
} from './builders';
import { dealActivityResolvers } from './resolvers';
import { buildDealTarget } from './utils';

const DEAL_ACTIVITY_CONFIG: Config<ActivityLogInput> = {
  assignmentFields: [
    'assignedUserIds',
    'labelIds',
    'tagIds',
    'branchIds',
    'departmentIds',
  ],
  commonFields: [
    ...DEAL_ACTIVITY_FIELDS.map(({ field }) => field),
    'description',
    'stageId',
  ],
  resolvers: dealActivityResolvers,
  buildTarget: (document) => buildDealTarget(document),
};

export async function generateDealUpdateActivityLogs(
  prevDocument: any,
  currentDocument: any,
  models: IModels,
  createActivityLog: (
    activities: ActivityLogInput | ActivityLogInput[],
  ) => void,
  subdomain: string,
): Promise<void> {
  const activities = await activityBuilder(
    prevDocument,
    currentDocument,
    DEAL_ACTIVITY_CONFIG,
    { deal: currentDocument, models, subdomain },
  );

  if (activities.length > 0) {
    createActivityLog(activities);
  }
}

export {
  generateDealConvertedActivityLog,
  generateDealCreatedActivityLog,
  generateDealMovedActivityLog,
};
export { generateBoardActivityLogs } from './board';
export { generatePipelineActivityLogs } from './pipeline';
export { generateStageActivityLogs } from './stage';
export {
  generateChecklistActivityLogs,
  generateChecklistCreatedActivityLog,
  generateChecklistItemActivityLogs,
  generateChecklistItemCreatedActivityLog,
  generateChecklistItemRemovedActivityLog,
  generateChecklistRemovedActivityLog,
} from './checklist';
export { generatePipelineLabelActivityLogs } from './label';
