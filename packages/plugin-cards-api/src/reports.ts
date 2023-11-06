import { IUserDocument } from '@erxes/api-utils/src/types';
import { models } from './connectionResolver';
import { sendCoreMessage } from './messageBroker';

const reportTemplates = [
  {
    title: 'Deals chart',
    serviceName: 'cards',
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    charts: ['dealsChart', '123'],
    img: 'https://office.erxes.io/images/usingGuide.png'
  }
];

const chartTemplates = [
  {
    templateType: 'dealsChart',
    name: 'Deals chart',
    getChartResult: async (
      filter: any,
      subdomain: string,
      currentUser?: IUserDocument
    ) => {
      const DEFAULT_FILTER = {
        assignedUserIds: [`WQ3tsgnDdDu3jhbQj`],
        userId: `WQ3tsgnDdDu3jhbQj`,
        pipelineId: '1231'
      };

      const query = {
        assignedUserIds: { $in: DEFAULT_FILTER.assignedUserIds }
        // pipelineId: DEFAULT_FILTER.pipelineId
      } as any;

      if (filter && filter.assignedUserIds) {
        query.assignedUserIds.$in = filter.assignedUserIds;
      }

      if (filter && filter.pipelineId) {
        query.pipelineId = filter.pipelineId;
      }

      const getTotalAssignedUsers = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: { _id: { $in: query.assignedUserIds.$in } }
        },
        isRPC: true,
        defaultValue: []
      });

      console.log('assigned users ', getTotalAssignedUsers);

      const assignedUsersMap = {};

      const deals = await models?.Deals.find(query);

      for (const assignedUser of getTotalAssignedUsers) {
        assignedUsersMap[assignedUser._id] = {
          fullName: assignedUser.details?.fullName,
          assignedDealsCount: deals?.filter(deal =>
            deal.assignedUserIds?.includes(assignedUser._id)
          ).length
        };
      }

      const data = Object.values(assignedUsersMap).map(
        (t: any) => t.assignedDealsCount
      );
      const labels = Object.values(assignedUsersMap).map(
        (t: any) => t.fullName
      );

      const datasets = [{ data, labels }];
      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'assignedUserIds',
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
        fieldName: 'dateRange',
        fieldType: 'date',
        fieldQuery: 'createdAt',
        fieldLabel: 'Select date range'
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
    chartTemplates.find(t => t.templateType === templateType) || ({} as any);

  return template.getChartResult(filter, subdomain, currentUser);
};

export default {
  chartTemplates,
  reportTemplates,
  getChartResult
};
