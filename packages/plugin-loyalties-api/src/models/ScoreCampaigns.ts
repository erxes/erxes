import { ICustomField, IUserDocument } from "@erxes/api-utils/src/types";
import { Model } from "mongoose";
import { IModels } from "../connectionResolver";
import { putCreateLog, putDeleteLog, putUpdateLog } from "../logUtils";
import { sendClientPortalMessage, sendCoreMessage } from "../messageBroker";
import {
  IScoreCampaign,
  IScoreCampaignDocuments,
  SCORE_CAMPAIGN_STATUSES,
  scoreCampaignSchema,
} from "./definitions/scoreCampaigns";
import {
  getOwner,
  handleOnCreateCampaignScoreField,
  handleOnUpdateCampaignScoreField,
  resolvePlaceholderValue,
} from "./utils";

type DoCampaingTypes = {
  serviceName: string;
  targetId: string;
  ownerType: string;
  ownerId: string;
  campaignId: string;
  target: any;
  actionMethod: "add" | "subtract";
};

export interface IScoreCampaignModel extends Model<IScoreCampaignDocuments> {
  getScoreCampaign(_id: string): Promise<IScoreCampaignDocuments>;
  createScoreCampaign(
    doc: IScoreCampaign,
    user: IUserDocument
  ): Promise<IScoreCampaignDocuments>;
  updateScoreCampaign(
    _id: string,
    doc: IScoreCampaign,
    user: IUserDocument
  ): Promise<IScoreCampaignDocuments>;
  removeScoreCampaign(
    _id: string,
    user: IUserDocument
  ): Promise<IScoreCampaignDocuments>;
  removeScoreCampaigns(
    _ids: string[],
    user: IUserDocument
  ): Promise<IScoreCampaignDocuments>;
  doCampaign(data: DoCampaingTypes): Promise<any>;
  checkScoreAviableSubtract(data: {
    ownerType: string;
    ownerId: string;
    campaignId: string;
    target: any;
  }): Promise<boolean>;

  refundLoyaltyScore(
    targetId: string,
    ownerType: string,
    ownerId: string
  ): Promise<boolean>;

  updateOwnerScore({
    ownerId,
    ownerType,
    updatedCustomFieldsData
  }: {
    ownerId: string;
    ownerType: string;
    updatedCustomFieldsData: ICustomField[]
  }): Promise<void>;
}

