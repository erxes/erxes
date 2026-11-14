import { FilterQuery } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IDealDocument } from '@/sales/@types';
import { loyaltyTotals, sumScoreLogs } from './scoreLogSums';

const MAX_PER_PAGE = 50;

export type TDealScoreLog = {
  dealId: string;
  dealName?: string;
  stageId?: string;
  scoreLogId: string;
};

type TPlaced = TDealScoreLog & {
  stageName?: string;
  pipelineId?: string;
  pipelineName?: string;
  boardId?: string;
  boardName?: string;
};

type TPlace = Omit<TPlaced, keyof TDealScoreLog>;

// Where deals stand, by their stage, for lists that span pipelines.
const loadPlaces = async (
  models: IModels,
  stageIds: (string | undefined)[],
): Promise<(stageId?: string) => TPlace> => {
  const stages = await models.Stages.find(
    { _id: { $in: [...new Set(stageIds)] } },
    { _id: 1, name: 1, pipelineId: 1 },
  ).lean();
  const pipelines = await models.Pipelines.find(
    { _id: { $in: [...new Set(stages.map(({ pipelineId }) => pipelineId))] } },
    { _id: 1, name: 1, boardId: 1 },
  ).lean();
  const boards = await models.Boards.find(
    { _id: { $in: [...new Set(pipelines.map(({ boardId }) => boardId))] } },
    { _id: 1, name: 1 },
  ).lean();

  return (stageId) => {
    const stage = stages.find(({ _id }) => _id === stageId);
    const pipeline = pipelines.find(({ _id }) => _id === stage?.pipelineId);
    const board = boards.find(({ _id }) => _id === pipeline?.boardId);

    return {
      stageName: stage?.name,
      pipelineId: pipeline?._id,
      pipelineName: pipeline?.name,
      boardId: board?._id,
      boardName: board?.name,
    };
  };
};

const withPlace = async (
  models: IModels,
  list: TDealScoreLog[],
): Promise<TPlaced[]> => {
  const placeOf = await loadPlaces(
    models,
    list.map(({ stageId }) => stageId),
  );

  return list.map((entry) => ({ ...entry, ...placeOf(entry.stageId) }));
};

/**
 * One page of the loyalty entries the matching deals caused, each deal's
 * entries together and the latest linked first. The points themselves stay
 * in loyalty; callers ask it for this page's ids.
 */
export const dealScoreLogPage = async (
  models: IModels,
  filter: FilterQuery<IDealDocument>,
  page = 1,
  perPage = 20,
  // A drilled sum's entries; the rest of the deals' entries are left out.
  onlyIds?: string[] | null,
) => {
  const limit = Math.min(Math.max(perPage, 1), MAX_PER_PAGE);
  const skip = (Math.max(page, 1) - 1) * limit;

  const [result] = await models.Deals.aggregate<{
    list: TDealScoreLog[];
    total: { count: number }[];
  }>([
    { $match: { ...filter, 'scoreLogIds.0': { $exists: true } } },
    { $unwind: { path: '$scoreLogIds', includeArrayIndex: 'linkedAt' } },
    ...(onlyIds ? [{ $match: { scoreLogIds: { $in: onlyIds } } }] : []),
    { $sort: { createdAt: -1, _id: 1, linkedAt: -1 } },
    {
      $facet: {
        list: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              dealId: '$_id',
              dealName: '$name',
              stageId: 1,
              scoreLogId: '$scoreLogIds',
            },
          },
        ],
        total: [{ $count: 'count' }],
      },
    },
  ]);

  return {
    list: await withPlace(models, result?.list || []),
    totalCount: result?.total[0]?.count || 0,
  };
};

/** Every entry the matching deals link, for loyalty to filter. */
export const dealScoreLogIds = async (
  models: IModels,
  filter: FilterQuery<IDealDocument>,
) =>
  (
    await models.Deals.find(
      { ...filter, 'scoreLogIds.0': { $exists: true } },
      { scoreLogIds: 1 },
    ).lean()
  ).flatMap(({ scoreLogIds }) => scoreLogIds || []);

/**
 * The points the matching deals moved, summed by loyalty over the entries
 * each deal links; sales only groups loyalty's answers by its own fields and
 * keeps none of them.
 */
export const dealScoreLogInsights = async (
  models: IModels,
  subdomain: string,
  filter: FilterQuery<IDealDocument>,
) => {
  const deals = await models.Deals.find(
    { ...filter, 'scoreLogIds.0': { $exists: true } },
    {
      _id: 1,
      name: 1,
      stageId: 1,
      scoreLogIds: 1,
      assignedUserIds: 1,
      branchIds: 1,
    },
  ).lean();
  const rows = await loyaltyTotals(
    subdomain,
    deals.flatMap(({ scoreLogIds }) => scoreLogIds || []),
  );
  const placeOf = await loadPlaces(
    models,
    deals.map(({ stageId }) => stageId),
  );
  const sums = sumScoreLogs(
    deals.map((deal) => {
      const place = placeOf(deal.stageId);

      return {
        id: deal._id,
        name: deal.name,
        group: {
          id: place.pipelineId,
          name: place.pipelineName,
          parentId: place.boardId,
          parentName: place.boardName,
        },
        peopleIds: deal.assignedUserIds || [],
        branchIds: deal.branchIds || [],
      };
    }),
    rows,
  );

  return {
    totals: sums.totals,
    entryCount: sums.entryCount,
    recalculatedEarned: sums.recalculatedEarned,
    recalculatedSpent: sums.recalculatedSpent,
    net: sums.net,
    dealCount: sums.sourceCount,
    customerCount: sums.customerCount,
    topDeals: sums.topSources.map(({ id, name, groupName, earned, net }) => ({
      dealId: id,
      dealName: name,
      pipelineName: groupName,
      earned,
      net,
    })),
    byAssignee: sums.byPeople,
    byBranch: sums.byBranch,
    topEarners: sums.topEarners,
    topSpenders: sums.topSpenders,
    byPipeline: sums.byGroup.map(
      ({ id, name, parentId, parentName, ...line }) => ({
        pipelineId: id,
        pipelineName: name,
        boardId: parentId,
        boardName: parentName,
        ...line,
      }),
    ),
  };
};
