import {
  AUTOMATION_ERROR_CODES,
  buildFailedAction,
  buildSkippedAction,
  replaceOutputPlaceholders,
  TCoreModuleProducerContext,
} from 'erxes-api-shared/core-modules';
import { TScoreSkip } from '@/score/@types/earnTable';
import {
  ILoyaltyPurchase,
  ILoyaltyPurchaseItem,
} from '@/score/@types/purchase';
import { IModels } from '~/connectionResolvers';
import { setAccountTier } from '@/score/services/accountTier';
import {
  ACCOUNT_OWNER_TYPES,
  resolveBalanceOwner,
} from '@/score/services/scoreLedger';
import {
  AdjustScoreActionConfig,
  LoyaltyAutomationAction,
  LoyaltyAutomationExecution,
  SetTierActionConfig,
} from '../types';
import { generateIds, getOwnerTypeFromAttribution } from '../utils';

const resolveOwnerIds = async ({
  subdomain,
  execution,
  attribution,
}: {
  subdomain: string;
  execution: LoyaltyAutomationExecution;
  attribution: string;
}) => {
  const replaced = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: { ownerIds: attribution },
    defaultValue: '',
    keepUnresolvedPlaceholders: false,
  });

  return generateIds(replaced.ownerIds);
};

// What the trigger's plugin says this purchase was. A trigger that is not a
// purchase (a customer, a birthday) gives nothing, and only fixed-point rows
// earn on it.
const toPurchase = (inputs?: Record<string, unknown>): ILoyaltyPurchase => {
  const items = inputs?.items;

  return {
    totalAmount: Number(inputs?.totalAmount) || 0,
    paidAmount: Number(inputs?.paidAmount) || 0,
    items: Array.isArray(items)
      ? items.filter(
          (item): item is ILoyaltyPurchaseItem =>
            !!item && typeof item.productId === 'string',
        )
      : undefined,
  };
};

const earnScore = async ({
  models,
  subdomain,
  action,
  execution,
  inputs,
}: {
  models: IModels;
  subdomain: string;
  action: LoyaltyAutomationAction;
  execution: LoyaltyAutomationExecution;
  inputs?: Record<string, unknown>;
}) => {
  const config = action.config as AdjustScoreActionConfig;

  if (!config.campaignId) {
    throw new Error('Score campaign is required');
  }

  if (config.action === 'subtract') {
    return buildFailedAction(
      'Points paid with are recorded by the selling side, not by an automation',
      AUTOMATION_ERROR_CODES.CONFIG_INVALID,
    );
  }

  if (!config.attribution) {
    throw new Error('Score owner attribution is required');
  }

  const purchase = toPurchase(inputs);

  const ownerIds = await resolveOwnerIds({
    subdomain,
    execution,
    attribution: config.attribution,
  });

  if (!ownerIds.length) {
    throw new Error('Score owner is required');
  }

  const ownerType =
    config.ownerType || getOwnerTypeFromAttribution(config.attribution);
  const [serviceName] = execution.triggerType.split(':');

  const skipped: { ownerId: string; skips: TScoreSkip[] }[] = [];

  const result = await Promise.all(
    ownerIds.map((ownerId) =>
      models.ScoreCampaigns.earn(
        {
          ownerType,
          ownerId,
          campaignId: config.campaignId || '',
          purchase,
          earnRowKeys: config.earnRowKeys,
          serviceName,
          targetId: execution.targetId,
          // The record type without the trigger's event suffix.
          targetType: execution.triggerType.split('.').slice(0, 2).join('.'),
          actorId: execution.createdVia?.actorId,
          createdVia: execution.createdVia,
        },
        (skips) => skipped.push({ ownerId, skips }),
      ),
    ),
  );

  // Nobody's balance moved: say why instead of passing a row of nulls.
  if (skipped.length && result.every((log) => !log)) {
    return buildSkippedAction(skipped[0].skips[0]?.reason || 'unspecified', {
      owners: skipped,
    });
  }

  return { result };
};

// Tiers are decided elsewhere (segments, webhooks, thresholds); this action
// only writes the decision onto each owner's account.
const setTier = async ({
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
  const config = action.config as SetTierActionConfig;

  if (!config.accountTypeId) {
    throw new Error('Wallet is required');
  }

  if (!config.attribution) {
    throw new Error('Tier owner attribution is required');
  }

  const accountType = await models.LoyaltyAccountTypes.getActiveAccountType(
    config.accountTypeId,
  );
  const ownerType = getOwnerTypeFromAttribution(config.attribution);

  if (
    ACCOUNT_OWNER_TYPES[accountType.ownerType] !==
    ACCOUNT_OWNER_TYPES[ownerType]
  ) {
    throw new Error(
      `${accountType.name} belongs to ${accountType.ownerType} owners, not ${ownerType}`,
    );
  }

  const ownerIds = await resolveOwnerIds({
    subdomain,
    execution,
    attribution: config.attribution,
  });

  if (!ownerIds.length) {
    throw new Error('Tier owner is required');
  }

  return Promise.all(
    ownerIds.map(async (ownerId) => {
      const { accountOwnerType, recordId } = await resolveBalanceOwner(
        subdomain,
        ownerType,
        ownerId,
      );
      const account = await models.LoyaltyAccounts.ensureOwnerAccount({
        ownerType: accountOwnerType,
        ownerId: recordId,
      });
      const { from, to, changed } = await setAccountTier({
        models,
        subdomain,
        accountId: account._id,
        accountTypeId: accountType._id,
        tier: config.tier || null,
      });

      return { ownerId, from, to, changed };
    }),
  );
};

export const scoreAutomationProducers = {
  receiveActions: async (
    { action, actionType, collectionType, execution, inputs },
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    if (
      actionType !== 'create' ||
      !['score', 'tier'].includes(collectionType)
    ) {
      return buildFailedAction(
        `Loyalty score automations do not handle "${collectionType}.${actionType}"`,
        AUTOMATION_ERROR_CODES.CONFIG_INVALID,
      );
    }

    if (collectionType === 'tier') {
      return {
        result: await setTier({ models, subdomain, action, execution }),
      };
    }

    return earnScore({ models, subdomain, action, execution, inputs });
  },
};
