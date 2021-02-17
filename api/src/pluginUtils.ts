import { withFilter } from 'apollo-server-express';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import * as path from 'path';
import { ILogDataParams } from './data/logUtils';
import { can, registerModule } from './data/permissions/utils';
import { checkLogin } from './data/permissions/wrappers';
import * as allModels from './db/models';
import { IUserDocument } from './db/models/definitions/users';
import { field } from './db/models/definitions/utils';
import { debugError } from './debuggers';
import memoryStorage from './inmemoryStorage';
import messageBroker from './messageBroker';
import { graphqlPubsub } from './pubsub';

interface ISubAfterMutations {
  [action: string]: {
    callBack: void;
  };
}
interface IAfterMutations {
  [type: string]: ISubAfterMutations[];
}

const callAfterMutations: IAfterMutations[] | {} = {};
const pluginsConsumers = {};

const tryRequire = requirPath => {
  try {
    return require(`${requirPath}`);
  } catch (err) {
    debugError(err.message);
    return {};
  }
};

export const execInEveryPlugin = callback => {
  const pluginsPath = path.resolve(
    __dirname,
    process.env.NODE_ENV === 'production' ? './plugins' : '../../plugins'
  );

  if (fs.existsSync(pluginsPath)) {
    fs.readdir(pluginsPath, (_error, plugins) => {
      const pluginsCount = plugins.length;

      plugins.forEach((plugin, index) => {
        let routes = [];
        let msgBrokers = [];
        let models = [];
        let graphqlQueries = [];
        let graphqlResolvers = [];
        let graphqlMutations = [];
        let graphqlSubscriptions = [];
        let afterMutations = [];
        let constants = {};

        const graphqlSchema = {
          types: '',
          queries: '',
          mutations: '',
          subscriptions: ''
        };

        const ext = process.env.NODE_ENV === 'production' ? 'js' : 'ts';

        const permissionsPath = `${pluginsPath}/${plugin}/api/permissions.${ext}`;
        const routesPath = `${pluginsPath}/${plugin}/api/routes.${ext}`;
        const msgBrokersPath = `${pluginsPath}/${plugin}/api/messageBrokers.${ext}`;
        const graphqlSchemaPath = `${pluginsPath}/${plugin}/api/graphql/schema.${ext}`;
        const graphqlQueriesPath = `${pluginsPath}/${plugin}/api/graphql/queries.${ext}`;
        const graphqlResolversPath = `${pluginsPath}/${plugin}/api/graphql/resolvers.${ext}`;
        const graphqlMutationsPath = `${pluginsPath}/${plugin}/api/graphql/mutations.${ext}`;
        const graphqlSubscriptionsPath = `${pluginsPath}/${plugin}/api/graphql/subscriptions.${ext}`;
        const afterMutationsPath = `${pluginsPath}/${plugin}/api/graphql/afterMutations.${ext}`;
        const modelsPath = `${pluginsPath}/${plugin}/api/models.${ext}`;
        const constantsPath = `${pluginsPath}/${plugin}/api/constants.${ext}`;

        if (fs.existsSync(permissionsPath)) {
          registerModule({
            [plugin]: {
              name: plugin,
              description: plugin,
              actions: tryRequire(permissionsPath).default
            }
          });
        }

        if (fs.existsSync(routesPath)) {
          routes = (tryRequire(routesPath).default || {}).routes;
        }

        if (fs.existsSync(msgBrokersPath)) {
          msgBrokers = tryRequire(msgBrokersPath).default;
        }

        if (fs.existsSync(modelsPath)) {
          models = tryRequire(modelsPath).default;
        }

        if (fs.existsSync(constantsPath)) {
          constants = tryRequire(constantsPath).default;
        }

        if (fs.existsSync(graphqlResolversPath)) {
          graphqlResolvers = tryRequire(graphqlResolversPath).default;
        }

        if (fs.existsSync(graphqlQueriesPath)) {
          graphqlQueries = tryRequire(graphqlQueriesPath).default;
        }

        if (fs.existsSync(graphqlMutationsPath)) {
          graphqlMutations = tryRequire(graphqlMutationsPath).default;
        }

        if (fs.existsSync(graphqlSubscriptionsPath)) {
          graphqlSubscriptions = tryRequire(graphqlSubscriptionsPath).default;
        }

        if (fs.existsSync(afterMutationsPath)) {
          afterMutations = tryRequire(afterMutationsPath).default;
        }

        if (fs.existsSync(graphqlSchemaPath)) {
          const { types, queries, mutations, subscriptions } = tryRequire(
            graphqlSchemaPath
          );

          if (types) {
            graphqlSchema.types = types;
          }

          if (queries) {
            graphqlSchema.queries = queries;
          }

          if (mutations) {
            graphqlSchema.mutations = mutations;
          }

          if (subscriptions) {
            graphqlSchema.subscriptions = subscriptions;
          }
        }

        callback({
          isLastIteration: pluginsCount === index + 1,
          routes,
          msgBrokers,
          graphqlSchema,
          graphqlResolvers,
          graphqlQueries,
          graphqlMutations,
          graphqlSubscriptions,
          afterMutations,
          models,
          constants
        });
      });
    });
  } else {
    callback({
      isLastIteration: true,
      constants: {},
      graphqlSchema: {},
      graphqlResolvers: [],
      graphqlQueries: [],
      graphqlMutations: [],
      graphqlSubscriptions: [],
      afterMutations: {},
      routes: [],
      models: [],
      msgBrokers: []
    });
  }
};

