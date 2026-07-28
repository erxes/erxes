import {
  replaceOutputPlaceholders,
  TCoreModuleProducerContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import {
  AdjustScoreActionConfig,
  LoyaltyAutomationAction,
  LoyaltyAutomationExecution,
} from '../types';
import { generateIds, getOwnerTypeFromAttribution } from '../utils';

const doScoreCampaign = async ({
  models,
  subdomain,
  action,
  execution,
}: {
  models: IModels;
  subdomain: string;
  action: LoyaltyAutomationAction;
  execution: LoyaltyAutomationExecution;
}) => {
  const config = action.config as AdjustScoreActionConfig;

  if (!config.campaignId || !config.action) {
    throw new Error('Score campaign and action are required');
  }

  if (!config.attribution) {
    throw new Error('Score owner attribution is required');
  }

  const replaced = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: { ownerIds: config.attribution },
    defaultValue: '',
    keepUnresolvedPlaceholders: false,
  });

  const ownerIds = generateIds(replaced.ownerIds);

  if (!ownerIds.length) {
    throw new Error('Score owner is required');
  }

  const ownerType =
    config.ownerType || getOwnerTypeFromAttribution(config.attribution);
  const [serviceName] = execution.triggerType.split(':');

  return Promise.all(
    ownerIds.map((ownerId) =>
      models.ScoreCampaigns.doCampaign({
        serviceName,
        targetId: execution.targetId,
        campaignId: config.campaignId || '',
        actionMethod: config.action || 'add',
        ownerId,
        ownerType,
        target: execution.target,
      }),
    ),
  );
};

export const scoreAutomationProducers = {
  receiveActions: async (
    { action, actionType, collectionType, execution },
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    if (collectionType !== 'score' || actionType !== 'create') {
      return { result: null };
    }

    const result = await doScoreCampaign({
      models,
      subdomain,
      action,
      execution,
    });

    return { result };
  },
};
