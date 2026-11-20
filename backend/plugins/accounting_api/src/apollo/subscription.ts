import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { withFilter } from 'graphql-subscriptions';

const getChangedDocs = (change) => {
  const {
    transaction,
    oldTransaction,
    transactions = [],
    oldTransactions = [],
  } = change || {};

  return [
    transaction,
    oldTransaction,
    ...transactions,
    ...oldTransactions,
  ].filter((tr) => tr?._id);
};

const getChangedTrIds = (change, filter) => {
  const trIds = [
    ...new Set(getChangedDocs(change).map((tr) => String(tr._id))),
  ];

  const filterIds = Array.isArray(filter?.ids) ? filter.ids : [];

  if (!filterIds.length) {
    return trIds;
  }

  return trIds.filter(
    (trId) => filterIds.includes(trId) !== Boolean(filter.excludeIds),
  );
};

const getChangedJournals = (change) => {
  const journals = {};

  for (const tr of getChangedDocs(change)) {
    if (!tr.journal) {
      continue;
    }

    const trId = String(tr._id);
    journals[trId] = [
      ...new Set([...(journals[trId] || []), String(tr.journal)]),
    ];
  }

  return journals;
};

const matchesListFilter = async (payload, variables, context) => {
  const user = context?.user;

  if (!user?._id) {
    return false;
  }

  const {
    transaction,
    oldTransaction,
    transactions = [],
    oldTransactions = [],
  } = payload.accountingTransactionChanged || {};

  const matches = await sendTRPCMessage({
    subdomain: context.subdomain,
    pluginName: 'accounting',
    module: 'accountingTransaction',
    action: 'getFilterMatches',
    input: {
      filter: variables?.filter,
      oldTransaction,
      oldTransactions,
      transaction,
      transactions,
      userId: user._id,
    },
    defaultValue: null,
  });

  if (!matches) {
    return true;
  }

  return Boolean(matches.matchesOld || matches.matchesNew);
};

const resolveChangedRows = (list) => async (payload, variables, context) => {
  const filter = variables?.filter;
  const change = payload.accountingTransactionChanged || {};
  const trIds = getChangedTrIds(change, filter);

  if (!trIds.length) {
    return { trIds, list: [], hasMore: false, totalCount: null };
  }

  const rows = await sendTRPCMessage({
    subdomain: context?.subdomain,
    pluginName: 'accounting',
    module: 'accountingTransaction',
    action: 'getListChangeRows',
    input: {
      filter,
      list,
      trIds,
      trJournals: getChangedJournals(change),
      userId: context?.user?._id,
    },
    defaultValue: null,
  });

  if (
    !Array.isArray(rows?.list) ||
    !Array.isArray(rows.trIds) ||
    rows.hasMore
  ) {
    return { trIds: [], list: [], hasMore: true, totalCount: null };
  }

  return {
    trIds: rows.trIds,
    list: rows.list,
    hasMore: false,
    totalCount: rows.totalCount ?? null,
  };
};

export default {
  name: 'accounting',
  typeDefs: `
    accountingAdjustInventoryChanged(adjustId: String!): AdjustInventory
    accountingAdjustFixedAssetChanged(adjustId: String!): AdjustFixedAsset
    accountingAdjustFundRateChanged(adjustId: String!): AdjustFundRate
    accountingAdjustDebtRateChanged(adjustId: String!): AdjustDebtRate
    accountingTransactionChanged(parentId: String, userId: String, filter: JSON): JSON
    accountingTransactionsListChanged(filter: JSON): AccTransactionsListChange
    accountingTrRecordsListChanged(filter: JSON): AccTrRecordsListChange
  `,
  generateResolvers: (graphqlPubsub) => {
    const listenTenantTransactions = (_root, _args, context) =>
      graphqlPubsub.asyncIterator(
        `accountingTransactionChanged:${context.subdomain}`,
      );

    return {
      accountingAdjustInventoryChanged: {
        subscribe: (_, { adjustId }, { subdomain }) =>
          graphqlPubsub.asyncIterator(
            `accountingAdjustInventoryChanged:${subdomain}:${adjustId}`,
          ),
      },
      accountingAdjustFixedAssetChanged: {
        subscribe: (_, { adjustId }, { subdomain }) =>
          graphqlPubsub.asyncIterator(
            `accountingAdjustFixedAssetChanged:${subdomain}:${adjustId}`,
          ),
      },
      accountingAdjustFundRateChanged: {
        subscribe: (_, { adjustId }, { subdomain }) =>
          graphqlPubsub.asyncIterator(
            `accountingAdjustFundRateChanged:${subdomain}:${adjustId}`,
          ),
      },
      accountingAdjustDebtRateChanged: {
        subscribe: (_, { adjustId }, { subdomain }) =>
          graphqlPubsub.asyncIterator(
            `accountingAdjustDebtRateChanged:${subdomain}:${adjustId}`,
          ),
      },
      accountingTransactionChanged: {
        subscribe: withFilter(
          (_root, { parentId }, { subdomain }) => {
            if (parentId) {
              return graphqlPubsub.asyncIterator(
                `accountingTransactionChanged:${subdomain}:${parentId}`,
              );
            }

            return graphqlPubsub.asyncIterator(
              `accountingTransactionChanged:${subdomain}`,
            );
          },
          async (payload, variables, { subdomain }) => {
            const { parentId, userId, filter } = variables;

            if (parentId) {
              return true;
            }

            if (!userId) {
              return false;
            }

            const {
              transaction,
              oldTransaction,
              transactions = [],
              oldTransactions = [],
            } = payload.accountingTransactionChanged || {};

            const matchesResponse = await sendTRPCMessage({
              subdomain,
              pluginName: 'accounting',
              module: 'accountingTransaction',
              action: 'getFilterMatches',
              input: {
                filter,
                oldTransaction,
                oldTransactions,
                transaction,
                transactions,
                userId,
              },
            });

            const { matchesOld, matchesNew } = matchesResponse || {};

            if (!matchesOld && !matchesNew) {
              return false;
            }

            payload.matches = { matchesOld, matchesNew };
            return true;
          },
        ),
        resolve: (payload) => {
          const { matchesOld, matchesNew } = payload.matches || {};

          if (matchesOld === undefined && matchesNew === undefined) {
            return payload.accountingTransactionChanged;
          }

          if (matchesOld && !matchesNew) {
            return {
              ...payload.accountingTransactionChanged,
              action: 'remove',
            };
          }

          if (!matchesOld && matchesNew) {
            return { ...payload.accountingTransactionChanged, action: 'add' };
          }

          return { ...payload.accountingTransactionChanged, action: 'edit' };
        },
      },
      accountingTransactionsListChanged: {
        subscribe: withFilter(listenTenantTransactions, matchesListFilter),
        resolve: resolveChangedRows('transactions'),
      },
      accountingTrRecordsListChanged: {
        subscribe: withFilter(listenTenantTransactions, matchesListFilter),
        resolve: resolveChangedRows('trRecords'),
      },
    };
  },
};
