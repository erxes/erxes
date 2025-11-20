import { TActivityGetterInputData } from 'erxes-api-shared/core-modules';
import { TActivityGetterResponse } from 'erxes-api-shared/utils';
import { IDeal } from '../../@types';
import { generateAssigneeActivity } from './generateAssigneeActivity';

export default {
  rules: [
    {
      activityType: 'assignee',
      updatedFields: ['assignedUserIds'],
    },
    {
      activityType: 'priorityChanged',
      updatedFields: ['priority'],
    },
  ],
  activityGetter: async (
    {
      activityType,
      fullDocument,
      prevDocument,
    }: TActivityGetterInputData<IDeal>,
    { subdomain }: { subdomain: string },
  ): Promise<TActivityGetterResponse | TActivityGetterResponse[]> => {
    if (activityType === 'assignee') {
      return await generateAssigneeActivity(
        subdomain,
        fullDocument,
        prevDocument,
      );
    }
    if (activityType === 'priorityChanged') {
      return {
        targetType: 'sales.deal',
        target: {
          moduleName: 'sales',
          collectionName: 'deal',
          text: fullDocument.name,
          data: fullDocument,
        },
        contextType: 'priority',
        context: {
          text: fullDocument.priority || 'No priority',
        },
        action: {
          type: 'changed',
          description: 'changed priority',
        },
      };
    }
    return [];
  },
};
/*
Example activity log schema:
*/