const checkPermission = async (actionName, user) => {
  checkLogin(user);

  const allowed = await can(actionName, user);

  if (!allowed) {
    throw new Error('Permission required');
  }
};

export const extendViaPlugins = (
  app,
  resolvers,
  typeDefDetails
): Promise<any> =>
  new Promise(resolve => {
    let { types, queries, mutations, subscriptions } = typeDefDetails;

    execInEveryPlugin(
      async ({
        isLastIteration,
        graphqlSchema,
        graphqlResolvers,
        graphqlQueries,
        graphqlMutations,
        graphqlSubscriptions,
        afterMutations,
        routes,
        models,
        msgBrokers
      }) => {
        routes.forEach(route => {
          app[route.method.toLowerCase()](route.path, (req, res) => {
            return res.send(route.handler({ req, models: allModels }));
          });
        });

        if (models && models.length) {
          models.forEach(model => {
            for (const perField of Object.keys(model.schema)) {
              model.schema[perField] = field(model.schema[perField]);
            }

            if (model.klass) {
              model.schema = new mongoose.Schema(model.schema).loadClass(
                model.klass
              );
            }

            allModels[model.name] = mongoose.model(
              model.name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase(),
              model.schema
            );
          });
        }

        if (graphqlSchema.types) {
          types = `
        ${types}
        ${graphqlSchema.types}
      `;
        }

        if (graphqlSchema.queries) {
          queries = `
        ${queries}
        ${graphqlSchema.queries}
      `;
        }

        if (graphqlSchema.mutations) {
          mutations = `
        ${mutations}
        ${graphqlSchema.mutations}
      `;
        }

        if (graphqlSchema.subscriptions) {
          subscriptions = `
        ${subscriptions}
        ${graphqlSchema.subscriptions}
      `;
        }

        const generateCtx = context => {
          return {
            ...context,
            models: allModels,
            memoryStorage,
            graphqlPubsub,
            checkLogin,
            checkPermission,
            messageBroker
          };
        };

        if (graphqlQueries) {
          for (const query of graphqlQueries) {
            resolvers.Query[query.name] = (_root, _args, context) => {
              return query.handler(_root, _args, generateCtx(context));
            };
          }
        }

        if (graphqlMutations) {
          for (const mutation of graphqlMutations) {
            resolvers.Mutation[mutation.name] = (_root, _args, context) => {
              return mutation.handler(_root, _args, generateCtx(context));
            };
          }
        }

        if (graphqlSubscriptions) {
          for (const subscription of graphqlSubscriptions) {
            resolvers.Subscription[subscription.name] = {
              subscribe: withFilter(
                () => graphqlPubsub.asyncIterator(subscription.name),
                (payload, variables) => {
                  return subscription.handler(payload, variables);
                }
              )
            };
          }
        }

        if (graphqlResolvers) {
          for (const resolver of graphqlResolvers) {
            if (!Object.keys(resolvers).includes(resolver.type)) {
              resolvers[resolver.type] = {};
            }
            resolvers[resolver.type][resolver.field] = (
              _root,
              _args,
              context
            ) => {
              return resolver.handler(_root, _args, generateCtx(context));
            };
          }
        }

        if (msgBrokers && msgBrokers.length) {
          msgBrokers.forEach(async mbroker => {
            if (!Object.keys(pluginsConsumers).includes(mbroker.channel)) {
              pluginsConsumers[mbroker.channel] = {};
            }
            pluginsConsumers[mbroker.channel] = mbroker;
          });
        }

        if (afterMutations && afterMutations.length) {
          afterMutations.forEach(async afterMutation => {
            const { type, action } = afterMutation;

            if (!Object.keys(callAfterMutations).includes(type)) {
              callAfterMutations[type] = {};
            }

            if (!Object.keys(callAfterMutations[type]).includes(action)) {
              callAfterMutations[type][action] = [];
            }

            callAfterMutations[type][action].push(afterMutation.handler);
          });
        }

        if (isLastIteration) {
          return resolve({ types, queries, mutations, subscriptions });
        }
      }
    );
  });

export const pluginsConsume = client => {
  const { consumeQueue, consumeRPCQueue } = client;
  const context = {
    models: allModels,
    memoryStorage,
    graphqlPubsub
  };

  for (const channel of Object.keys(pluginsConsumers)) {
    const mbroker = pluginsConsumers[channel];

    if (mbroker.method === 'RPCQueue') {
      consumeRPCQueue(channel, async msg => mbroker.handler(msg, context));
    } else {
      consumeQueue(channel, async msg => await mbroker.handler(msg, context));
    }
  }
};

interface IFinalLogParams extends ILogDataParams {
  action: string;
}

export const callAfterMutation = async (
  params: IFinalLogParams,
  user: IUserDocument
) => {
  if (!callAfterMutations) {
    return;
  }

  const { type, action } = params;

  // not used type in plugins
  if (!callAfterMutations[type]) {
    return;
  }

  // not used this type's action in plugins
  if (!callAfterMutations[type][action]) {
    return;
  }

  try {
    for (const handler of callAfterMutations[type][action]) {
      await handler({}, params, {
        user,
        models: allModels,
        memoryStorage,
        graphqlPubsub,
        messageBroker
      });
    }
  } catch (e) {
    throw new Error(e.message);
  }
};
