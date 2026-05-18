import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { withFilter } from 'graphql-subscriptions';

export default {
  name: 'accounting',
  typeDefs: `
				accountingAdjustInventoryChanged(adjustId: String!): AdjustInventory
      accountingTransactionChanged(parentId: String, userId: String, filter: JSON): JSON
			`,
  generateResolvers: (graphqlPubsub) => {
    return {
      /*
       * Listen for conversation changes like status, assignee, read state
       */
      accountingAdjustInventoryChanged: {
        subscribe: (_, { adjustId }) =>
          graphqlPubsub.asyncIterator(
            `accountingAdjustInventoryChanged:${adjustId}`,
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
    };
  },
};
