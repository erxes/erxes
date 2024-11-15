import { IUser, IUserDocument } from "@erxes/api-utils/src/types";
import {
  IScoreCampaign,
  IScoreCampaignDocuments,
  scoreCampaignSchema
} from "./definitions/scoreCampaigns";
import { putCreateLog, putDeleteLog, putUpdateLog } from "../logUtils";
import { IModels } from "../connectionResolver";
import { Model } from "mongoose";

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
      const result = await models.ScoreCampaigns.create({
        ...doc,
        createdUserId: user._id
      });
      await putCreateLog(
        models,
        subdomain,
        {
          type: "scoreCampaign",
          newData: doc
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
      return await models.ScoreCampaigns.deleteOne({ _id });
    }

    public static async removeScoreCampaigns(
      _ids: string,
      user: IUserDocument
    ) {
      return await models.ScoreCampaigns.deleteMany({ _id: { $in: _ids } });
    }
  }

  scoreCampaignSchema.loadClass(ScoreCampaign);

  return scoreCampaignSchema;
};