export const loadScoreCampaignClass = (models: IModels, subdomain: string) => {
  class ScoreCampaign {
    public static async getScoreCampaign(_id: string) {
      const scoreCampaign = await models.ScoreCampaigns.findOne({ _id });

      if (!scoreCampaign) {
        throw new Error("Score campaign not found");
      }

      return scoreCampaign;
    }

    public static async createScoreCampaign(
      doc: IScoreCampaign,
      user: IUserDocument
    ) {
      doc = await handleOnCreateCampaignScoreField({ doc, subdomain });

      const result = await models.ScoreCampaigns.create({
        ...doc,
        createdUserId: user._id,
      });
      await putCreateLog(
        models,
        subdomain,
        {
          type: "scoreCampaign",
          newData: doc,
          object: doc,
        },
        user
      );

      return result;
    }

    public static async updateScoreCampaign(
      _id: string,
      doc: IScoreCampaign,
      user: IUserDocument
    ) {
      const scoreCampaign = await this.getScoreCampaign(_id);

      if (
        !!scoreCampaign?.ownerType &&
        scoreCampaign.ownerType !== doc.ownerType
      ) {
        throw new Error(
          "You cannot modify the ownership type of the score field."
        );
      }

      doc = await handleOnUpdateCampaignScoreField({
        doc,
        subdomain,
        scoreCampaign,
      });
      await putUpdateLog(
        models,
        subdomain,
        {
          type: "scoreCampaign",
          newData: doc,
          object: scoreCampaign.toObject(),
        },
        user
      );

      return await models.ScoreCampaigns.updateOne(
        { _id },
        { $set: { ...doc } }
      );
    }

    public static async removeScoreCampaign(_id: string, user: IUserDocument) {
      const scoreCampaign = await this.getScoreCampaign(_id);

      await putDeleteLog(
        models,
        subdomain,
        {
          type: "scoreCampaign",
          object: scoreCampaign,
        },
        user
      );
      return await models.ScoreCampaigns.updateOne(
        { _id },
        { $set: { status: SCORE_CAMPAIGN_STATUSES.ARCHIVED } }
      );
    }

    public static async removeScoreCampaigns(_ids: string) {
      return await models.ScoreCampaigns.updateMany(
        { _id: { $in: _ids } },
        { $set: { status: SCORE_CAMPAIGN_STATUSES.ARCHIVED } }
      );
    }

    public static async checkScoreAviableSubtract(data) {
      const { ownerType, ownerId, campaignId, target, targetId } = data;

      if (!ownerType || !ownerId) {
        throw new Error("You must provide a owner");
      }

      const owner = await getOwner(subdomain, ownerType, ownerId);

      if (!owner) {
        throw new Error("Owner not found");
      }

      const campaign = await models.ScoreCampaigns.findOne({
        _id: campaignId,
        status: "published",
      });

      if (!campaign) {
        throw new Error("Campaign not found");
      }

      if (campaign.ownerType !== ownerType) {
        throw new Error(
          "Owner type is not the same as the owner type of the campaign"
        );
      }

      let { placeholder, currencyRatio = 0 } = campaign?.subtract || {};

      const matches = (placeholder || "").match(/\{\{\s*([^}]+)\s*\}\}/g);
      const attributes = (matches || []).map((match) =>
        match.replace(/\{\{\s*|\s*\}\}/g, "")
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
          action: "subtract",
        });

        if (scoreLog) {
          changeScore = changeScore - scoreLog?.changeScore;
        }
      }

      const newScore = oldScore - changeScore;

      if (newScore < 0) {
        throw new Error("There has no enough score to subtract");
      }

      return true;
    }

    public static async doCampaign(data: DoCampaingTypes) {
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
        throw new Error("You must provide a owner");
      }

      const owner = await getOwner(subdomain, ownerType, ownerId);

      if (!owner) {
        throw new Error("Owner not found");
      }

      const campaign = await models.ScoreCampaigns.findOne({
        _id: campaignId,
        status: "published",
      });

      if (!campaign) {
        throw new Error("Campaign not found");
      }

      if (campaign.ownerType !== ownerType) {
        throw new Error(
          "Owner type is not the same as the owner type of the campaign"
        );
      }

      if (campaign.onlyClientPortal && ownerType === "customer") {
        const cpUser = await sendClientPortalMessage({
          subdomain,
          action: "clientPortalUsers.findOne",
          data: {
            erxesCustomerId: owner._id,
          },
          isRPC: true,
          defaultValue: null,
        });

        if (!cpUser) {
          throw new Error(
            "This campaign is only available to client portal users."
          );
        }
      }

      let { placeholder = "", currencyRatio = 0 } = campaign[actionMethod];

      const matches = (placeholder || "").match(/\{\{\s*([^}]+)\s*\}\}/g);
      const attributes = [
        ...new Set(
          (matches || []).map((match) => match.replace(/\{\{\s*|\s*\}\}/g, ""))
        ),
      ];

      for (const attribute of attributes) {
        const placeholderValue = resolvePlaceholderValue(target, attribute);
        placeholder = placeholder.replaceAll(
          `{{ ${attribute} }}`,
          placeholderValue
        );
      }

      console.log({ placeholder });

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

      console.log({ customFieldsData,score ,changeScore });
      if (campaign.fieldId) {
        const fieldScore =
          customFieldsData.find(({ field }) => field === campaign.fieldId)
            ?.value || 0;
        oldScore = fieldScore;
      }

      console.log({ oldScore });

      const newScore =
        actionMethod === "subtract"
          ? oldScore - changeScore
          : oldScore + changeScore;

      if (actionMethod === "subtract" && newScore < 0) {
        throw new Error("There has no enough score to subtract");
      }

      let updatedCustomFieldsData;

      const [preparedCustomFieldsData] = await sendCoreMessage({
        subdomain,
        action: "fields.prepareCustomFieldsData",
        data: [{ field: campaign.fieldId, value: newScore }],
        defaultValue: [],
        isRPC: true,
      });

      if (
        !customFieldsData ||
        !(customFieldsData || []).find(
          ({ field }) => field === campaign.fieldId
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
            : customFieldData
        );
      }

      console.log({ updatedCustomFieldsData, });

      await this.updateOwnerScore({
        ownerId,
        ownerType,
        updatedCustomFieldsData,
      });
