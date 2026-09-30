import {
  AUTOMATION_ERROR_CODES,
  buildFailedAction,
  TCoreModuleProducerContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { IssueVoucherActionConfig } from '../types';
import { getVoucherConfigByRule, resolveAutomationOwners } from '../utils';

export const voucherAutomationProducers = {
  receiveActions: async (
    { action, actionType, collectionType, execution },
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    if (collectionType !== 'voucher' || actionType !== 'create') {
      return buildFailedAction(
        `Loyalty voucher automations do not handle "${collectionType}.${actionType}"`,
        AUTOMATION_ERROR_CODES.CONFIG_INVALID,
      );
    }

    const config = action.config as IssueVoucherActionConfig;

    if (!config.voucherCampaignId) {
      throw new Error('Voucher campaign is required');
    }

    const { ownerIds, ownerType } = await resolveAutomationOwners({
      subdomain,
      execution,
      config,
      errorMessage: 'Voucher owner is required',
    });

    const result = await Promise.all(
      ownerIds.map((ownerId) =>
        models.Vouchers.createVoucher({
          campaignId: config.voucherCampaignId || '',
          ownerType,
          ownerId,
          config: getVoucherConfigByRule(config.customRule),
        }),
      ),
    );

    return { result };
  },
};
