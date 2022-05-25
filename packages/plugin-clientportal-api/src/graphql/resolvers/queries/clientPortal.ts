// TODO: check if related stages are selected in client portal config

import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { sendCardsMessage, sendKbMessage } from '../../../messageBroker';

const getByHost = async (models, requestInfo) => {
  const hostname = requestInfo.headers.hostname;
  const pattern = `.*${hostname}.*`;

  const config = await models.ClientPortals.findOne({
    url: { $regex: pattern }
  });

  if (!config) {
    throw new Error('Not found');
  }

  return config;
};

const configClientPortalQueries = {
  async clientPortalGetConfigs(
    _root,
    args: { page?: number; perPage?: number },
    { models }: IContext
  ) {
    return paginate(models.ClientPortals.find({}), args);
  },

  async clientPortalConfigsTotalCount(_root, _args, { models }: IContext) {
    return models.ClientPortals.countDocuments();
  },

  /**
   * Get last config
   */
  clientPortalGetLast(_root, _args, { models }: IContext) {
    return models.ClientPortals.findOne({}).sort({
      createdAt: -1
    });
  },

  async clientPortalGetConfig(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.ClientPortals.findOne({ _id });
  },

  async clientPortalGetConfigByDomain(
    _root,
    _args,
    { models, requestInfo }: IContext
  ) {
    return getByHost(models, requestInfo);
  },

  async clientPortalGetTaskStages(
    _root,
    _args,
    { models, subdomain, requestInfo }: IContext
  ) {
    const config = await getByHost(models, requestInfo);

    return sendCardsMessage({
      subdomain,
      action: 'stages.find',
      data: {
        pipelineId: config.taskPublicPipelineId
      },
      isRPC: true
    });
  },

  async clientPortalGetTasks(
    _root,
    { stageId },
    { models, subdomain, requestInfo }: IContext
  ) {
    const config = await getByHost(models, requestInfo);

    const stage = await sendCardsMessage({
      subdomain,
      action: 'stages.findOne',
      data: {
        _id: stageId
      },
      isRPC: true
    });

    if (config.taskPublicPipelineId !== stage.pipelineId) {
      throw new Error('Invalid request');
    }

    return sendCardsMessage({
      subdomain,
      action: 'tasks.find',
      data: {
        stageId
      },
      isRPC: true
    });
  },

  async clientPortalKnowledgeBaseTopicDetail(
    _root,
    { _id },
    { subdomain }: IContext
  ) {
    return sendKbMessage({
      subdomain,
      action: 'topics.findOne',
      data: {
        _id
      },
      isRPC: true
    });
  }
};

export default configClientPortalQueries;
