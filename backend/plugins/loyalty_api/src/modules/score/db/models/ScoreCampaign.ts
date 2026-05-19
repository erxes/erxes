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
  if (!fieldId) {
    return Number(owner?.score) || 0;
  }

  return (
    Number(
      owner?.propertiesData?.[fieldId] ??
      (owner?.customFieldsData || []).find(({ field }) => field === fieldId)
        ?.value,
    ) || 0
  );
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

    public static async removeScoreCampaigns(_ids: string[], user: IUserDocument) {
      const idsArray = Array.isArray(_ids) ? _ids : [_ids];
      const prevDocs = await models.ScoreCampaigns.find({ _id: { $in: idsArray } }).lean();

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
        status: 'published',
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.ownerType !== ownerType) {
        throw new Error(
          'Owner type is not the same as the owner type of the campaign',
        );
      }

      const { currencyRatio = 0 } = campaign?.subtract || {};
      let placeholder = campaign?.subtract?.placeholder || '';

      const matches = (placeholder || '').match(/\{\{\s*([^}]+)\s*\}\}/g);
      const attributes = (matches || []).map((match) =>
        match.replace(/\{\{\s*|\s*\}\}/g, ''),
      );

      for (const attribute of attributes) {
        placeholder = resolvePlaceholderValue(target, attribute);
      }

      let changeScore =
        (safeEvalMath(placeholder) || 0) * Number(currencyRatio) || 0;

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
        status: 'published',
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.ownerType !== ownerType) {
        throw new Error(
          'Owner type is not the same as the owner type of the campaign',
        );
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

      const { currencyRatio = 0 } = campaign[actionMethod] || {};
      let placeholder = campaign[actionMethod]?.placeholder || ''

      const matches = (placeholder || '').match(/\{\{\s*([^}]+)\s*\}\}/g);
      const attributes = [
        ...new Set(
          (matches || []).map((match) => match.replace(/\{\{\s*|\s*\}\}/g, '')),
        ),
      ];

      for (const attribute of attributes) {
        const placeholderValue = resolvePlaceholderValue(target, attribute);

        placeholder = placeholder.replace(
          new RegExp(`{{ ${attribute} }}`, 'g'),
          placeholderValue,
        );
      }

      const changeScore =
        (safeEvalMath(placeholder) || 0) * Number(currencyRatio) || 0;
      if (!changeScore) {
        return;
      }

      let oldScore = Number(owner?.score) || 0;

      if (campaign.fieldId) {
        oldScore = getOwnerFieldScore(owner, campaign.fieldId);
      }

      const scoreLog = await models.ScoreLogs.findOne({
        targetId,
        ownerId,
        ownerType,
        campaignId: campaign._id,
        action: actionMethod,
      });

      if (scoreLog) {
        const prevChangeScore = Number(scoreLog.changeScore) || 0;

        if (changeScore === prevChangeScore) {
          return scoreLog;
        }

        const scoreDifference = changeScore - prevChangeScore;
        const recalculatedScore =
          actionMethod === 'subtract'
            ? oldScore - scoreDifference
            : oldScore + scoreDifference;

        if (actionMethod === 'subtract' && recalculatedScore < 0) {
          throw new Error('There has no enough score to subtract');
        }

        await this.updateOwnerScore({
          ownerId,
          ownerType,
          ...(campaign.fieldId
            ? {
              updatedCustomFieldsData: {
                ...owner?.propertiesData,
                [campaign.fieldId]: recalculatedScore,
              },
            }
            : { updatedScore: recalculatedScore }),
        });

        scoreLog.changeScore = changeScore;
        await scoreLog.save();

        return scoreLog;
      }

      const newScore =
        actionMethod === 'subtract'
          ? oldScore - changeScore
          : oldScore + changeScore;

      if (actionMethod === 'subtract' && newScore < 0) {
        throw new Error('There has no enough score to subtract');
      }

      const updatedPropertiesData = campaign.fieldId
        ? {
          ...owner?.propertiesData,
          [campaign.fieldId]: newScore,
        }
        : owner?.propertiesData || {};

      await this.updateOwnerScore({
        ownerId,
        ownerType,
        ...(campaign.fieldId
          ? { updatedCustomFieldsData: updatedPropertiesData }
          : { updatedScore: newScore }),
      });

      return await models.ScoreLogs.create({
        ownerId,
        ownerType,
        changeScore,
        createdAt: new Date(),
        campaignId: campaign._id,
        serviceName,
        targetId,
        action: actionMethod,
      });
    }

    public static async refundLoyaltyScore(
      targetId: string,
      ownerType: string,
      ownerId: string,
    ) {
      if (!targetId || !ownerId || !ownerType) {
        throw new Error('Please provide owner & target');
      }

      let scoreLog = await models.ScoreLogs.findOne({
        targetId,
        ownerId,
        action: 'subtract',
      });

      if (!scoreLog) {
        scoreLog = await models.ScoreLogs.findOne({
          targetId,
          ownerId,
          action: 'add',
        });

        if (!scoreLog) {
          throw new Error('Cannot find score log on this target');
        }
      }

      const refundScoreLog = await models.ScoreLogs.exists({
        targetId,
        ownerId,
        action: 'refund',
        sourceScoreLogId: scoreLog._id,
      });

      if (refundScoreLog) {
        throw new Error(
          'Cannot refund loyalty score cause already refunded loyalty score',
        );
      }

      const { changeScore, campaignId, action } = scoreLog;

      const campaign = await models.ScoreCampaigns.findOne({ _id: campaignId });
      if (!campaign) {
        throw new Error(
          'Error occurred while retrieving the score campaign from the score log for the target and owner.',
        );
      }

      let refundAmount: number;

      if (action === 'subtract') {
        const addedScoreLogs = await models.ScoreLogs.find({
          targetId,
          ownerId,
          action: 'add',
        });

        if (addedScoreLogs && addedScoreLogs.length > 0) {
          const totalAddedScore = addedScoreLogs.reduce(
            (acc, curr) => acc + curr.changeScore,
            0,
          );
          refundAmount = changeScore - totalAddedScore;
        } else {
          refundAmount = changeScore;
        }
      } else if (action === 'add') {
        refundAmount = -changeScore;
      } else {
        throw new Error(`Unsupported action type for refund: ${action}`);
      }

      const { fieldId } = campaign;

      const owner = await getLoyaltyOwner(subdomain, { ownerType, ownerId });

      if (!owner) {
        throw new Error('Cannot find owner');
      }

      await this.updateOwnerScore({
        ownerId,
        ownerType,
        ...(fieldId
          ? {
            updatedCustomFieldsData: {
              ...owner?.propertiesData,
              [fieldId]: getOwnerFieldScore(owner, fieldId) + refundAmount,
            },
          }
          : { updatedScore: getOwnerFieldScore(owner) + refundAmount }),
      });

      return await models.ScoreLogs.create({
        ownerId,
        ownerType,
        changeScore: refundAmount,
        createdAt: new Date(),
        campaignId: campaign._id,
        serviceName: scoreLog.serviceName,
        targetId,
        action: 'refund',
        sourceScoreLogId: scoreLog._id,
      });
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
      const actionsObj = {
        user: { module: 'users', action: 'updateOne' },
        customer: { module: 'customers', action: 'updateMany' },
        company: { module: 'companies', action: 'updateMany' },
      };

      const $set: Record<string, any> = {};

      if (updatedCustomFieldsData !== undefined) {
        $set.propertiesData = updatedCustomFieldsData;
      }

      if (updatedScore !== undefined) {
        $set.score = updatedScore;
      }

      return await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: actionsObj[ownerType].module,
        action: actionsObj[ownerType].action,
        input: {
          selector: { _id: ownerId },
          modifier: { $set },
        },
        defaultValue: null,
      });
    }
  }

  scoreCampaignSchema.loadClass(ScoreCampaign);

  return scoreCampaignSchema;
};