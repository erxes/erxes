import { Model } from "mongoose";
import { IModels } from "../connectionResolver";
import {
  sendClientPortalMessage,
  sendCommonMessage,
  sendCoreMessage,
} from "../messageBroker";
import {
  IScoreLog,
  IScoreLogDocument,
  scoreLogSchema,
} from "./definitions/scoreLog";
import { getOwner, scoreStatistic } from "./utils";

import { debugError } from "@erxes/api-utils/src/debuggers";
import { IScoreParams } from "./definitions/common";
import { SCORE_CAMPAIGN_STATUSES } from "./definitions/scoreCampaigns";

const OWNER_TYPES = {
  customer: {
    serviceName: "core",
    contentType: "customers",
  },
  company: {
    serviceName: "core",
    contentType: "companies",
  },
  user: {
    serviceName: "core",
    contentType: "users",
  },
};

export interface IScoreLogModel extends Model<IScoreLogDocument> {
  getScoreLog(_id: string): Promise<IScoreLogDocument>;
  getScoreLogs(doc: IScoreParams): Promise<IScoreLogDocument>;
  getStatistic(doc: IScoreParams): Promise<IScoreLogDocument>;
  changeScore(doc: IScoreLog): Promise<IScoreLogDocument>;
  changeOwnersScore(doc): Promise<IScoreLogDocument>;
}

