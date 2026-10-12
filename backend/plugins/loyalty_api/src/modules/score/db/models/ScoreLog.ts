import {
  IRepairOwnerScoreParams,
  IRepairOwnerScoreResult,
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
  calculateScoreValueFromLogs,
  applyScoreChange,
  fixScoreNumber,
  resolveBalanceOwner,
  updateOwnerScoreCache,
} from '@/score/services/scoreLedger';
import { scoreStatistic } from '@/score/utils';
import {
  buildCursorQuery,
  encodeCursor,
  PageInfo,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { Model, SortOrder } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils';

const MAX_TARGET_TOTALS = 500;

export interface IScoreLogModel extends Model<IScoreLogDocument> {
  getScoreLog(_id: string): Promise<IScoreLogDocument>;
  getScoreLogs(doc: IScoreLogParams): Promise<IScoreLogDocument>;
  getStatistic(doc: IScoreLogParams): Promise<IScoreLogDocument>;
  getTargetTotals(
    targetIds: string[],
  ): Promise<{ targetId: string; total: number }[]>;
  changeScore(doc: IScoreLog): Promise<IScoreLogDocument | null>;
  changeOwnersScore(doc): Promise<IScoreLogDocument[]>;
  repairOwnerScore(
    doc: IRepairOwnerScoreParams,
  ): Promise<IRepairOwnerScoreResult>;
  recordActivity(args: {
    log: IScoreLogDocument;
    actorId?: string;
    changeScore: number;
    previousScore: number;
    newScore: number;
    walletName?: string;
  }): Promise<void>;
}

// Said by whoever the entry is recorded under: the automation's owner, the
// cashier, the wallet's creator for a period run.
const describeScoreChange = ({
  action,
  change,
  previous,
  next,
  walletName,
}: {
  action: string;
  change: number;
  previous: number;
  next: number;
  walletName?: string;
}) => {
  const points = Math.abs(change);
  const wallet = walletName || 'the score';
  const balance = `(${previous} → ${next})`;

  switch (action) {
    case SCORE_ACTION.ADD:
      return `added ${points} points to ${wallet} ${balance}`;
    case SCORE_ACTION.SUBTRACT:
      return `took ${points} points from ${wallet} for a payment ${balance}`;
    case SCORE_ACTION.EXPIRE:
      return `expired ${points} points in ${wallet} ${balance}`;
    case SCORE_ACTION.SET:
      return `reset ${wallet} ${balance}`;
    default:
      // A refund's sign tells what it undoes: a payment comes back, an
      // earning is taken back.
      return change >= 0
        ? `returned ${points} points paid with ${wallet} ${balance}`
        : `took back ${points} points earned in ${wallet} ${balance}`;
  }
};

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

  // Everything one record (a deal, an order) moved, across owners.
  if (params.targetId) {
    filter.targetId = params.targetId;
  }

  if (params.action) {
    const refundedTargetIds = await models.ScoreLogs.distinct('targetId', {
      action: { $in: ['refund', 'return'] },
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

  if (params.description) {
    filter.description = { $regex: params.description, $options: 'i' };
  }

  return filter;
};

type ScoreCampaignScoreTarget = {
  _id: string;
  fieldId?: string;
};

const getScoreLogBalance = async (
  models: IModels,
  filter: Record<string, unknown>,
) => {
  const logs = await models.ScoreLogs.find(filter)
    .sort({ createdAt: 1, _id: 1 })
    .lean();

  return calculateScoreValueFromLogs(logs);
};

const addGroupedCampaignId = (
  fieldCampaignIds: Map<string, string[]>,
  fieldId: string,
  campaignId: string,
) => {
  fieldCampaignIds.set(fieldId, [
    ...(fieldCampaignIds.get(fieldId) || []),
    campaignId,
  ]);
};

export const loadScoreLogClass = (
  models: IModels,
  subdomain: string,
  { createActivityLog }: EventDispatcherReturn,
) => {
  class ScoreLog {
    /**
     * Tells the owner's timeline, and the record the points came from, that
     * the balance moved. Written without an actor it is dropped by core, so
     * only changes someone answers for appear.
     */
    public static async recordActivity({
      log,
      actorId = log.createdBy || log.createdVia?.actorId,
      changeScore,
      previousScore,
      newScore,
      walletName,
    }: {
      log: IScoreLogDocument;
      actorId?: string;
      changeScore: number;
      previousScore: number;
      newScore: number;
      walletName?: string;
    }) {
      if (!changeScore || !actorId) {
        return;
      }

      const action = log.action || SCORE_ACTION.ADD;
      const activityType = `loyalty.score.${action}`;
      const description = describeScoreChange({
        action,
        change: changeScore,
        previous: previousScore,
        next: newScore,
        walletName,
      });
      const changes = {
        points: changeScore,
        balance: { prev: previousScore, current: newScore },
        wallet: walletName,
      };
      const metadata = {
        scoreLogId: log._id,
        campaignId: log.campaignId,
        accountTypeId: log.accountTypeId,
        targetId: log.targetId,
        targetType: log.targetType,
      };
      const { recordId } = await resolveBalanceOwner(
        subdomain,
        log.ownerType || '',
        log.ownerId || '',
      );

      createActivityLog(
        [
          {
            activityType,
            target: { _id: recordId, createdVia: log.createdVia },
            action: { type: activityType, description },
            changes,
            metadata: { ...metadata, ownerType: log.ownerType },
          },
          ...(log.targetId && log.targetType
            ? [
                {
                  activityType,
                  target: { _id: log.targetId, createdVia: log.createdVia },
                  action: {
                    type: activityType,
                    description: `${description} of the ${log.ownerType}`,
                  },
                  changes,
                  metadata: {
                    ...metadata,
                    ownerType: log.ownerType,
                    ownerId: recordId,
                  },
                },
              ]
            : []),
        ],
        actorId,
      );
    }

    public static async getScoreLog(_id: string) {
      const scoreLog = await models.ScoreLogs.findOne({ _id }).lean();

      if (!scoreLog) {
        throw new Error('not found scoreLog rule');
      }

      return scoreLog;
    }

    public static async getScoreLogs(doc: IScoreLogParams) {
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

      // Each score log is returned as an individual row (no per-owner
      // grouping). A single person can therefore appear on multiple rows;
      // their detail is derived on demand from these rows by owner.
      const basePipeline: any[] = [
        {
          $match: { ...filter },
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

    // One page of a source's list at a time; a record moving nothing is left
    // out, so the caller shows nothing for it.
    public static async getTargetTotals(targetIds: string[]) {
      const ids = [...new Set(targetIds)].slice(0, MAX_TARGET_TOTALS);

      if (!ids.length) {
        return [];
      }

      const totals = await models.ScoreLogs.aggregate<{
        _id: string;
        total: number;
      }>([
        { $match: { targetId: { $in: ids } } },
        { $group: { _id: '$targetId', total: { $sum: '$changeScore' } } },
      ]);

      return totals.map(({ _id, total }) => ({
        targetId: _id,
        total: fixScoreNumber(total),
      }));
    }

    public static async getStatistic(doc: IScoreLogParams) {
      const filter = await generateFilter(doc, models, subdomain);

      return scoreStatistic({ models, filter });
    }

    public static async changeOwnersScore(doc: IScoreLog) {
      const {
        ownerType,
        ownerIds,
        changeScore,
        description,
        createdBy = '',
        action,
        campaignId,
        targetId,
        serviceName,
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

      const results = await Promise.all(
        owners.map((owner) =>
          applyScoreChange({
            models,
            subdomain,
            doc: {
              owner,
              ownerType,
              ownerId: owner._id,
              campaignId,
              targetId,
              serviceName,
              action: action as any,
              changeScore: score,
              description,
              createdBy,
            },
          }),
        ),
      );

      return results.map(({ log }) => log);
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
      } = doc;

      const score = fixScoreNumber(Number(changeScore));
      const scoreAction =
        action || (score < 0 ? SCORE_ACTION.SUBTRACT : SCORE_ACTION.ADD);

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

      if (campaignId) {
        const campaign = await models.ScoreCampaigns.findOne({
          _id: campaignId,
          status: SCORE_CAMPAIGN_STATUSES.PUBLISHED,
        }).lean();

        if (!campaign) {
          throw new Error('Campaign not found');
        }
      }

      const { log } = await applyScoreChange({
        models,
        subdomain,
        doc: {
          ownerType,
          ownerId,
          campaignId,
          targetId,
          serviceName,
          action: scoreAction as any,
          changeScore: score,
          description,
          createdBy,
        },
      });

      return log;
    }

    public static async repairOwnerScore({
      ownerType,
      ownerId,
    }: IRepairOwnerScoreParams) {
      const owner = await getLoyaltyOwner(subdomain, { ownerType, ownerId });

      if (!owner) {
        throw new Error(`Owner not found: ${ownerType}`);
      }

      const baseFilter = { ownerType, ownerId };
      const loggedCampaignIds = await models.ScoreLogs.distinct('campaignId', {
        ...baseFilter,
        campaignId: { $exists: true, $nin: [null, ''] },
      });
      const campaigns = await models.ScoreCampaigns.find({
        _id: { $in: loggedCampaignIds },
      })
        .select('_id fieldId')
        .lean<ScoreCampaignScoreTarget[]>();
      const campaignFieldIds = new Map(
        campaigns.map((campaign) => [String(campaign._id), campaign.fieldId]),
      );
      const fieldCampaignIds = new Map<string, string[]>();
      const defaultCampaignIds: string[] = [];

      for (const campaignId of loggedCampaignIds.map(String)) {
        const fieldId = campaignFieldIds.get(campaignId);

        if (fieldId) {
          addGroupedCampaignId(fieldCampaignIds, fieldId, campaignId);
          continue;
        }

        defaultCampaignIds.push(campaignId);
      }

      const updatedCustomFieldsData: Record<string, number> = {};
      const fieldScores: IRepairOwnerScoreResult['fieldScores'] = [];
      // Campaign-less entries of an account type (period resets) count too.
      const loggedAccountTypeIds = await models.ScoreLogs.distinct(
        'accountTypeId',
        {
          ...baseFilter,
          campaignId: { $in: [null, ''] },
          accountTypeId: { $nin: [null, ''] },
        },
      );
      const accountTypes = await models.LoyaltyAccountTypes.find({
        $or: [
          { fieldId: { $in: [...fieldCampaignIds.keys()] } },
          { _id: { $in: loggedAccountTypeIds } },
        ],
      })
        .select('_id fieldId')
        .lean();
      const accountTypeIds = new Map<string, string>();

      for (const { _id, fieldId } of accountTypes) {
        if (!fieldId) {
          continue;
        }

        accountTypeIds.set(fieldId, _id);

        if (!fieldCampaignIds.has(fieldId)) {
          fieldCampaignIds.set(fieldId, []);
        }
      }

      for (const [fieldId, campaignIds] of fieldCampaignIds.entries()) {
        const accountTypeId = accountTypeIds.get(fieldId);
        const score = await getScoreLogBalance(models, {
          ...baseFilter,
          $or: [
            { campaignId: { $in: campaignIds } },
            ...(accountTypeId
              ? [{ accountTypeId, campaignId: { $in: [null, ''] } }]
              : []),
          ],
        });

        updatedCustomFieldsData[fieldId] = score;
        fieldScores.push({ fieldId, score, campaignIds });
      }

      const noCampaignFilter = {
        ...baseFilter,
        accountTypeId: { $in: [null, ''] },
        $or: [
          { campaignId: { $exists: false } },
          { campaignId: null },
          { campaignId: '' },
        ],
      };
      const noCampaignLogCount = await models.ScoreLogs.countDocuments(
        noCampaignFilter,
      );
      const shouldUpdateDefaultScore =
        defaultCampaignIds.length > 0 || noCampaignLogCount > 0;
      const updatedScore = shouldUpdateDefaultScore
        ? await getScoreLogBalance(models, {
            ...baseFilter,
            accountTypeId: noCampaignFilter.accountTypeId,
            ...(defaultCampaignIds.length
              ? {
                  $or: [
                    { campaignId: { $in: defaultCampaignIds } },
                    ...noCampaignFilter.$or,
                  ],
                }
              : { $or: noCampaignFilter.$or }),
          })
        : undefined;

      const updatedCustomFieldPayload = fieldScores.length
        ? updatedCustomFieldsData
        : undefined;

      await updateOwnerScoreCache({
        models,
        subdomain,
        ownerId,
        ownerType,
        updatedScore,
        updatedCustomFieldsData: updatedCustomFieldPayload,
      });

      return {
        ownerType,
        ownerId,
        updatedScore,
        updatedCustomFieldsData: updatedCustomFieldPayload,
        fieldScores,
      };
    }
  }

  scoreLogSchema.loadClass(ScoreLog);

  return scoreLogSchema;
};
