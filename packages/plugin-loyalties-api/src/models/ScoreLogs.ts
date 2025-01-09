import * as _ from "underscore";
import { Model, models } from "mongoose";
import { getOwner } from "./utils";
import { IModels } from "../connectionResolver";
import {
  IScoreLogDocument,
  scoreLogSchema,
  IScoreLog
} from "./definitions/scoreLog";
import {
  sendClientPortalMessage,
  sendCommonMessage,
  sendCoreMessage
} from "../messageBroker";

import { IScoreParams } from "./definitions/common";
import { paginate } from "@erxes/api-utils/src";
import { debugError } from "@erxes/api-utils/src/debuggers";

const OWNER_TYPES = {
  customer: {
    serviceName: "core",
    contentType: "customers"
  },
  company: {
    serviceName: "core",
    contentType: "companies"
  },
  user: {
    serviceName: "core",
    contentType: "users"
  }
};

export interface IScoreLogModel extends Model<IScoreLogDocument> {
  getScoreLog(_id: string): Promise<IScoreLogDocument>;
  getScoreLogs(doc: IScoreParams): Promise<IScoreLogDocument>;
  changeScore(doc: IScoreLog): Promise<IScoreLogDocument>;
  changeOwnersScore(doc): Promise<IScoreLogDocument>;
}

const generateFilter = (params: IScoreParams) => {
  let filter: any = {};
  if (params.ownerType) {
    filter.ownerType = params.ownerType;
  }
  if (params.ownerId) {
    filter.ownerId = params.ownerId;
  }
  if (params.fromDate) {
    filter.createdAt = { $gte: params.fromDate };
  }
  if (params.toDate) {
    filter.createdAt = { ...filter.createdAt, $lt: params.toDate };
  }
  if (params.campaignId) {
    filter.campaignId = params.campaignId;
  }
  return filter;
};