const generateFilter = async (
  params: IScoreParams,
  models: IModels,
  subdomain: string
) => {
  let filter: any = {
    changeScore: {
      $gte: Number.NEGATIVE_INFINITY,
      $lte: Number.POSITIVE_INFINITY,
    },
  };

  if (params.ownerType) {
    filter.ownerType = params.ownerType;
  }

  if (params.ownerId) {
    filter.ownerId = params.ownerId;
  }

  if (params.fromDate || params.toDate) {
    filter.createdAt = {};

    if (params.fromDate) {
      filter.createdAt.$gte = new Date(params.fromDate);
    }

    if (params.toDate) {
      filter.createdAt.$lte = new Date(params.toDate);
    }
  }

  if (params.campaignId) {
    filter.campaignId = params.campaignId;
  }

  if (params.action) {
    const refundedTargetIds = await models.ScoreLogs.distinct("targetId", {
      action: "refund",
    });

    if (refundedTargetIds?.length) {
      filter.targetId = {
        $nin: refundedTargetIds,
      };
    }

    if (params.action === 'manual') {
      filter.description = { $exists: true, $ne: '' };
    } else {
      filter.action = params.action;
    }

    if (params.description) {
      filter.description = { $regex: params.description }
    }
  }

  if (params.stageId) {
    filter["target.stageId"] = params.stageId;
  }

  if (params.number) {
    filter["target.number"] = params.number;
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
      const {
        page = 1,
        perPage = 20,
        sortDirection = -1,
        sortField = "createdAt",
        stageId,
        number,
      } = doc;

      const filter = await generateFilter(doc, models, subdomain);

      let filterAggregate: any[] = [];

      if (stageId || number) {
        const lookup = [
          {
            $lookup: {
              from: "deals",
              localField: "targetId",
              foreignField: "_id",
              as: "target",
            },
          },
          {
            $unwind: "$target",
          },
        ];

        filterAggregate.push(...lookup);
      }

      const aggregation: any = [
        ...filterAggregate,
        {
          $match: { ...filter },
        },
        {
          $addFields: {
            signedScore: {
              $cond: {
                if: { $eq: ["$action", "subtract"] },
                then: { $multiply: ["$changeScore", -1] },
                else: "$changeScore",
              },
            },
          },
        },
        {
          $sort: {
            [sortField]: Number(sortDirection),
          },
        },
        {
          $group: {
            _id: "$ownerId",
            ownerType: { $first: "$ownerType" },
            scoreLogs: { $push: "$$ROOT" },
            createdAt: { $max: "$createdAt" },
            changeScore: { $sum: "$signedScore" },
          },
        },
        {
          $sort: {
            [sortField]: Number(sortDirection),
          },
        },
        {
          $project: {
            _id: 0,
            ownerId: "$_id",
            ownerType: 1,
            scoreLogs: 1,
            totalScore: "$changeScore",
          },
        },
        {
          $facet: {
            list: [{ $skip: (page - 1) * perPage }, { $limit: perPage }],
            total: [{ $count: "count" }],
          },
        },
        {
          $project: {
            list: 1,
            total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
          },
        },
      ];

      const [result] = await models.ScoreLogs.aggregate(aggregation);

      return result;
    }

    public static async getStatistic(doc: IScoreParams) {
      const filter = await generateFilter(doc, models, subdomain);

      return scoreStatistic({ doc, models, filter });
    }

    public static async changeOwnersScore(doc: IScoreLog) {
      const {
        ownerType,
        ownerIds,
        changeScore,
        description,
        createdBy = "",
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
        defaultValue: [],
      }).catch((error) => debugError(error.message));

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
              _id: { $in: owners.map((owner) => owner._id) },
            },
            modifier: {
              $inc: { score },
            },
          },
          isRPC: true,
        });
      } catch (error) {
        throw new Error(error.message);
      }

      const commonDoc = {
        ownerType,
        changeScore: score,
        createdAt: new Date(),
        description,
        createdBy,
      };

      const newDatas = owners.map((owner) => ({
        ownerId: owner._id,
        ...commonDoc,
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
        campaignId,
        targetId,
        serviceName,
      } = doc;

      const score = Number(changeScore);
      const owner = await getOwner(subdomain, ownerType, ownerId);

      if (!owner) {
        throw new Error(`not fount ${ownerType}`);
      }

      if (targetId && serviceName) {
        const target = await models.ScoreLogs.exists({
          targetId,
          serviceName,
          action: 'add'
        })

        if (target) {
          throw new Error("Already added loyalty score to this target");
        }
      }

      let ownerScore = 0;

      const campaignFilter: any = { status: SCORE_CAMPAIGN_STATUSES.PUBLISHED };
      const usedCustomFieldIds: string[] = [];
      if (campaignId) {
        campaignFilter._id = campaignId
      }

      const campaigns = await models.ScoreCampaigns.find(campaignFilter).lean();
      if (campaignId && !campaigns?.length) {
        throw new Error("Campaign not found");
      }

      for (const campaign of campaigns) {
        if (usedCustomFieldIds.includes(campaign.fieldId)) {
          continue;
        }

        usedCustomFieldIds.push(campaign.fieldId)
        const campaignScore =
          Number((owner?.customFieldsData || []).find(
            ({ field }) => field === campaign.fieldId
          )?.value) || 0;
        ownerScore += campaignScore;
      }

      const newScore = (Number(ownerScore) || 0) + score;

      if (score < 0 && newScore < 0) {
        throw new Error(`score are not enough`);
      }

      const response = await this.updateOwnerScore({
        subdomain,
        owner,
        ownerType,
        score,
        usedCustomFieldIds,
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
        campaignId,
        action: "add",
        targetId,
        serviceName,
      });
    }

    static async updateOwnerScore({
      subdomain,
      ownerType,
      owner,
      score,
      usedCustomFieldIds,
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
          defaultValue: null,
        });


      const selector = { _id: owner._id };

      let updatedCustomFieldsData = owner.customFieldsData;
      if (score > 0) {
        updatedCustomFieldsData = updatedCustomFieldsData.map(cfd => cfd.field === usedCustomFieldIds[0] ? {
          ...cfd,
          value: Number(cfd.value) + score,
          stringValue: `${Number(cfd.value) + score}`,
          numberValue: Number(cfd.value) + score,
        } : cfd)
      } else {
        let remaining = Math.abs(score);
        for (const cfd of updatedCustomFieldsData) {
          if (!remaining) break;

          if (!usedCustomFieldIds.includes(cfd.field)) {
            continue
          }

          const deduct = Math.min(Number(cfd.value), remaining);
          const newValue = cfd.value - deduct;
          cfd.value = newValue;
          cfd.stringValue = `${newValue}`;
          cfd.numberValue = newValue;
          remaining -= deduct;
        }
      }

      const modifier = { $set: { customFieldsData: updatedCustomFieldsData } };

      if (ownerType === "user") {
        return await updateEntity("users.updateOne", selector, modifier);
      }
      if (ownerType === "customer") {
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
            _id: owner._id,
          },
          isRPC: true,
          defaultValue: null,
        });

        if (!cpUser) {
          throw new Error("Not Found Owner");
        }
        return await sendCoreMessage({
          subdomain,
          action: "customers.updateOne",
          data: {
            selector: { _id: cpUser.erxesCustomerId },
            modifier,
          },
          isRPC: true,
          defaultValue: null,
        });
      }
    }
  }

  scoreLogSchema.loadClass(ScoreLog);

  return scoreLogSchema;
};
