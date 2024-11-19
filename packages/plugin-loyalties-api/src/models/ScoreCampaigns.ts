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
  }

  scoreCampaignSchema.loadClass(ScoreCampaign);

  return scoreCampaignSchema;
};
