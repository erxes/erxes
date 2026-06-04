import {
  IScoreLog,
  IScoreLogDocument,
  IScoreLogParams,
} from '@/score/@types/scoreLog';
import {
  SCORE_ACTION,
  SCORE_CAMPAIGN_STATUSES,
  SCORE_OWNER_TYPES,
} from '@/score/constants';
import { scoreLogSchema } from '@/score/db/definitions/scoreLog';
import {
  buildSignedScoreExpression,
  fixScoreNumber,
  getOwnerScoreValue,
  prepareScoreLogChange,
  updateOwnerScoreCache,
} from '@/score/services/scoreLedger';
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

export interface IScoreLogModel extends Model<IScoreLogDocument> {
  getScoreLog(_id: string): Promise<IScoreLogDocument>;
  getScoreLogs(doc: IScoreLogParams): Promise<IScoreLogDocument>;
  getOwnerScoreList(doc: IScoreLogParams): Promise<any>;
  getStatistic(doc: IScoreLogParams): Promise<IScoreLogDocument>;
  changeScore(doc: IScoreLog): Promise<IScoreLogDocument | null>;
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

// Score logs reference a deal only by `targetId`; the deal itself (and its
// board/pipeline/stage) lives in the sales service, not in this database. So a
// local `$lookup` on a `deals` collection finds nothing. Instead we ask the
// sales plugin to resolve the matching deal ids and filter score logs by them.
//
// Returns `null` when no deal-based filter is requested, an array of deal ids
// otherwise (possibly empty, meaning "no deal matched → no scores").
const resolveDealTargetIds = async (
  subdomain: string,
  params: IScoreLogParams,
): Promise<string[] | null> => {
  const { boardId, pipelineId, stageId, number } = params;

  if (!boardId && !pipelineId && !stageId && !number) {
    return null;
  }

  const match: Record<string, any> = {};
  if (stageId) match.stageId = stageId;
  if (number) match.number = number;

  const pipeline: any[] = [{ $match: match }];

  if (boardId || pipelineId) {
    pipeline.push(
      {
        $lookup: {
          from: 'sales_stages',
          localField: 'stageId',
          foreignField: '_id',
          as: '_stage',
        },
      },
      { $unwind: '$_stage' },
    );

    if (pipelineId) {
      pipeline.push({ $match: { '_stage.pipelineId': pipelineId } });
    }

    if (boardId) {
      pipeline.push(
        {
          $lookup: {
            from: 'sales_pipelines',
            localField: '_stage.pipelineId',
            foreignField: '_id',
            as: '_pipeline',
          },
        },
        { $unwind: '$_pipeline' },
        { $match: { '_pipeline.boardId': boardId } },
      );
    }
  }

  pipeline.push({ $project: { _id: 1 } });

  const deals = await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    method: 'query',
    module: 'deal',
    action: 'aggregate',
    input: pipeline,
    defaultValue: [],
  });

  return (deals || []).map((deal: any) => deal._id);
};

const getCampaignFieldScores = (owner: any, campaigns: any[]) => {
  const usedCustomFieldIds: string[] = [];
  let ownerScore = 0;

  for (const campaign of campaigns) {
    if (!campaign.fieldId || usedCustomFieldIds.includes(campaign.fieldId)) {
      continue;
    }

    usedCustomFieldIds.push(campaign.fieldId);
    ownerScore += getOwnerScoreValue(owner, campaign.fieldId);
  }

  return {
    usedCustomFieldIds,
    ownerScore: usedCustomFieldIds.length
      ? ownerScore
      : getOwnerScoreValue(owner),
  };
};

