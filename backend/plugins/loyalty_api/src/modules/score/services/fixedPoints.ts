import { TCreatedVia } from 'erxes-api-shared/core-types';
import { TScoreSkip } from '@/score/@types/earnTable';
import { IScoreLogDocument } from '@/score/@types/scoreLog';
import { mayEarn } from '@/score/services/earnEligibility';
import { applyScoreChange, ScoreTarget } from '@/score/services/scoreLedger';
import { IModels } from '~/connectionResolvers';

export type TFixedPointsInput = ScoreTarget & {
  accountTypeId: string;
  ownerType: string;
  ownerId: string;
  points: number;
  actorId?: string;
  // `runId` makes a retried run give nothing more.
  createdVia?: TCreatedVia;
};

/**
 * Gives a set number of points into a wallet because something happened. No
 * campaign is read, so no earning table, tier column or cap applies; the
 * wallet's own rules (who may earn, frozen accounts, pending, expiry) still do.
 */
export const giveFixedPoints = async (
  models: IModels,
  subdomain: string,
  input: TFixedPointsInput,
): Promise<{ log: IScoreLogDocument } | { skip: TScoreSkip }> => {
  const { accountTypeId, ownerType, ownerId, points, createdVia } = input;

  if (!(points > 0)) {
    throw new Error('Points to give must be more than zero');
  }

  const accountType = await models.LoyaltyAccountTypes.getActiveAccountType(
    accountTypeId,
  );

  if (accountType.ownerType !== ownerType) {
    throw new Error(
      `Wallet "${accountType.name}" holds ${accountType.ownerType} balances, not ${ownerType}`,
    );
  }

  if (!accountType.fieldId) {
    throw new Error(`Wallet "${accountType.name}" has no balance field`);
  }

  const eligibility = accountType.earnEligibility;

  if (
    eligibility &&
    eligibility.who !== 'all' &&
    !(await mayEarn({ subdomain, eligibility, ownerType, ownerId }))
  ) {
    return { skip: { reason: 'not-eligible', who: eligibility.who } };
  }

  if (createdVia?.runId) {
    const given = await models.ScoreLogs.findOne({
      ownerId,
      ownerType,
      'createdVia.runId': createdVia.runId,
    });

    if (given) {
      return { log: given };
    }
  }

  const { log } = await applyScoreChange({
    models,
    subdomain,
    doc: {
      ownerType,
      ownerId,
      fieldId: accountType.fieldId,
      action: 'add',
      changeScore: points,
      targetId: input.targetId,
      targetType: input.targetType,
      serviceName: input.serviceName,
      createdBy: input.actorId,
      createdVia,
    },
  });

  return { log };
};
