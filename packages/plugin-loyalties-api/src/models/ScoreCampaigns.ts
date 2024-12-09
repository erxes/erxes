import { IUser, IUserDocument } from "@erxes/api-utils/src/types";
import {
  IScoreCampaign,
  IScoreCampaignDocuments,
  SCORE_CAMPAIGN_STATUSES,
  scoreCampaignSchema
} from "./definitions/scoreCampaigns";
import { putCreateLog, putDeleteLog, putUpdateLog } from "../logUtils";
import { IModels } from "../connectionResolver";
import { Model } from "mongoose";
import { sendCoreMessage } from "../messageBroker";
import { getOwner } from "./utils";

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
      if (doc.fieldGroupId) {
        if (!doc?.fieldName) {
          throw new Error("Please provide a field name that for score field");
        }

        const field = await sendCoreMessage({
          subdomain,
          action: "fields.create",
          data: {
            text: doc.fieldName,
            groupId: doc.fieldGroupId,
            type: "input",
            validation: "number",
            contentType: `core:${doc.ownerType}`,
            isDefinedByErxes: true
          },
          defaultValue: null,
          isRPC: true
        });

        doc.fieldId = field._id;
      }

      const result = await models.ScoreCampaigns.create({
        ...doc,
        createdUserId: user._id
      });
      await putCreateLog(
        models,
        subdomain,
        {
          type: "scoreCampaign",
          newData: doc,
          object: doc
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

      if (scoreCampaign.ownerType !== doc.ownerType) {
        throw new Error(
          "You cannot modify the ownership type of the score field."
        );
      }

      const modifiedFieldData: any = {};

      if (doc.fieldGroupId !== scoreCampaign.fieldGroupId) {
        modifiedFieldData.groupId = scoreCampaign.fieldGroupId;
      }

      if (doc.fieldName !== scoreCampaign.fieldName) {
        modifiedFieldData.text = scoreCampaign.fieldName;
      }

      if (Object.keys(modifiedFieldData).length > 0) {
        await sendCoreMessage({
          subdomain,
          action: "fields.updateOne",
          data: {
            selector: { _id: scoreCampaign.fieldId },
            modifier: { $set: modifiedFieldData }
          },
          isRPC: true
        });
      }
      await putUpdateLog(
        models,
        subdomain,
        {
          type: "scoreCampaign",
          newData: doc,
          object: scoreCampaign.toObject()
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
          object: scoreCampaign
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

    public static async doCampaign(data: DoCampaingTypes) {
      const {
        ownerType,
        ownerId,
        campaignId,
        target,
        actionMethod,
        serviceName,
        targetId
      } = data;

      if (!ownerType || !ownerId) {
        throw new Error("You must provide a owner");
      }

      const owner = await getOwner(subdomain, ownerType, ownerId);

      if (!owner) {
        throw new Error("Owner not found");
      }

      const campaign = await models.ScoreCampaigns.findOne({ _id: campaignId });

      if (!campaign) {
        throw new Error("Campaign not found");
      }

      let { placeholder, currencyRatio = 0 } = campaign[actionMethod];

      const matches = (placeholder || "").match(/\{\{\s*([^}]+)\s*\}\}/g);
      const attributes = (matches || []).map(match =>
        match.replace(/\{\{\s*|\s*\}\}/g, "")
      );

      for (const attribute of attributes) {
        placeholder = placeholder.replace(
          `{{ ${attribute} }}`,
          target[attribute]
        );
      }

      console.log({ placeholder });

      const changeScore = (eval(placeholder) || 0) * Number(currencyRatio) || 0;

      const { score = 0, customFieldsData = [] } = owner || {};

      let oldScore = score;

      if (campaign.fieldId) {
        const fieldScore =
          customFieldsData.find(({ field }) => field === campaign.fieldId)
            ?.value || 0;
        oldScore = fieldScore;
      }

      const newScore =
        actionMethod === "subtract"
          ? oldScore - changeScore
          : oldScore + changeScore;

      console.log({ newScore });

      let updatedCustomFieldsData;

      const [preparedCustomFieldsData] = await sendCoreMessage({
        subdomain,
        action: "fields.prepareCustomFieldsData",
        data: [{ field: campaign.fieldId, value: newScore }],
        defaultValue: [],
        isRPC: true
      });

      if (
        !customFieldsData ||
        !(customFieldsData || []).find(
          ({ field }) => field === campaign.fieldId
        )
      ) {
        updatedCustomFieldsData = [
          ...(customFieldsData || []),
          preparedCustomFieldsData
        ];
      } else {
        updatedCustomFieldsData = customFieldsData.map(customFieldData =>
          customFieldData.field === campaign.fieldId
            ? { ...customFieldData, ...preparedCustomFieldsData }
            : customFieldData
        );
      }
      console.log({ updatedCustomFieldsData });

      const actionsObj = {
        user: "users.updateOne",
        customer: "customers.updateOne",
        company: "companies.updateOne"
      };

      console.log({ ownerType });

      await sendCoreMessage({
        subdomain,
        action: actionsObj[ownerType],
        data: {
          selector: { _id: ownerId },
          modifier: { $set: { customFieldsData: updatedCustomFieldsData } }
        },
        isRPC: true,
        defaultValue: null
      });

      return await models.ScoreLogs.create({
        ownerId,
        ownerType,
        changeScore,
        createdAt: new Date(),
        campaignId: campaign._id,
        serviceName,
        targetId
      });
    }
  }

  scoreCampaignSchema.loadClass(ScoreCampaign);

  return scoreCampaignSchema;
};
