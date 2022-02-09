import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import apiConnect from './apiCollections';

import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import { initBroker } from './messageBroker';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';

export let graphqlPubsub;

export let es: {
  client;
  fetchElk(args: IFetchElkArgs): Promise<any>;
  getMappings(index: string): Promise<any>;
  getIndexPrefix(): string;
};

export let debug;

export default {
  name: 'logs',
  graphql: () => ({
    typeDefs,
    resolvers,
  }),
  hasSubscriptions: false,
  segment: {},
  apolloServerContext: (context) => {},
  onServerInit: async (options) => {
    await apiConnect();

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;

    const { app } = options;

    app.get(
      '/activityLogs',
      routeErrorHandling(async (req, res) => {
        const filter: {
          contentType?: string;
          contentId?: any;
          action?: string;
          perPage?: number;
          page?: number;
        } = JSON.parse(req.body.params || '{}');
    
        if (filter.page && filter.perPage) {
          const perPage = filter.perPage || 20;
          const page = filter.page || 1;
    
          delete filter.perPage;
          delete filter.page;
    
          return res.json({
            activityLogs: await ActivityLogs.find(filter)
              .sort({
                createdAt: -1
              })
              .skip(perPage * (page - 1))
              .limit(perPage),
            totalCount: await ActivityLogs.countDocuments(filter)
          });
        }
    
        return res.json(
          await ActivityLogs.find(filter).sort({
            createdAt: -1
          })
        );
      })
    );
  },
};