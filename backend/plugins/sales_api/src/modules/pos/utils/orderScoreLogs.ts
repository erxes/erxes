import { FilterQuery } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IPosOrderDocument } from '@/pos/@types/orders';
import { loyaltyTotals, sumScoreLogs } from '@/sales/utils/scoreLogSums';
import {
  scoreLogTimeline,
  TTimelineInterval,
} from '@/sales/utils/dealScoreLogTimeline';

const MAX_PER_PAGE = 50;

type TOrderScoreLog = {
  orderId: string;
  orderNumber?: string;
  posToken?: string;
  branchId?: string;
  scoreLogId: string;
};

// The POS each order was rung up at, by its token.
const loadPoses = async (models: IModels, tokens: (string | undefined)[]) => {
  const poses = await models.Pos.find(
    { token: { $in: [...new Set(tokens)] } },
    { _id: 1, name: 1, token: 1 },
  ).lean();

  return (token?: string) => poses.find((pos) => pos.token === token);
};

const linked = (filter: FilterQuery<IPosOrderDocument>) => ({
  ...filter,
  'scoreLogIds.0': { $exists: true },
});

/**
 * One page of the loyalty entries the matching orders caused, each order's
 * entries together and the latest linked first. The points themselves stay
 * in loyalty; callers ask it for this page's ids.
 */
export const posOrderScoreLogPage = async (
  models: IModels,
  filter: FilterQuery<IPosOrderDocument>,
  page = 1,
  perPage = 20,
  // A drilled sum's entries; the rest of the orders' entries are left out.
  onlyIds?: string[] | null,
) => {
  const limit = Math.min(Math.max(perPage, 1), MAX_PER_PAGE);
  const skip = (Math.max(page, 1) - 1) * limit;

  const [result] = await models.PosOrders.aggregate<{
    list: TOrderScoreLog[];
    total: { count: number }[];
  }>([
    { $match: linked(filter) },
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
              orderId: '$_id',
              orderNumber: '$number',
              posToken: 1,
              branchId: 1,
              scoreLogId: '$scoreLogIds',
            },
          },
        ],
        total: [{ $count: 'count' }],
      },
    },
  ]);
  const list = result?.list || [];
  const posOf = await loadPoses(
    models,
    list.map(({ posToken }) => posToken),
  );

  return {
    list: list.map(({ posToken, ...entry }) => {
      const pos = posOf(posToken);

      return { ...entry, posId: pos?._id, posName: pos?.name };
    }),
    totalCount: result?.total[0]?.count || 0,
  };
};

/** Every entry the matching orders link, for loyalty to filter. */
export const posOrderScoreLogIds = async (
  models: IModels,
  filter: FilterQuery<IPosOrderDocument>,
) =>
  (
    await models.PosOrders.find(linked(filter), { scoreLogIds: 1 }).lean()
  ).flatMap(({ scoreLogIds }) => scoreLogIds || []);

/**
 * The points the matching orders moved, summed by loyalty over the entries
 * each order links: by POS, cashier, branch, customer and order.
 */
export const posOrderScoreLogInsights = async (
  models: IModels,
  subdomain: string,
  filter: FilterQuery<IPosOrderDocument>,
) => {
  const orders = await models.PosOrders.find(linked(filter), {
    _id: 1,
    number: 1,
    posToken: 1,
    userId: 1,
    branchId: 1,
    scoreLogIds: 1,
  }).lean();
  const rows = await loyaltyTotals(
    subdomain,
    orders.flatMap(({ scoreLogIds }) => scoreLogIds || []),
  );
  const posOf = await loadPoses(
    models,
    orders.map(({ posToken }) => posToken),
  );
  const sums = sumScoreLogs(
    orders.map((order) => {
      const pos = posOf(order.posToken);

      return {
        id: order._id,
        name: order.number,
        group: { id: pos?._id, name: pos?.name },
        peopleIds: order.userId ? [order.userId] : [],
        branchIds: order.branchId ? [order.branchId] : [],
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
    orderCount: sums.sourceCount,
    customerCount: sums.customerCount,
    topOrders: sums.topSources.map(({ id, name, groupName, earned, net }) => ({
      orderId: id,
      orderNumber: name,
      posName: groupName,
      earned,
      net,
    })),
    byCashier: sums.byPeople,
    byBranch: sums.byBranch,
    topEarners: sums.topEarners,
    topSpenders: sums.topSpenders,
    byPos: sums.byGroup.map((line) => ({
      posId: line.id,
      posName: line.name,
      earned: line.earned,
      spent: line.spent,
      refunded: line.refunded,
      other: line.other,
      recalculated: line.recalculated,
      net: line.net,
    })),
  };
};

/** What those entries moved per period. */
export const posOrderScoreLogTimeline = async (
  models: IModels,
  subdomain: string,
  filter: FilterQuery<IPosOrderDocument>,
  interval: TTimelineInterval,
  timezone: string,
) => {
  const orders = await models.PosOrders.find(linked(filter), {
    _id: 1,
    scoreLogIds: 1,
  }).lean();

  return scoreLogTimeline(
    subdomain,
    orders.flatMap(({ scoreLogIds }) => scoreLogIds || []),
    interval,
    timezone,
  );
};
