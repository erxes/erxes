import { IContext } from '../../connectionResolver';

const DashboardFilterTypes = {
  User: ['modifiedBy', 'firstRespondedUser', 'assignedUser']
};

const DashboardFilters = {
  'Customer.status': [
    { label: 'Active', value: 'Active' },
    { label: 'Deleted', value: 'Deleted' }
  ],
  'Visitors.status': [
    { label: 'Active', value: 'Active' },
    { label: 'Deleted', value: 'Deleted' }
  ],
  'Leads.status': [
    { label: 'Active', value: 'Active' },
    { label: 'Deleted', value: 'Deleted' }
  ],
  'Deals.stageProbability': [
    { label: 'Won', value: 'Won' },
    { label: 'Lost', value: 'Lost' },
    { label: '10%', value: '10%' },
    { label: '20%', value: '20%' },
    { label: '30%', value: '30%' },
    { label: '40%', value: '40%' },
    { label: '50%', value: '50%' },
    { label: '60%', value: '60%' },
    { label: '70%', value: '70%' },
    { label: '80%', value: '80%' },
    { label: '90%', value: '90%' }
  ],
  'Deals.status': [
    { label: 'Active', value: 'active' },
    { label: 'Archived', value: 'archived' }
  ],
  'Deals.priority': [
    { label: 'Critical', value: 'Critical' },
    { label: 'High', value: 'High' },
    { label: 'Normal', value: 'Normal' },
    { label: 'Low', value: 'Low' }
  ],

  'Tasks.status': [
    { label: 'Active', value: 'active' },
    { label: 'Archived', value: 'archived' }
  ],
  'Tasks.priority': [
    { label: 'Critical', value: 'Critical' },
    { label: 'High', value: 'High' },
    { label: 'Normal', value: 'Normal' },
    { label: 'Low', value: 'Low' }
  ],

  'Tickets.stageProbability': [
    { label: 'Won', value: 'Won' },
    { label: 'Lost', value: 'Lost' },
    { label: '10%', value: '10%' },
    { label: '20%', value: '20%' },
    { label: '30%', value: '30%' },
    { label: '40%', value: '40%' },
    { label: '50%', value: '50%' },
    { label: '60%', value: '60%' },
    { label: '70%', value: '70%' },
    { label: '80%', value: '80%' },
    { label: '90%', value: '90%' }
  ],
  'Tickets.status': [
    { label: 'Active', value: 'active' },
    { label: 'Archived', value: 'archived' }
  ],
  'Tickets.priority': [
    { label: 'Critical', value: 'Critical' },
    { label: 'High', value: 'High' },
    { label: 'Normal', value: 'Normal' },
    { label: 'Low', value: 'Low' }
  ],

  'Conversations.status': [
    { label: 'New', value: 'new' },
    { label: 'Open', value: 'open' },
    { label: 'Closed', value: 'closed' }
  ]
};

const dashBoardQueries = {
  dashboards(_root, _args, { models }: IContext) {
    return models.Dashboards.find({}).sort({ order: 1 });
  },

  dashboardDetails(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Dashboards.findOne({ _id });
  },

  dashboardsTotalCount(_root, args, { models }: IContext) {
    return models.Dashboards.find({}).countDocuments();
  },

  async dashboardItems(
    _root,
    { dashboardId }: { dashboardId: string },
    { models }: IContext
  ) {
    return models.DashboardItems.find({ dashboardId });
  },

  dashboardItemDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.DashboardItems.findOne({ _id });
  },

  async dashboardInitialDatas(
    _root,
    { type }: { type: string },
    { dataSources, models }: IContext
  ) {
    return dataSources.HelpersApi.fetchApi('/get-dashboards', { type });
  },

  async dashboardFilters(
    _root,
    { type }: { type: string },
    { models }: IContext
  ) {
    const filters = DashboardFilters[type];

    const shemaType = type.split('.')[0];
    let tagType = 'customer';
    let stageType = 'deal';

    switch (shemaType) {
      case 'Conversations':
        tagType = 'conversation';
        break;

      case 'ConversationProperties':
        tagType = 'conversation';
        break;

      case 'Companies':
        tagType = 'company';
        break;

      case 'Tasks':
        stageType = 'task';
        break;

      case 'Tickets':
        stageType = 'ticket';
        break;
    }

    if (!filters) {
      if (type.includes('pipeline')) {
        return [];
      }

      if (DashboardFilterTypes.User.some(name => type.includes(name))) {
        return [];
      }

      if (type.includes('brand')) {
        return [];
      }

      if (type.includes('integrationName')) {
        return [];
      }

      if (type.includes('integrationType')) {
        return [];
      }

      if (type.includes('board')) {
        return [];
      }

      if (type.includes('tag')) {
        return [];
      }

      if (type.includes('label')) {
        return [];
      }
    }

    return filters;
  }
};

export default dashBoardQueries;
