import { IUserDocument } from '@erxes/api-utils/src/types';
import { models } from './connectionResolver';

const templates = [
  {
    templateType: 'dealsChart',
    name: 'dealsChart',
    getChartResult: (filter: any, currentUser?: IUserDocument) => {
      const DEFAULT_FILTER = {
        userIds: [`${currentUser?._id}`],
        userId: `${currentUser?._id}`,
        pipelineId: '1231'
      };

      const query = {
        userId: { $in: DEFAULT_FILTER.userIds },
        pipelineId: DEFAULT_FILTER.pipelineId
      } as any;

      if (filter.userIds) {
        query.userId.$in = filter.userIds;
      }

      if (filter.pipelineId) {
        query.pipelineId = filter.pipelineId;
      }

      return models?.Deals.find(query);
    },

    filterTypes: [
      {
        fieldName: 'userIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users'
      },
      {
        fieldName: 'userId',
        fieldType: 'select',
        fieldQuery: 'user',
        fieldLabel: 'Select assigned user'
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        fieldQuery: 'pipelines',
        fieldLabel: 'Select pipeline'
      },
      {
        fieldName: 'createdAt',
        fieldType: 'date',
        fieldQuery: 'createdAt'
      },
      {
        fieldName: 'dealName',
        fieldType: 'string',
        fieldQuery: 'name'
      }
    ]
  }
];

const getChartResult = async ({ subdomain, data }) => {
  const { templateType, filter, currentUser } = data;

  const template =
    templates.find(t => t.templateType === templateType) || ({} as any);

  return template.getChartResult(filter, currentUser);
};

export default {
  templates,
  getChartResult
};
