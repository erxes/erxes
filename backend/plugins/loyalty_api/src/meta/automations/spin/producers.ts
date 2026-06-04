import {
  TAutomationProducers,
  TAutomationProducersInput,
  TCoreModuleProducerContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { AwardSpinActionConfig } from '../types';
import {
  generateIds,
  getOwnerTypeFromAttribution,
  replaceAutomationPlaceholders,
} from '../utils';

export const spinAutomationProducers = {
  receiveActions: async (
    { action, actionType, collectionType, execution },
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    if (collectionType !== 'spin' || actionType !== 'create') {
      return { result: null };
    }

    const config = action.config as AwardSpinActionConfig;

    if (!config.spinCampaignId) {
      throw new Error('Spin campaign is required');
    }

    if (!config.attribution) {
      throw new Error('Spin owner attribution is required');
    }

    const replaced = await replaceAutomationPlaceholders({
      subdomain,
      execution,
      values: { ownerIds: config.attribution },
    });
    const ownerIds = generateIds(replaced.ownerIds);
    const ownerType =
      config.ownerType || getOwnerTypeFromAttribution(config.attribution);

    const result = await Promise.all(
      ownerIds.map((ownerId) =>
        models.Spins.createSpin({
          campaignId: config.spinCampaignId || '',
          ownerType,
          ownerId,
        }),
      ),
    );

    return { result };
  },
};
