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
} from '@/score/utils';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils';

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
}

export const loadScoreCampaignClass = (models: IModels, subdomain: string) => {
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

      return await models.ScoreCampaigns.create({
        ...doc,
        createdUserId: user._id,
      });
    }

    public static async updateScoreCampaign(
      _id: string,
      doc: IScoreCampaign,
      user: IUserDocument,
    ) {
      const scoreCampaign = await this.getScoreCampaign(_id);

      if (
        !!scoreCampaign?.ownerType &&
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

      return await models.ScoreCampaigns.updateOne(
        { _id },
        { $set: { ...doc } },
      );
    }

    public static async removeScoreCampaign(_id: string, user: IUserDocument) {
      await this.getScoreCampaign(_id);

      return await models.ScoreCampaigns.updateOne(
        { _id },
        { $set: { status: SCORE_CAMPAIGN_STATUSES.ARCHIVED } },
      );
    }

    public static async removeScoreCampaigns(_ids: string) {
      return await models.ScoreCampaigns.updateMany(
        { _id: { $in: _ids } },
        { $set: { status: SCORE_CAMPAIGN_STATUSES.ARCHIVED } },
      );
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

      let { placeholder, currencyRatio = 0 } = campaign?.subtract || {};

      const matches = (placeholder || '').match(/\{\{\s*([^}]+)\s*\}\}/g);
      const attributes = (matches || []).map((match) =>
        match.replace(/\{\{\s*|\s*\}\}/g, ''),
      );

      for (const attribute of attributes) {
        placeholder = resolvePlaceholderValue(target, attribute);
      }

      let changeScore = (eval(placeholder) || 0) * Number(currencyRatio) || 0;

      const { score = 0, customFieldsData = [] } = owner || {};

      let oldScore = score;

      if (campaign.fieldId) {
        const fieldScore =
          customFieldsData.find(({ field }) => field === campaign.fieldId)
            ?.value || 0;
        oldScore = fieldScore;
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
          module: 'clientPortalUsers',
          action: 'findOne',
          input: {
            erxesCustomerId: owner._id,
          },
          defaultValue: null,
        });

        if (!cpUser) {
          throw new Error(
            'This campaign is only available to client portal users.',
          );
        }
      }

      let { placeholder = '', currencyRatio = 0 } = campaign[actionMethod];

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

      const changeScore = (eval(placeholder) || 0) * Number(currencyRatio) || 0;
      if (!changeScore) {
        return;
      }

      // const scoreLog = await models.ScoreLogs.findOne({
      //   targetId,
      //   ownerId,
      //   campaignId,
      //   action: "subtract",
      // });

      // if (scoreLog) {
      //   const prevChangeScore = scoreLog.changeScore;
      //   if (changeScore !== scoreLog.changeScore) {
      //     scoreLog.changeScore = changeScore;

      //     const scoreDifference = changeScore - prevChangeScore;
      //     const updatedCustomFieldsData = (owner?.customFieldsData || []).map(
      //       (customFieldData) =>
      //         customFieldData.field === campaign.fieldId
      //           ? {
      //               ...customFieldData,
      //               value: (customFieldData?.value || 0) + -scoreDifference,
      //             }
      //           : customFieldData
      //     );
      //     const preparedCustomFieldsData = await sendCoreMessage({
      //       subdomain,
      //       action: "fields.prepareCustomFieldsData",
      //       data: updatedCustomFieldsData,
      //       defaultValue: [],
      //       isRPC: true,
      //     });

      //     await this.updateOwnerScore({
      //       ownerId,
      //       ownerType,
      //       updatedCustomFieldsData: preparedCustomFieldsData,
      //     });

      //     await scoreLog.save();
      //     return;
      //   }

      //   return;
      // }

      const { score = 0, customFieldsData = [] } = owner || {};

      let oldScore = score;

      if (campaign.fieldId) {
        const fieldScore =
          customFieldsData.find(({ field }) => field === campaign.fieldId)
            ?.value || 0;
        oldScore = fieldScore;
      }

      const newScore =
        actionMethod === 'subtract'
          ? oldScore - changeScore
          : oldScore + changeScore;

      if (actionMethod === 'subtract' && newScore < 0) {
        throw new Error('There has no enough score to subtract');
      }

      let updatedCustomFieldsData;

      const [preparedCustomFieldsData] = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'fields',
        action: 'prepareCustomFieldsData',
        input: [{ field: campaign.fieldId, value: newScore }],
        defaultValue: [],
      });

      if (
        !customFieldsData ||
        !(customFieldsData || []).find(
          ({ field }) => field === campaign.fieldId,
        )
      ) {
        updatedCustomFieldsData = [
          ...(customFieldsData || []),
          preparedCustomFieldsData,
        ];
      } else {
        updatedCustomFieldsData = customFieldsData.map((customFieldData) =>
          customFieldData.field === campaign.fieldId
            ? { ...customFieldData, ...preparedCustomFieldsData }
            : customFieldData,
        );
      }

      await this.updateOwnerScore({
        ownerId,
        ownerType,
        updatedCustomFieldsData,
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

      let { changeScore, campaignId, action } = scoreLog;

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

      const { customFieldsData = [] } = owner || {};

      const updatedCustomFieldsData = customFieldsData.map((customFieldData) =>
        customFieldData.field === fieldId
          ? {
              ...customFieldData,
              value: (customFieldData?.value || 0) + refundAmount,
            }
          : customFieldData,
      );

      const preparedCustomFieldsData = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'fields',
        action: 'prepareCustomFieldsData',
        input: updatedCustomFieldsData,
        defaultValue: [],
      });

      await this.updateOwnerScore({
        ownerId,
        ownerType,
        updatedCustomFieldsData: preparedCustomFieldsData,
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
    }) {
      const actionsObj = {
        user: { module: 'users', action: 'updateOne' },
        customer: { module: 'customers', action: 'updateOne' },
        company: { module: 'companies', action: 'updateOne' },
      };

      return await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: actionsObj[ownerType].module,
        action: actionsObj[ownerType].action,
        input: {
          selector: { _id: ownerId },
          modifier: { $set: { customFieldsData: updatedCustomFieldsData } },
        },
        defaultValue: null,
      });
    }
  }

  scoreCampaignSchema.loadClass(ScoreCampaign);

  return scoreCampaignSchema;
};