export const loadScoreLogClass = (models: IModels, subdomain: string) => {
  class ScoreLog {
    public static async getScoreLog(_id: string) {
      const scoreLog = await models.ScoreLogs.findOne({ _id }).lean();

      if (!scoreLog) {
        throw new Error("not found scoreLog rule");
      }

      return scoreLog;
    }

    public static async getScoreLogs(doc: IScoreParams) {
      const { order = -1, orderType = "createdAt" } = doc;
      const filter = generateFilter(doc);
      const list = await paginate(
        models.ScoreLogs.find(filter).sort({ [orderType]: order } as any),
        doc
      );
      const total = await models.ScoreLogs.find(filter).countDocuments();
      return { list, total };
    }

    public static async changeOwnersScore(doc: IScoreLog) {
      const {
        ownerType,
        ownerIds,
        changeScore,
        description,
        createdBy = ""
      } = doc;
      const { serviceName, contentType } = OWNER_TYPES[ownerType] || {};

      const score = Number(changeScore);
      const ownerFilter = { _id: { $in: ownerIds } };

      const owners = await sendCommonMessage({
        subdomain,
        serviceName,
        action: `${contentType}.find`,
        data:
          contentType === "users"
            ? { query: { ...ownerFilter } }
            : { ...ownerFilter },
        isRPC: true,
        defaultValue: []
      }).catch(error => debugError(error.message));

      if (!owners?.length) {
        throw new Error("Not found owners");
      }

      try {
        await sendCommonMessage({
          subdomain,
          serviceName,
          action: `${contentType}.updateMany`,
          data: {
            selector: {
              _id: { $in: owners.map(owner => owner._id) }
            },
            modifier: {
              $inc: { score }
            }
          },
          isRPC: true
        });
      } catch (error) {
        throw new Error(error.message);
      }

      const commonDoc = {
        ownerType,
        changeScore: score,
        createdAt: new Date(),
        description,
        createdBy
      };

      const newDatas = owners.map(owner => ({
        ownerId: owner._id,
        ...commonDoc
      }));

      return await models.ScoreLogs.insertMany(newDatas);
    }

    public static async changeScore(doc: IScoreLog) {
      const {
        ownerType,
        ownerId,
        changeScore,
        description,
        createdBy = "",
        campaignId
      } = doc;

      const score = Number(changeScore);
      const owner = await getOwner(subdomain, ownerType, ownerId);

      if (!owner) {
        throw new Error(`not fount ${ownerType}`);
      }

      let ownerScore = owner.score;

      if (campaignId) {
        const campaign = await models.ScoreCampaigns.findOne({
          _id: campaignId
        });

        if (!campaign) {
          throw new Error("Campaign not found");
        }
        const campaignScore =
          (owner?.customFieldsData || []).find(
            ({ field }) => field === campaign.fieldId
          )?.value || 0;
        ownerScore = campaignScore;
      }

      const oldScore = Number(ownerScore) || 0;
      const newScore = oldScore + score;

      if (score < 0 && newScore < 0) {
        throw new Error(`score are not enough`);
      }

      const response = await this.updateOwnerScore({
        subdomain,
        ownerId,
        ownerType,
        newScore,
        campaignId
      });

      if (!response || !Object.keys(response || {})?.length) {
        throw new Error("Something went wrong for give score");
      }
      return await models.ScoreLogs.create({
        ownerId,
        ownerType,
        changeScore: score,
        createdAt: new Date(),
        description,
        createdBy,
        action: "add"
      });
    }

    static async updateOwnerScore({
      subdomain,
      ownerType,
      ownerId,
      newScore,
      campaignId
    }) {
      const updateEntity = async (
        action: string,
        selector: any,
        modifier: any
      ) =>
        await sendCoreMessage({
          subdomain,
          action,
          data: { selector, modifier },
          isRPC: true,
          defaultValue: null
        });

      const modifier: any = { $set: { score: newScore } };
      const selector: {
        _id: string;
      } = { _id: ownerId };

      if (campaignId) {
        const campaign = await models.ScoreCampaigns.findOne({
          _id: campaignId
        });

        if (!campaign?.fieldId) {
          throw new Error(
            "Something went wrong when trying to find campaign field"
          );
        }

        const prepareCustomFieldsData = await sendCoreMessage({
          subdomain,
          action: "fields.prepareCustomFieldsData",
          data: [{ field: campaign.fieldId, value: newScore }],
          isRPC: true,
          defaultValue: []
        });

        if (!prepareCustomFieldsData[0]) {
          throw new Error(
            "Something went wrong when preparing score field data"
          );
        }

        const prepareCustomFieldData: { field: string; value: number } =
          prepareCustomFieldsData[0];

        const owner = await getOwner(subdomain, ownerType, ownerId);

        const { customFieldsData } = owner || {};
        let updatedCustomFieldsData;

        if (
          !customFieldsData ||
          !(customFieldsData || []).find(
            ({ field }) => field === campaign.fieldId
          )
        ) {
          updatedCustomFieldsData = [
            ...(customFieldsData || []),
            prepareCustomFieldData
          ];
        } else {
          updatedCustomFieldsData = customFieldsData.map(customFieldData =>
            customFieldData.field === campaign.fieldId
              ? { ...customFieldData, ...prepareCustomFieldData }
              : customFieldData
          );
        }

        modifier.$set["customFieldsData"] = updatedCustomFieldsData || [];
        delete modifier.$set.score;
      }

      if (ownerType === "user") {
        return await updateEntity("users.updateOne", selector, modifier);
      }
      if (ownerType === "customer") {
        console.log(selector, modifier);
        return await updateEntity("customers.updateOne", selector, modifier);
      }
      if (ownerType === "company") {
        return await updateEntity("companies.updateOne", selector, modifier);
      }
      if (ownerType === "cpUser") {
        const cpUser = await sendClientPortalMessage({
          subdomain,
          action: "clientPortalUsers.findOne",
          data: {
            _id: ownerId
          },
          isRPC: true,
          defaultValue: null
        });

        if (!cpUser) {
          throw new Error("Not Found Owner");
        }
        return await sendCoreMessage({
          subdomain,
          action: "customers.updateOne",
          data: {
            selector: { _id: cpUser.erxesCustomerId },
            modifier
          },
          isRPC: true,
          defaultValue: null
        });
      }
    }
  }

  scoreLogSchema.loadClass(ScoreLog);

  return scoreLogSchema;
};
