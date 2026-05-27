import {
  DoCampaignTypes,
  IScoreCampaign,
  IScoreCampaignDocument,
} from '@/score/@types/scoreCampaign';
import { SCORE_CAMPAIGN_STATUSES } from '@/score/constants';
import { scoreCampaignSchema } from '@/score/db/definitions/scoreCampaign';
import {
  handleOnCreateCampaignScoreField,
  handleOnUpdateCampaignScoreField,
  resolvePlaceholderValue,
  safeEvalMath,
} from '@/score/utils';
import {
  applyScoreChange,
  fixScoreNumber,
  getOwnerScoreUpdate,
  getOwnerScoreValue,
  getSignedChangeScore,
  prepareScoreLogChange,
  refundScoreChange,
  updateOwnerScoreCache,
} from '@/score/services/scoreLedger';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';

export interface IScoreCampaignModel extends Model<IScoreCampaignDocument> {
  getScoreCampaign(_id: string): Promise<IScoreCampaignDocument>;
  createScoreCampaign(
    doc: IScoreCampaign,
    user: IUserDocument,
  ): Promise<IScoreCampaignDocument>;
  updateScoreCampaign(
    _id: string,
    doc: IScoreCampaign,
    user: IUserDocument,
  ): Promise<IScoreCampaignDocument>;
  removeScoreCampaign(
    _id: string,
    user: IUserDocument,
  ): Promise<IScoreCampaignDocument>;
  removeScoreCampaigns(
    _ids: string[],
    user: IUserDocument,
  ): Promise<IScoreCampaignDocument>;
  doCampaign(data: DoCampaignTypes): Promise<any>;
  checkScoreAviableSubtract(data: {
    ownerType: string;
    ownerId: string;
    campaignId: string;
    target: any;
  }): Promise<boolean>;

  refundLoyaltyScore(
    targetId: string,
    ownerType: string,
    ownerId: string,
  ): Promise<boolean>;
  updateOwnerScore(args: {
    ownerId: string;
    ownerType: string;
    updatedCustomFieldsData?: Record<string, any>;
    updatedScore?: number;
  }): Promise<any>;
}

export const getOwnerFieldScore = (owner: any, fieldId?: string) => {
  return getOwnerScoreValue(owner, fieldId);
};

const calculateCampaignChangeScore = ({
  campaign,
  actionMethod,
  target,
}: {
  campaign: any;
  actionMethod: 'add' | 'subtract' | 'set';
  target: any;
}) => {
  const { currencyRatio = 1 } = campaign[actionMethod] || {};
  const placeholder = campaign[actionMethod]?.placeholder || '';

  if (!placeholder.trim() && actionMethod === 'subtract') {
    return Number(target?.paymentAmount) || 0;
  }

  const expression = placeholder.replace(
    /\{\{\s*([^}]+)\s*\}\}/g,
    (_match, attribute) =>
      String(resolvePlaceholderValue(target, String(attribute).trim())),
  );

  return fixScoreNumber(
    (safeEvalMath(expression) || 0) * Number(currencyRatio || 1) || 0,
  );
};

const getCampaignStageStatus = (campaign: any, stageId?: string) => {
  if (!stageId) {
    return undefined;
  }

  const rules = campaign?.additionalConfig?.cardBasedRule || [];
  const stageIds = rules.flatMap((rule: any) => rule.stageIds || []);
  const refundStageIds = rules.flatMap(
    (rule: any) => rule.refundStageIds || [],
  );

  if (stageIds.includes(stageId)) {
    return 'stage';
  }

  if (refundStageIds.includes(stageId)) {
    return 'refund';
  }

  return undefined;
};

const hasCampaignStageRules = (campaign: any) =>
  (campaign?.additionalConfig?.cardBasedRule || []).some(
    (rule: any) =>
      (rule.stageIds || []).length || (rule.refundStageIds || []).length,
  );