console.log("score log");
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
      ownerId: string
    ) {
      if (!targetId || !ownerId || !ownerType) {
        throw new Error("Please provide owner & target");
      }

      let scoreLog = await models.ScoreLogs.findOne({
        targetId,
        ownerId,
        action: "subtract",
      });

      if (!scoreLog) {
        scoreLog = await models.ScoreLogs.findOne({
          targetId,
          ownerId,
          action: "add",
        });

        if (!scoreLog) {
          throw new Error("Cannot find score log on this target");
        }
      }

      const refundScoreLog = await models.ScoreLogs.exists({
        targetId,
        ownerId,
        action: "refund",
        sourceScoreLogId: scoreLog._id,
      });

      if (refundScoreLog) {
        throw new Error(
          "Cannot refund loyalty score cause already refunded loyalty score"
        );
      }

      let { changeScore, campaignId, action } = scoreLog;

      const campaign = await models.ScoreCampaigns.findOne({ _id: campaignId });
      if (!campaign) {
        throw new Error(
          "Error occurred while retrieving the score campaign from the score log for the target and owner."
        );
      }

      let refundAmount: number;

      if (action === "subtract") {
        const addedScoreLogs = await models.ScoreLogs.find({
          targetId,
          ownerId,
          action: "add",
        });

        if (addedScoreLogs && addedScoreLogs.length > 0) {
          const totalAddedScore = addedScoreLogs.reduce(
            (acc, curr) => acc + curr.changeScore,
            0
          );
          refundAmount = changeScore - totalAddedScore;
        } else {
          refundAmount = changeScore;
        }
      } else if (action === "add") {
        refundAmount = -changeScore;
      } else {
        throw new Error(`Unsupported action type for refund: ${action}`);
      }

      const { fieldId } = campaign;

      const owner = await getOwner(subdomain, ownerType, ownerId);

      if (!owner) {
        throw new Error("Cannot find owner");
      }

      const { customFieldsData = [] } = owner || {};

      const updatedCustomFieldsData = customFieldsData.map((customFieldData) =>
        customFieldData.field === fieldId
          ? {
              ...customFieldData,
              value: (customFieldData?.value || 0) + refundAmount,
            }
          : customFieldData
      );

      const preparedCustomFieldsData = await sendCoreMessage({
        subdomain,
        action: "fields.prepareCustomFieldsData",
        data: updatedCustomFieldsData,
        defaultValue: [],
        isRPC: true,
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
        action: "refund",
        sourceScoreLogId: scoreLog._id,
      });
    }

    static async updateOwnerScore({
      ownerId,
      ownerType,
      updatedCustomFieldsData,
    }) {
      const actionsObj = {
        user: "users.updateOne",
        customer: "customers.updateOne",
        company: "companies.updateOne",
      };
      return await sendCoreMessage({
        subdomain,
        action: actionsObj[ownerType],
        data: {
          selector: { _id: ownerId },
          modifier: { $set: { customFieldsData: updatedCustomFieldsData } },
        },
        isRPC: true,
        defaultValue: null,
      });
    }
  }

  scoreCampaignSchema.loadClass(ScoreCampaign);

  return scoreCampaignSchema;
};
