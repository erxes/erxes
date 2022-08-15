import { IContext } from '../../connectionResolver';
import {
  sendCardsMessage,
  sendCoreMessage,
  sendInboxMessage,
  sendTagsMessage
} from '../../messageBroker';

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

const KIND_CHOICES = {
  MESSENGER: 'messenger',
  LEAD: 'lead',
  FACEBOOK_MESSENGER: 'facebook-messenger',
  FACEBOOK_POST: 'facebook-post',
  GMAIL: 'gmail',
  NYLAS_GMAIL: 'nylas-gmail',
  NYLAS_IMAP: 'nylas-imap',
  NYLAS_OFFICE365: 'nylas-office365',
  NYLAS_EXCHANGE: 'nylas-exchange',
  NYLAS_OUTLOOK: 'nylas-outlook',
  NYLAS_YAHOO: 'nylas-yahoo',
  CALLPRO: 'callpro',
  TWITTER_DM: 'twitter-dm',
  CHATFUEL: 'chatfuel',
  SMOOCH_VIBER: 'smooch-viber',
  SMOOCH_LINE: 'smooch-line',
  SMOOCH_TELEGRAM: 'smooch-telegram',
  SMOOCH_TWILIO: 'smooch-twilio',
  WHATSAPP: 'whatsapp',
  TELNYX: 'telnyx',
  WEBHOOK: 'webhook',
  ALL: [
    'messenger',
    'lead',
    'facebook-messenger',
    'facebook-post',
    'gmail',
    'callpro',
    'chatfuel',
    'nylas-gmail',
    'nylas-imap',
    'nylas-office365',
    'nylas-outlook',
    'nylas-exchange',
    'nylas-yahoo',
    'twitter-dm',
    'smooch-viber',
    'smooch-line',
    'smooch-telegram',
    'smooch-twilio',
    'whatsapp',
    'telnyx',
    'webhook'
  ]
};

export const getUsers = async subdomain => {
  const filters = [] as any;

  const users = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {
      query: {
        username: { $exists: true },
        isActive: true
      }
    },
    isRPC: true,
    defaultValue: []
  });

  for (const user of users) {
    filters.push({ label: user.details.fullName, value: user._id });
  }

  return filters;
};

export const getBrands = async subdomain => {
  const filters = [] as any;

  const brands = await sendCoreMessage({
    subdomain,
    action: 'brands.find',
    data: {
      query: {}
    },
    isRPC: true,
    defaultValue: []
  });

  for (const brand of brands) {
    filters.push({ label: brand.name, value: brand._id });
  }

  return filters;
};

export const getIntegrations = async subdomain => {
  const filters = [] as any;

  const integrations = await sendInboxMessage({
    subdomain,
    action: 'integrations.find',
    data: {},
    isRPC: true
  });

  for (const integration of integrations) {
    filters.push({ label: integration.name, value: integration._id });
  }

  return filters;
};

export const getIntegrationTypes = async subdomain => {
  const filters = [] as any;

  for (const kind of KIND_CHOICES.ALL) {
    const integrations = await sendInboxMessage({
      subdomain,
      action: 'integrations.find',
      data: { kind },
      isRPC: true
    });

    const integrationIds = integrations.map(integration => integration._id);

    if (integrationIds.length > 0) {
      filters.push({ label: kind, value: integrationIds });
    }
  }

  return filters;
};

export const getTags = async (subdomain, type) => {
  const filters = [] as any;

  const tags = await sendTagsMessage({
    subdomain,
    action: 'tags:find',
    data: { type },
    isRPC: true
  });

  for (const tag of tags) {
    filters.push({ label: tag.name, value: tag._id });
  }

  return filters;
};

export const getPipelines = async (stageType: string, subdomain) => {
  const filters = [] as any;

  const stages = await sendCardsMessage({
    subdomain,
    action: 'stages.find',
    data: { type: stageType },
    isRPC: true
  });

  const pipelineIds = stages.map(stage => stage.pipelineId);

  const pipelines = await sendCardsMessage({
    subdomain,
    action: 'pipelines.find',
    data: { _id: { $in: pipelineIds } },
    isRPC: true
  });

  for (const pipeline of pipelines) {
    const pipeLineStages = await sendCardsMessage({
      subdomain,
      action: 'stages.find',
      data: { pipelineId: pipeline._id },
      isRPC: true
    });

    const stageIds = pipeLineStages.map(pipeLineStage => pipeLineStage._id);

    filters.push({ label: pipeline.name, value: stageIds });
  }

  return filters;
};

export const getBoards = async (subdomain: string, stageType: string) => {
  const filters = [] as any;

  const stages = await sendCardsMessage({
    subdomain,
    action: 'stages.find',
    data: { type: stageType },
    isRPC: true
  });

  const pipelineIds = stages.map(stage => stage.pipelineId);

  const pipelines = await sendCardsMessage({
    subdomain,
    action: 'pipelines.find',
    data: { _id: { $in: pipelineIds } },
    isRPC: true
  });

  const boardIds = pipelines.map(pipeline => pipeline.boardId);

  const boards = await sendCardsMessage({
    subdomain,
    action: 'boards.find',
    data: { _id: { $in: boardIds } },
    isRPC: true
  });

  for (const board of boards) {
    const stageIds = [] as any;

    board.stages.map(stage => {
      stageIds.push(stage._id);
    });

    const boardPipelines = await sendCardsMessage({
      subdomain,
      action: 'pipelines.find',
      data: { boardId: board._id },
      isRPC: true
    });

    const boardPipelineIds = boardPipelines.map(
      boardPipeline => boardPipeline._id
    );

    const boardStages = await sendCardsMessage({
      subdomain,
      action: 'stages.find',
      data: { pipelineId: { $in: boardPipelineIds } },
      isRPC: true
    });

    boardStages.map(stage => {
      stageIds.push(stage._id);
    });

    filters.push({ label: board.name, value: stageIds });
  }

  return filters;
};

const dashBoardQueries = {
  dashboards(_root, _arg, { models, user }: IContext) {
    const dashboardFilter = user.isOwner
      ? {}
      : {
          $or: [
            { visibility: { $exists: null } },
            { visibility: 'public' },
            {
              $and: [
                { visibility: 'private' },
                {
                  $or: [{ selectedMemberIds: user._id }]
                }
              ]
            }
          ]
        };

    return models.Dashboards.find(dashboardFilter).sort({ order: 1 });
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
    { subdomain, models }: IContext
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
        return getPipelines(stageType, subdomain);
      }

      if (DashboardFilterTypes.User.some(name => type.includes(name))) {
        return getUsers(subdomain);
      }

      if (type.includes('brand')) {
        return getBrands(subdomain);
      }

      if (type.includes('integrationName')) {
        return getIntegrations(subdomain);
      }

      if (type.includes('integrationType')) {
        return getIntegrationTypes(subdomain);
      }

      if (type.includes('board')) {
        return getBoards(subdomain, stageType);
      }

      if (type.includes('tag')) {
        return getTags(subdomain, type);
      }
    }

    return filters;
  }
};

export default dashBoardQueries;