const findActiveScoreLog = async ({
  models,
  targetId,
  ownerId,
  ownerType,
  campaignId,
  action,
}: {
  models: IModels;
  targetId?: string;
  ownerId: string;
  ownerType: string;
  campaignId: string;
  action: 'add' | 'subtract' | 'set';
}) => {
  if (!targetId) {
    return null;
  }

  const scoreLogs = await models.ScoreLogs.find({
    targetId,
    ownerId,
    ownerType,
    campaignId,
    action,
  }).sort({ createdAt: -1 });

  for (const scoreLog of scoreLogs) {
    const refundLog = await models.ScoreLogs.exists({
      targetId,
      ownerId,
      ownerType,
      campaignId,
      action: 'refund',
      sourceScoreLogId: scoreLog._id,
    });

    if (!refundLog) {
      return scoreLog;
    }
  }

  return null;
};

const cleanupRefundedScoreLogs = async ({
  models,
  targetId,
  ownerId,
  ownerType,
  campaignId,
  action,
}: {
  models: IModels;
  targetId?: string;
  ownerId: string;
  ownerType: string;
  campaignId: string;
  action: 'add' | 'subtract' | 'set';
}) => {
  if (!targetId) {
    return;
  }

  const scoreLogs = await models.ScoreLogs.find({
    targetId,
    ownerId,
    ownerType,
    campaignId,
    action,
  }).select('_id');

  if (!scoreLogs.length) {
    return;
  }

  const scoreLogIds = scoreLogs.map((scoreLog) => scoreLog._id);
  const refundLogs = await models.ScoreLogs.find({
    targetId,
    ownerId,
    ownerType,
    campaignId,
    action: 'refund',
    sourceScoreLogId: { $in: scoreLogIds },
  }).select('_id sourceScoreLogId');

  if (!refundLogs.length) {
    return;
  }

  const refundedSourceLogIds = refundLogs.map(
    (refundLog) => refundLog.sourceScoreLogId,
  );
  const refundLogIds = refundLogs.map((refundLog) => refundLog._id);

  await models.ScoreLogs.deleteMany({
    _id: { $in: [...refundedSourceLogIds, ...refundLogIds] },
  });
};

