import { TCoreModuleProducerContext } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { AwardSpinActionConfig } from '../types';
import { resolveAutomationOwners } from '../utils';

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

    const { ownerIds, ownerType } = await resolveAutomationOwners({
      subdomain,
      execution,
      config,
      errorMessage: 'Spin owner is required',
    });

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
