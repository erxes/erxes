import {
  AUTOMATION_ERROR_CODES,
  buildFailedAction,
  buildSkippedAction,
  replaceOutputPlaceholders,
  TAutomationProducers,
  TAutomationProducersInput,
  TCoreModuleProducerContext,
} from 'erxes-api-shared/core-modules';
import { TScoreSkip } from '@/score/@types/earnTable';
import {
  ILoyaltyPurchase,
  ILoyaltyPurchaseItem,
} from '@/score/@types/purchase';
import { IModels } from '~/connectionResolvers';
import { setAccountTier } from '@/score/services/accountTier';
import { tierForAmount } from '@/score/services/tierBands';
import {
  matchesTierChanged,
  tierDirection,
} from '@/score/services/tierChanged';
import {
  ACCOUNT_OWNER_TYPES,
  resolveBalanceOwner,
} from '@/score/services/scoreLedger';
import {
  AdjustScoreActionConfig,
  LoyaltyAutomationAction,
  LoyaltyAutomationExecution,
  SetTierActionConfig,
  TierChangedTarget,
  TierChangedTriggerConfig,
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

// Tiers are decided elsewhere (segments, webhooks, thresholds) or by the
// purchase's amount against the action's bands; this only writes the result.
const setTier = async ({
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
  const byAmount = !!config.bands?.length;
  const tierOrder = (key: string) =>
    accountType.tiers.find((tier) => tier.key === key)?.order ?? -1;
  // Where two ranges meet, the higher tier wins, however they were entered.
  const outcome = byAmount
    ? tierForAmount(
        {
          ...config,
          bands: [...(config.bands || [])].sort(
            (a, b) => tierOrder(b.tier) - tierOrder(a.tier),
          ),
        },
        inputs?.totalAmount,
      )
    : { tier: config.tier || '' };

  if ('skip' in outcome) {
    return buildSkippedAction(outcome.skip, outcome);
  }

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
      const current = account.balances?.get(accountType._id)?.tier || null;

      // A smaller purchase later must not undo a tier an earlier one earned.
      if (
        byAmount &&
        config.onlyUpgrade &&
        tierDirection(accountType.tiers, current, outcome.tier) === 'down'
      ) {
        return { ownerId, from: current, to: current, changed: false };
      }

      const { from, to, changed } = await setAccountTier({
        models,
        subdomain,
        accountId: account._id,
        accountTypeId: accountType._id,
        tier: outcome.tier || null,
      });

      return { ownerId, from, to, changed };
    }),
  ).then((result) => ({ result }));
};

export const scoreAutomationProducers = {
  checkCustomTrigger: async ({
    collectionType,
    config,
    target,
  }: TAutomationProducersInput[TAutomationProducers.CHECK_CUSTOM_TRIGGER]) =>
    collectionType === 'tier' &&
    matchesTierChanged(
      config as TierChangedTriggerConfig,
      target as Partial<TierChangedTarget>,
    ),

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
      return setTier({ models, subdomain, action, execution, inputs });
    }

    return earnScore({ models, subdomain, action, execution, inputs });
  },
};
