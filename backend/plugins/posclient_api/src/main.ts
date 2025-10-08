import { typeDefs } from './apollo/typeDefs';
import { appRouter } from './init-trpc';

import { startPlugin } from 'erxes-api-shared/utils';
import resolvers from './apollo/resolvers';
import { generateModels } from './connectionResolvers';
import { router } from '~/routes';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import posUserMiddleware from './userMiddleware';
import posConfigMiddleware from './configMiddleware';

startPlugin({
  name: 'posclient',
  port: 3321,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers: resolvers,
  }),
  // hasSubscriptions: true,
  // subscriptionPluginPath: require('path').resolve(
  //   __dirname,
  //   'apollo',
  //   process.env.NODE_ENV === 'production'
  //     ? 'subscription.js'
  //     : 'subscription.ts',
  // ),
  expressRouter: router,

  apolloServerContext: async (subdomain, context, req: any, res) => {
    const requestInfo = {
      secure: req.secure,
      cookies: req.cookies,
      headers: req.headers,
    };

    const models = await generateModels(subdomain);

    context.subdomain = subdomain;
    context.models = models;

    context.requestInfo = requestInfo;
    context.res = res;

    context.config = {};

    if (req?.posConfig?._id) {
      context.config = req.posConfig;
    } else {
      if (models) {
        if (
          (await models.Configs.find({
            status: { $ne: 'deleted' },
          }).countDocuments()) === 1
        ) {
          context.config = await models.Configs.findOne({
            status: { $ne: 'deleted' },
          }).lean();
        }
      }
    }

    if (req.posUser) {
      context.posUser = req.posUser;
    }

    return context;
  },
  middlewares: [
    cookieParser(),
    posUserMiddleware,
    posConfigMiddleware,
    cors({
      credentials: true,
      origin: [
        ...(process.env.ALLOWED_ORIGINS || '')
          .split(',')
          .map((c) => c && RegExp(c)),
      ],
    }),
  ],
  trpcAppRouter: {
    router: appRouter,
    createContext: async (subdomain, context) => {
      const models = await generateModels(subdomain);

      context.models = models;

      return context;
    },
  },
});
