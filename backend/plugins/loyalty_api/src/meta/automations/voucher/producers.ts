import { VoucherOwnerLimitError } from '@/voucher/services/ownerLimit';
import {
  AUTOMATION_ERROR_CODES,
  buildFailedAction,
  buildSkippedAction,
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

    const issued = await Promise.all(
      ownerIds.map(async (ownerId) => {
        try {
          const voucher = await models.Vouchers.createVoucher({
            campaignId: config.voucherCampaignId || '',
            ownerType,
            ownerId,
            config: getVoucherConfigByRule(config.customRule),
          });

          return { ownerId, voucher };
        } catch (error) {
          // At the campaign's limit is a decision, not a failure.
          if (error instanceof VoucherOwnerLimitError) {
            return { ownerId, refused: error.message };
          }

          throw error;
        }
      }),
    );

    const result = issued.flatMap(({ voucher }) => (voucher ? [voucher] : []));
    const refused = issued.filter(({ refused }) => refused);

    if (!result.length && refused.length) {
      return buildSkippedAction(refused[0].refused as string, { result });
    }

    return {
      result,
      ...(refused.length && {
        refusedOwnerIds: refused.map(({ ownerId }) => ownerId),
      }),
    };
  },
};