export const loadScoreCampaignClass = (
  models: IModels,
  subdomain: string,
  dispatcher: EventDispatcherReturn,
) => {
  const { sendDbEventLog } = dispatcher;

  class ScoreCampaign {
    public static async getScoreCampaign(_id: string) {
      const scoreCampaign = await models.ScoreCampaigns.findOne({ _id });

      if (!scoreCampaign) {
        throw new Error('Score campaign not found');
      }

      return scoreCampaign;
    }

    public static async createScoreCampaign(
      doc: IScoreCampaign,
      user: IUserDocument,
    ) {
      doc = await handleOnCreateCampaignScoreField({ doc, subdomain });

      const created = await models.ScoreCampaigns.create({
        ...doc,
        createdUserId: user?._id,
      });

      sendDbEventLog?.({
        action: 'create',
        docId: created._id,
        currentDocument: created.toObject(),
      });

      return created;
    }

    public static async updateScoreCampaign(
      _id: string,
      doc: IScoreCampaign,
      user: IUserDocument,
    ) {
      const prevDoc = await models.ScoreCampaigns.findOne({ _id }).lean();
      const scoreCampaign = await this.getScoreCampaign(_id);

      if (
        !!scoreCampaign?.fieldId &&
        !!scoreCampaign?.ownerType &&
        !!doc.ownerType &&
        scoreCampaign.ownerType !== doc.ownerType
      ) {
        throw new Error(
          'You cannot modify the ownership type of the score field.',
        );
      }

      doc = await handleOnUpdateCampaignScoreField({
        doc,
        subdomain,
        scoreCampaign,
      });

      const result = await models.ScoreCampaigns.updateOne(
        { _id },
        { $set: { ...doc } },
      );

      sendDbEventLog?.({
        action: 'update',
        docId: _id,
        currentDocument: doc,
        prevDocument: prevDoc,
      });

      return result;
    }

    public static async removeScoreCampaign(_id: string, user: IUserDocument) {
      const prevDoc = await models.ScoreCampaigns.findOne({ _id }).lean();
      await this.getScoreCampaign(_id);

      const result = await models.ScoreCampaigns.updateOne(
        { _id },
        { $set: { status: SCORE_CAMPAIGN_STATUSES.ARCHIVED } },
      );

      sendDbEventLog?.({
        action: 'update', // soft delete (status change)
        docId: _id,
        currentDocument: { status: SCORE_CAMPAIGN_STATUSES.ARCHIVED },
        prevDocument: prevDoc,
      });

      return result;
    }

    public static async removeScoreCampaigns(
      _ids: string[],
      user: IUserDocument,
    ) {
      const idsArray = Array.isArray(_ids) ? _ids : [_ids];
      const prevDocs = await models.ScoreCampaigns.find({
        _id: { $in: idsArray },
      }).lean();

      const result = await models.ScoreCampaigns.updateMany(
        { _id: { $in: idsArray } },
        { $set: { status: SCORE_CAMPAIGN_STATUSES.ARCHIVED } },
      );

      for (const prev of prevDocs) {
        sendDbEventLog?.({
          action: 'update',
          docId: prev._id,
          currentDocument: { status: SCORE_CAMPAIGN_STATUSES.ARCHIVED },
          prevDocument: prev,
        });
      }

      return result;
    }

    public static async checkScoreAviableSubtract(data) {
      const { ownerType, ownerId, campaignId, target, targetId } = data;

      if (!ownerType || !ownerId) {
        throw new Error('You must provide a owner');
      }

      const owner = await getLoyaltyOwner(subdomain, { ownerType, ownerId });

      if (!owner) {
        throw new Error('Owner not found');
      }

      const campaign = await models.ScoreCampaigns.findOne({
        _id: campaignId,
        status: SCORE_CAMPAIGN_STATUSES.PUBLISHED,
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.ownerType !== ownerType) {
        throw new Error(
          'Owner type is not the same as the owner type of the campaign',
        );
      }

      let changeScore = calculateCampaignChangeScore({
        campaign,
        actionMethod: 'subtract',
        target,
      });

      let oldScore = Number(owner?.score) || 0;

      if (campaign.fieldId) {
        oldScore = getOwnerFieldScore(owner, campaign.fieldId);
        const scoreLog = await models.ScoreLogs.findOne({
          ownerId,
          ownerType,
          targetId,
          action: 'subtract',
        });

        if (scoreLog) {
          changeScore = changeScore - scoreLog?.changeScore;
        }
      }

      const newScore = oldScore - changeScore;

      if (newScore < 0) {
        throw new Error('There has no enough score to subtract');
      }

      return true;
    }

    public static async doCampaign(data: DoCampaignTypes) {
      const {
        ownerType,
        ownerId,
        campaignId,
        target,
        oldTarget,
        actionMethod,
        serviceName,
        targetId,
      } = data;

      if (!ownerType || !ownerId) {
        throw new Error('You must provide a owner');
      }

      const owner = await getLoyaltyOwner(subdomain, { ownerType, ownerId });

      if (!owner) {
        throw new Error('Owner not found');
      }

      const campaign = await models.ScoreCampaigns.findOne({
        _id: campaignId,
        status: SCORE_CAMPAIGN_STATUSES.PUBLISHED,
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.ownerType !== ownerType) {
        throw new Error(
          'Owner type is not the same as the owner type of the campaign',
        );
      }

      const calculationTarget = {
        ...target,
        [ownerType]: owner,
      };
      const oldStageStatus = getCampaignStageStatus(
        campaign,
        oldTarget?.stageId,
      );
      const newStageStatus = getCampaignStageStatus(
        campaign,
        calculationTarget?.stageId,
      );

      if (newStageStatus === 'stage') {
        await cleanupRefundedScoreLogs({
          models,
          targetId,
          ownerId,
          ownerType,
          campaignId: campaign._id,
          action: actionMethod,
        });
      }

      const activeScoreLog = await findActiveScoreLog({
        models,
        targetId,
        ownerId,
        ownerType,
        campaignId: campaign._id,
        action: actionMethod,
      });
      const hasStageRules = hasCampaignStageRules(campaign);

      if (hasStageRules && newStageStatus !== 'stage') {
        if (!activeScoreLog) {
          return;
        }

        const { log } = await refundScoreChange({
          models,
          subdomain,
          doc: {
            targetId,
            ownerType,
            ownerId,
            sourceScoreLogId: activeScoreLog._id,
            netTargetAddsForSubtract: false,
            description:
              newStageStatus === 'refund'
                ? 'Refund score campaign'
                : `Clear score campaign from ${oldStageStatus || 'undefined'
                } stage`,
          },
        });

        return log;
      }

      if (campaign.onlyClientPortal && ownerType === 'customer') {
        const cpUser = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'cpUsers',
          action: 'get',
          input: { erxesCustomerId: owner._id },
          defaultValue: null,
        });

        if (!cpUser) {
          throw new Error(
            'This campaign is only available to client portal users.',
          );
        }
      }

      let changeScore = calculateCampaignChangeScore({
        campaign,
        actionMethod,
        target: calculationTarget,
      });

      if (!changeScore && actionMethod !== 'set') {
        if (activeScoreLog) {
          const { log } = await refundScoreChange({
            models,
            subdomain,
            doc: {
              targetId,
              ownerType,
              ownerId,
              sourceScoreLogId: activeScoreLog._id,
              netTargetAddsForSubtract: false,
              description: 'Clear zero score campaign',
            },
          });

          return log;
        }

        return;
      }

      let oldScore = Number(owner?.score) || 0;

      if (campaign.fieldId) {
        oldScore = getOwnerFieldScore(owner, campaign.fieldId);
      }

      if (actionMethod === 'set') {
        if (changeScore === oldScore) {
          return activeScoreLog || undefined;
        }

        changeScore = fixScoreNumber(changeScore - oldScore);
      }

      const scoreLog = activeScoreLog;

      if (!changeScore) {
        return scoreLog || undefined;
      }

      if (scoreLog) {
        const prevChangeScore = Math.abs(Number(scoreLog.changeScore) || 0);

        if (actionMethod !== 'set' && changeScore === prevChangeScore) {
          return scoreLog;
        }

        const currentSignedChangeScore = getSignedChangeScore(scoreLog);
        let nextSignedChangeScore = changeScore;
        if (actionMethod === 'set') nextSignedChangeScore = currentSignedChangeScore + changeScore;
        if (actionMethod === 'subtract') nextSignedChangeScore = -changeScore;

        const nextPreparedChange = prepareScoreLogChange({
          action: actionMethod,
          signedChangeScore: nextSignedChangeScore,
        });
        const scoreDifference =
          nextPreparedChange.signedChangeScore - currentSignedChangeScore;
        const recalculatedScore = fixScoreNumber(oldScore + scoreDifference);

        if (recalculatedScore < 0) {
          throw new Error('There has no enough score to subtract');
        }

        await updateOwnerScoreCache({
          subdomain,
          ownerId,
          ownerType,
          ...getOwnerScoreUpdate({
            owner,
            fieldId: campaign.fieldId,
            newScore: recalculatedScore,
          }),
        });

        scoreLog.changeScore = nextPreparedChange.changeScore;
        await scoreLog.save();

        return scoreLog;
      }

      const { log } = await applyScoreChange({
        models,
        subdomain,
        doc: {
          owner,
          ownerId,
          ownerType,
          campaignId: campaign._id,
          fieldId: campaign.fieldId,
          serviceName,
          targetId,
          action: actionMethod,
          signedChangeScore:
            actionMethod === 'subtract' ? -changeScore : changeScore,
        },
      });

      return log;
    }

    public static async refundLoyaltyScore(
      targetId: string,
      ownerType: string,
      ownerId: string,
    ) {
      const { log } = await refundScoreChange({
        models,
        subdomain,
        doc: {
          targetId,
          ownerType,
          ownerId,
        },
      });

      return log;
    }

    static async updateOwnerScore({
      ownerId,
      ownerType,
      updatedCustomFieldsData,
      updatedScore,
    }: {
      ownerId: string;
      ownerType: string;
      updatedCustomFieldsData?: Record<string, any>;
      updatedScore?: number;
    }) {
      return await updateOwnerScoreCache({
        subdomain,
        ownerId,
        ownerType,
        updatedCustomFieldsData,
        updatedScore,
      });
    }
  }

  scoreCampaignSchema.loadClass(ScoreCampaign);

  return scoreCampaignSchema;
};
