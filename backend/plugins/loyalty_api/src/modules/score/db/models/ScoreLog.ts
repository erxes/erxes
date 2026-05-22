import {
  IScoreLog,
  IScoreLogDocument,
  IScoreLogParams,
} from '@/score/@types/scoreLog';
import { SCORE_CAMPAIGN_STATUSES, SCORE_OWNER_TYPES } from '@/score/constants';
import { scoreLogSchema } from '@/score/db/definitions/scoreLog';
import { scoreStatistic } from '@/score/utils';
import {
  buildCursorQuery,
  encodeCursor,
  PageInfo,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { Model, SortOrder } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils';
import { getOwnerFieldScore } from './ScoreCampaign';

export interface IScoreLogModel extends Model<IScoreLogDocument> {
  getScoreLog(_id: string): Promise<IScoreLogDocument>;
  getScoreLogs(doc: IScoreLogParams): Promise<IScoreLogDocument>;
  getStatistic(doc: IScoreLogParams): Promise<IScoreLogDocument>;
  changeScore(doc: IScoreLog): Promise<IScoreLogDocument>;
  changeOwnersScore(doc): Promise<IScoreLogDocument>;
}

const generateFilter = async (
  params: IScoreLogParams,
  models: IModels,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subdomain: string,
) => {
  const filter: any = {
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
    const refundedTargetIds = await models.ScoreLogs.distinct('targetId', {
      action: 'refund',
    });

    if (refundedTargetIds?.length) {
      filter.targetId = {
        $nin: refundedTargetIds,
      };
    }

    if (params.action === 'manual') {
      filter.description = /^manual/i;
    } else if (params.action === 'hasDescription') {
      filter.description = { $exists: true, $nin: [null, ''] };
    } else {
      filter.action = params.action;
    }
  }

  if (params.stageId) {
    filter['target.stageId'] = params.stageId;
  }

  if (params.pipelineId) {
    filter['target.pipelineId'] = params.pipelineId;
  }

  if (params.boardId) {
    filter['target.boardId'] = params.boardId;
  }

  if (params.number) {
    filter['target.number'] = params.number;
  }

  if (params.description) {
    filter.description = { $regex: params.description, $options: 'i' };
  }

  return filter;
};

export const loadScoreLogClass = (models: IModels, subdomain: string) => {
  class ScoreLog {
    public static async getScoreLog(_id: string) {
      const scoreLog = await models.ScoreLogs.findOne({ _id }).lean();

      if (!scoreLog) {
        throw new Error('not found scoreLog rule');
      }

      return scoreLog;
    }

    public static async getScoreLogs(doc: IScoreLogParams) {
      const { stageId, pipelineId, boardId, number, orderType } = doc;
      const limit = Math.min(Math.max(Number(doc.limit) || 50, 1), 100);
      const direction = doc.direction === 'backward' ? 'backward' : 'forward';
      const logsPerOwner = Math.min(
        Math.max(Number(doc.logsPerOwner) || 5, 1),
        100,
      );
      const orderBy: Record<string, SortOrder> =
        orderType === 'createdAt' ? { createdAt: -1 } : { totalScore: -1 };
      const sortFields = Object.keys(orderBy);
      const sortOrder = {
        ...Object.fromEntries(
          Object.entries(orderBy).map(([field, order]) => [
            field,
            direction === 'forward' ? order : order === 1 ? -1 : 1,
          ]),
        ),
        _id: direction === 'forward' ? 1 : -1,
      };

      const filter = await generateFilter(doc, models, subdomain);

      const filterAggregate: any[] = [];

      if (stageId || pipelineId || boardId || number) {
        const lookup = [
          {
            $lookup: {
              from: 'deals',
              localField: 'targetId',
              foreignField: '_id',
              as: 'target',
            },
          },
          {
            $unwind: '$target',
          },
        ];

        filterAggregate.push(...lookup);
      }

      const basePipeline: any[] = [
        ...filterAggregate,
        {
          $match: { ...filter },
        },
        {
          $sort: { createdAt: -1, _id: -1 },
        },
        {
          $addFields: {
            signedScore: {
              $cond: {
                if: { $eq: ['$action', 'subtract'] },
                then: { $multiply: ['$changeScore', -1] },
                else: '$changeScore',
              },
            },
          },
        },
        {
          $group: {
            _id: '$ownerId',
            ownerType: { $first: '$ownerType' },
            logs: { $push: '$$ROOT' },
            createdAt: { $max: '$createdAt' },
            totalScore: { $sum: '$signedScore' },
          },
        },
      ];

      const cursorMatch = doc.cursor
        ? buildCursorQuery(doc.cursor, orderBy, direction, {
            createdAt: 'date',
            totalScore: 'number',
          })
        : null;

      const listPipeline: any[] = [
        ...basePipeline,
        {
          $project: {
            _id: '$_id',
            ownerId: '$_id',
            ownerType: 1,
            logs: { $slice: ['$logs', logsPerOwner] },
            createdAt: 1,
            totalScore: 1,
          },
        },
        ...(cursorMatch ? [{ $match: cursorMatch }] : []),
        { $sort: sortOrder },
        { $limit: limit + 1 },
      ];

      const [listRaw, countResult] = await Promise.all([
        models.ScoreLogs.aggregate(listPipeline).allowDiskUse(true),
        models.ScoreLogs.aggregate([
          ...basePipeline,
          { $count: 'totalCount' },
        ]).allowDiskUse(true),
      ]);

      const hasMore = listRaw.length > limit;
      let list = hasMore ? listRaw.slice(0, limit) : listRaw;

      if (direction === 'backward') {
        list = list.reverse();
      }

      const pageInfo: PageInfo = {
        hasNextPage: direction === 'forward' ? hasMore : Boolean(doc.cursor),
        hasPreviousPage:
          direction === 'backward' ? hasMore : Boolean(doc.cursor),
        startCursor: list.length > 0 ? encodeCursor(list[0], sortFields) : null,
        endCursor:
          list.length > 0
            ? encodeCursor(list[list.length - 1], sortFields)
            : null,
      };

      return {
        list,
        pageInfo,
        totalCount: countResult[0]?.totalCount || 0,
      };
    }

    public static async getStatistic(doc: IScoreLogParams) {
      const filter = await generateFilter(doc, models, subdomain);

      return scoreStatistic({ doc, models, filter });
    }

    public static async changeOwnersScore(doc: IScoreLog) {
      const {
        ownerType,
        ownerIds,
        changeScore,
        description,
        createdBy = '',
      } = doc;

      const { pluginName, moduleName } = SCORE_OWNER_TYPES[ownerType] || {};

      const score = Number(changeScore);
      const ownerFilter = { _id: { $in: ownerIds } };

      const owners = await sendTRPCMessage({
        subdomain,
        pluginName,
        method: 'query',
        module: moduleName,
        action: `find`,
        input:
          moduleName === 'users'
            ? { query: { ...ownerFilter } }
            : { ...ownerFilter },
        defaultValue: [],
      });

      if (!owners?.length) {
        throw new Error('Not found owners');
      }

      try {
        await sendTRPCMessage({
          subdomain,
          pluginName,
          method: 'mutation',
          module: moduleName,
          action: `updateMany`,
          input: {
            selector: {
              _id: { $in: owners.map((owner) => owner._id) },
            },
            modifier: {
              $inc: { score },
            },
          },
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
        createdBy = '',
        campaignId,
        targetId,
        serviceName,
        amount,
        quantity,
      } = doc;

      const score = Number(changeScore);
      const owner = await getLoyaltyOwner(subdomain, { ownerType, ownerId });

      if (!owner) {
        throw new Error(`not fount ${ownerType}`);
      }

      if (targetId && serviceName) {
        const target = await models.ScoreLogs.exists({
          targetId,
          serviceName,
          action: 'add',
        });

        if (target) {
          throw new Error('Already added loyalty score to this target');
        }
      }

      let ownerScore = 0;
      const campaignFilter: any = {
        status: SCORE_CAMPAIGN_STATUSES.PUBLISHED,
      };
      const usedCustomFieldIds: string[] = [];

      if (campaignId) {
        campaignFilter._id = campaignId;
      }

      const campaigns = await models.ScoreCampaigns.find(campaignFilter).lean();

      if (campaignId && !campaigns?.length) {
        throw new Error('Campaign not found');
      }

      for (const campaign of campaigns) {
        if (!campaign.fieldId || usedCustomFieldIds.includes(campaign.fieldId)) {
          continue;
        }

        usedCustomFieldIds.push(campaign.fieldId);
        const campaignScore = getOwnerFieldScore(owner, campaign.fieldId);

        ownerScore += Number(campaignScore) || 0;
      }

      if (!usedCustomFieldIds.length) {
        ownerScore = Number(owner.score) || 0;
      }

      const newScore = (Number(ownerScore) || 0) + score;

      if (score < 0 && newScore < 0) {
        throw new Error(`score are not enough`);
      }

      const response = await this.updateOwnerScore({
        subdomain,
        owner,
        ownerType,
        newScore,
        score,
        usedCustomFieldIds,
      });

      if (!response || !Object.keys(response || {})?.length) {
        throw new Error('Something went wrong for give score');
      }

      return await models.ScoreLogs.create({
        ownerId,
        ownerType,
        changeScore: Math.abs(score),
        createdAt: new Date(),
        description,
        createdBy,
        campaignId,
        action: score < 0 ? 'subtract' : 'add',
        targetId,
        serviceName,
        amount,
        quantity,
      });
    }

    static async updateOwnerScore({
      subdomain,
      ownerType,
      owner,
      newScore,
      score,
      usedCustomFieldIds,
    }) {
      const updateEntity = async (
        moduleName: string,
        action: string,
        selector: any,
        modifier: any,
      ) =>
        await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: moduleName,
          action,
          input: { selector, modifier },
          defaultValue: null,
        });

      const selector = { _id: owner._id };
      const modifier: any = { $set: { score: newScore } };

      if (usedCustomFieldIds?.length) {
        const updatedPropertiesData = { ...owner.propertiesData };

        if (score > 0) {
          const fieldId = usedCustomFieldIds[0];
          updatedPropertiesData[fieldId] =
            getOwnerFieldScore(owner, fieldId) + score;
        } else {
          let remaining = Math.abs(score);

          for (const fieldId of usedCustomFieldIds) {
            if (!remaining) {
              break;
            }

            const currentValue = getOwnerFieldScore(owner, fieldId);
            const deduct = Math.min(currentValue, remaining);
            updatedPropertiesData[fieldId] = currentValue - deduct;
            remaining -= deduct;
          }

          if (remaining && usedCustomFieldIds[0]) {
            const fieldId = usedCustomFieldIds[0];
            updatedPropertiesData[fieldId] =
              getOwnerFieldScore(owner, fieldId) - remaining;
          }
        }

        modifier.$set.propertiesData = updatedPropertiesData;
        delete modifier.$set.score;
      }

      if (ownerType === 'user') {
        return await updateEntity('users', 'updateOne', selector, modifier);
      }
      if (ownerType === 'customer') {
        return await updateEntity('customers', 'updateMany', selector, modifier);
      }
      if (ownerType === 'company') {
        return await updateEntity('companies', 'updateMany', selector, modifier);
      }
      if (ownerType === 'cpUser') {
        const cpUser = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'cpUsers',
          action: 'get',
          input: {
            id: owner._id,
          },
          defaultValue: null,
        });

        if (!cpUser) {
          throw new Error('Not Found Owner');
        }
        return await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'customers',
          action: 'updateMany',
          input: {
            selector: { _id: cpUser.erxesCustomerId },
            modifier,
          },
          defaultValue: null,
        });
      }
    }
  }

  scoreLogSchema.loadClass(ScoreLog);

  return scoreLogSchema;
};