const getManualScoreUpdate = ({
  owner,
  score,
  newScore,
  usedCustomFieldIds,
}: {
  owner: any;
  score: number;
  newScore: number;
  usedCustomFieldIds: string[];
}) => {
  if (!usedCustomFieldIds.length) {
    return { updatedScore: newScore };
  }

  const updatedCustomFieldsData = { ...owner?.propertiesData };

  if (score > 0) {
    const fieldId = usedCustomFieldIds[0];
    updatedCustomFieldsData[fieldId] =
      getOwnerScoreValue(owner, fieldId) + score;
  } else {
    let remaining = Math.abs(score);

    for (const fieldId of usedCustomFieldIds) {
      if (!remaining) {
        break;
      }

      const currentValue = getOwnerScoreValue(owner, fieldId);
      const deduct = Math.min(currentValue, remaining);
      updatedCustomFieldsData[fieldId] = currentValue - deduct;
      remaining -= deduct;
    }

    if (remaining && usedCustomFieldIds[0]) {
      const fieldId = usedCustomFieldIds[0];
      updatedCustomFieldsData[fieldId] =
        getOwnerScoreValue(owner, fieldId) - remaining;
    }
  }

  return { updatedCustomFieldsData };
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
      const { stageId, pipelineId, boardId, number } = doc;
      const limit = Math.min(Math.max(Number(doc.limit) || 50, 1), 100);
      const direction = doc.direction === 'backward' ? 'backward' : 'forward';

      const orderBy: Record<string, SortOrder> = { createdAt: -1 };

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
        filterAggregate.push(
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
        );
      }

      // Each score log is returned as an individual row (no per-owner
      // grouping). A single person can therefore appear on multiple rows;
      // their detail is derived on demand from these rows by owner.
      const basePipeline: any[] = [
        ...filterAggregate,
        {
          $match: { ...filter },
        },
      ];

      const cursorMatch = doc.cursor
        ? buildCursorQuery(doc.cursor, orderBy, direction, {
            createdAt: 'date',
          })
        : null;

      const listPipeline: any[] = [
        ...basePipeline,
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

      const ownerKeys = Array.from(
        new Set(
          list
            .filter((l: any) => l.ownerId && l.ownerType)
            .map((l: any) => `${l.ownerType}:${l.ownerId}`),
        ),
      );

      const ownerMap = new Map<string, any>();
      await Promise.all(
        ownerKeys.map(async (key) => {
          const [ownerType, ownerId] = key.split(':');
          const owner = await getLoyaltyOwner(subdomain, {
            ownerType,
            ownerId,
          });
          if (owner) ownerMap.set(key, owner);
        }),
      );

      list = list.map((item: any) => ({
        ...item,
        owner: ownerMap.get(`${item.ownerType}:${item.ownerId}`) || null,
      }));

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

    public static async getOwnerScoreList(doc: IScoreLogParams) {
      const limit = Math.min(Math.max(Number(doc.limit) || 50, 1), 100);
      const direction = doc.direction === 'backward' ? 'backward' : 'forward';

      const orderBy: Record<string, SortOrder> = { createdAt: -1 };

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

      const emptyResult = {
        list: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        } as PageInfo,
        totalCount: 0,
      };

      // The board/pipeline/stage/number filters target a deal that lives in the
      // sales service, so resolve the matching deal ids there and filter score
      // logs by `targetId` instead of joining a (non-existent) local `deals`
      // collection. The remaining filters are applied locally.
      const targetIds = await resolveDealTargetIds(subdomain, doc);

      if (targetIds !== null && targetIds.length === 0) {
        return emptyResult;
      }

      const filter = await generateFilter(
        {
          ...doc,
          boardId: undefined,
          pipelineId: undefined,
          stageId: undefined,
          number: undefined,
        },
        models,
        subdomain,
      );

      if (targetIds !== null) {
        filter.targetId = { $in: targetIds };
        filter.serviceName = 'sales';
      }

      // Collapse the per-transaction score logs into one row per owner: a
      // single person shows up once, carrying their net total score and how
      // many logs back it. The per-transaction breakdown is fetched on demand
      // via `getScoreLogs` (filtered by ownerId) when a row is expanded.
      const basePipeline: any[] = [
        {
          $match: { ...filter },
        },
        // Sort newest-first before grouping so `$first` picks each owner's most
        // recent log for the Date/Type columns shown on the main list.
        { $sort: { createdAt: -1, _id: -1 } },
        {
          $group: {
            _id: { ownerType: '$ownerType', ownerId: '$ownerId' },
            totalScore: { $sum: buildSignedScoreExpression() },
            createdAt: { $first: '$createdAt' },
            action: { $first: '$action' },
            logCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: {
              $concat: [
                { $ifNull: ['$_id.ownerType', ''] },
                ':',
                { $ifNull: ['$_id.ownerId', ''] },
              ],
            },
            ownerType: '$_id.ownerType',
            ownerId: '$_id.ownerId',
            totalScore: 1,
            createdAt: 1,
            action: 1,
            logCount: 1,
          },
        },
      ];

      const cursorMatch = doc.cursor
        ? buildCursorQuery(doc.cursor, orderBy, direction, {
            createdAt: 'date',
          })
        : null;

      const listPipeline: any[] = [
        ...basePipeline,
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

      const ownerKeys = Array.from(
        new Set(
          list
            .filter((l: any) => l.ownerId && l.ownerType)
            .map((l: any) => `${l.ownerType}:${l.ownerId}`),
        ),
      );

      const ownerMap = new Map<string, any>();
      await Promise.all(
        ownerKeys.map(async (key) => {
          const [ownerType, ownerId] = key.split(':');
          const owner = await getLoyaltyOwner(subdomain, {
            ownerType,
            ownerId,
          });
          if (owner) ownerMap.set(key, owner);
        }),
      );

      list = list.map((item: any) => ({
        ...item,
        owner: ownerMap.get(`${item.ownerType}:${item.ownerId}`) || null,
      }));

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
      // Same cross-service rule as getOwnerScoreList: board/pipeline/stage/number
      // filter a deal owned by the sales service, so resolve the matching deal
      // ids there and filter score logs by `targetId`. Stripping these fields
      // from the doc also stops the statistic helpers from attempting their
      // own (empty) local `deals` lookup.
      const targetIds = await resolveDealTargetIds(subdomain, doc);

      const cleanDoc = {
        ...doc,
        boardId: undefined,
        pipelineId: undefined,
        stageId: undefined,
        number: undefined,
      };

      const filter = await generateFilter(cleanDoc, models, subdomain);

      if (targetIds !== null) {
        filter.targetId = { $in: targetIds };
        filter.serviceName = 'sales';
      }

      return scoreStatistic({ doc: cleanDoc, models, filter });
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

      const score = fixScoreNumber(Number(changeScore));
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
        changeScore: fixScoreNumber(score),
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
        action,
        amount,
        quantity,
      } = doc;

      let score = fixScoreNumber(Number(changeScore));
      const scoreAction =
        action || (score < 0 ? SCORE_ACTION.SUBTRACT : SCORE_ACTION.ADD);
      const owner = await getLoyaltyOwner(subdomain, { ownerType, ownerId });

      if (!owner) {
        throw new Error(`not fount ${ownerType}`);
      }

      if (targetId && serviceName) {
        const target = await models.ScoreLogs.exists({
          targetId,
          serviceName,
          action: scoreAction,
        });

        if (target) {
          throw new Error('Already added loyalty score to this target');
        }
      }

      const campaignFilter: any = {
        status: SCORE_CAMPAIGN_STATUSES.PUBLISHED,
      };

      if (campaignId) {
        campaignFilter._id = campaignId;
      }

      const campaigns = await models.ScoreCampaigns.find(campaignFilter).lean();

      if (campaignId && !campaigns?.length) {
        throw new Error('Campaign not found');
      }

      const { ownerScore, usedCustomFieldIds } = getCampaignFieldScores(
        owner,
        campaigns,
      );

      if (scoreAction === SCORE_ACTION.SET) {
        score = fixScoreNumber(score - (Number(ownerScore) || 0));

        if (score === 0) {
          return null;
        }
      }

      const newScore = fixScoreNumber((Number(ownerScore) || 0) + score);

      if (score < 0 && newScore < 0) {
        throw new Error(`score are not enough`);
      }

      const response = await updateOwnerScoreCache({
        subdomain,
        ownerId: owner._id,
        ownerType,
        ...getManualScoreUpdate({
          owner,
          score,
          newScore,
          usedCustomFieldIds,
        }),
      });

      if (!response || !Object.keys(response || {})?.length) {
        throw new Error('Something went wrong for give score');
      }

      const preparedChange = prepareScoreLogChange({
        action: scoreAction as any,
        signedChangeScore: score,
      });

      return await models.ScoreLogs.create({
        ownerId,
        ownerType,
        changeScore: preparedChange.changeScore,
        createdAt: new Date(),
        description,
        createdBy,
        campaignId,
        action: preparedChange.action,
        targetId,
        serviceName,
        amount,
        quantity,
      });
    }
  }

  scoreLogSchema.loadClass(ScoreLog);

  return scoreLogSchema;
};
