import {
  TAutomationProducers,
  TAutomationProducersInput,
  TCoreModuleProducerContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { IssueVoucherActionConfig } from '../types';
import {
  getBirthDate,
  getVoucherConfigByRule,
  isBirthdayThisMonth,
  resolveAutomationOwners,
} from '../utils';

export const voucherAutomationProducers = {
  checkCustomTrigger: async ({
    collectionType,
    config,
    target,
  }: TAutomationProducersInput[TAutomationProducers.CHECK_CUSTOM_TRIGGER]) => {
    if (collectionType !== 'reward' || config.rewardType !== 'birthday') {
      return false;
    }

    if (!isBirthdayThisMonth(getBirthDate(target))) {
      return false;
    }

    const appliesTo = Array.isArray(config.appliesTo) ? config.appliesTo : [];

    if ('details' in target) {
      return appliesTo.includes('user');
    }

    return appliesTo.includes('customer');
  },

  receiveActions: async (
    { action, actionType, collectionType, execution },
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    if (collectionType !== 'voucher' || actionType !== 'create') {
      return { result: null };
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
