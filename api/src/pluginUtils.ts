import * as fs from 'fs';
import * as mongoose from 'mongoose';
import * as path from 'path';
import * as dataConstants from './data/constants';
import { can, registerModule } from './data/permissions/utils';
import { checkLogin } from './data/permissions/wrappers';
import * as allModels from './db/models';
import * as defConstants from './db/models/definitions/constants';
import { debugError } from './debuggers';
import memoryStorage from './inmemoryStorage';
import { graphqlPubsub } from './pubsub';
import messageBroker from './messageBroker';

export { allModels }
export const allConstants = { ...dataConstants, ...defConstants }

export const pluginsConsumers = {}

interface ISubAfterMutations {
  [action: string]: {
    callBack: void
  }
}
interface IAfterMutations {
  [type: string]: ISubAfterMutations[];
}

export const callAfterMutations: IAfterMutations[] | {} = {};

const tryRequire = (requirPath) => {
  try {
    return require(`${requirPath}`);
  } catch (err) {
    debugError(err.message)
    return {};
  }
};

export const execInEveryPlugin = (callback) => {
  const pluginsPath = path.resolve(__dirname, process.env.NODE_ENV === 'production' ? './plugins' : '../../plugins');

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
        let afterMutations = [];
        let constants = {};

        const graphqlSchema = {
          types: '',
          queries: '',
          mutations: '',
        };

        const ext = process.env.NODE_ENV === 'production' ? 'js' : 'ts';

        const permissionsPath = `${pluginsPath}/${plugin}/api/permissions.${ext}`
        const routesPath = `${pluginsPath}/${plugin}/api/routes.${ext}`
        const msgBrokersPath = `${pluginsPath}/${plugin}/api/messageBrokers.${ext}`
        const graphqlSchemaPath = `${pluginsPath}/${plugin}/api/graphql/schema.${ext}`
        const graphqlQueriesPath = `${pluginsPath}/${plugin}/api/graphql/queries.${ext}`
        const graphqlResolversPath = `${pluginsPath}/${plugin}/api/graphql/resolvers.${ext}`
        const graphqlMutationsPath = `${pluginsPath}/${plugin}/api/graphql/mutations.${ext}`
        const afterMutationsPath = `${pluginsPath}/${plugin}/api/graphql/afterMutations.${ext}`
        const modelsPath = `${pluginsPath}/${plugin}/api/models.${ext}`
        const constantsPath = `${pluginsPath}/${plugin}/api/constants.${ext}`

        if (fs.existsSync(permissionsPath)) {
          registerModule({
            [plugin]: {
              name: plugin,
              description: plugin,
              actions: tryRequire(permissionsPath).default
            }
          })
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

        if (fs.existsSync(afterMutationsPath)) {
          afterMutations = tryRequire(afterMutationsPath).default;
        }

        if (fs.existsSync(graphqlSchemaPath)) {
          const { types, queries, mutations } = tryRequire(graphqlSchemaPath);

          if (types) {
            graphqlSchema.types = types;
          }

          if (queries) {
            graphqlSchema.queries = queries;
          }

          if (mutations) {
            graphqlSchema.mutations = mutations;
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
          afterMutations,
          models,
          constants
        })
      })
    })
  } else {
    callback({
      isLastIteration: true,
      constants: {},
      graphqlSchema: {},
      graphqlResolvers: [],
      graphqlQueries: [],
      graphqlMutations: [],
      afterMutations: {},
      routes: [],
      models: [],
      msgBrokers: []
    })
  }
}

const checkPermission = async (actionName, user) => {
  checkLogin(user);

  const allowed = await can(actionName, user);

  if (!allowed) {
    throw new Error('Permission required');
  }
}

export const extendViaPlugins = (app, resolvers, typeDefDetails): Promise<any> => new Promise((resolve) => {
  let { types, queries, mutations } = typeDefDetails;

  execInEveryPlugin(async ({
    constants,
    isLastIteration,
    graphqlSchema,
    graphqlResolvers,
    graphqlQueries,
    graphqlMutations,
    afterMutations,
    routes,
    models,
    msgBrokers
  }) => {
    routes.forEach(route => {
      app[route.method.toLowerCase()](route.path, (req, res) => {
        return res.send(route.handler({ req, models: allModels, constants: allConstants }));
      })
    });

    if (models && models.length) {
      models.forEach(model => {
        if (model.klass) {
          model.schema = new mongoose.Schema(model.schema).loadClass(model.klass);
        }

        allModels[model.name] = mongoose.model(model.name.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase(), model.schema);
      });
    }

    if (constants) {
      for (const key of Object.keys(constants)) {
        let all = [];
        if (allConstants[key] && allConstants[key].ALL) {
          all = allConstants[key].ALL.concat(constants[key].ALL);
        }
        allConstants[key] = { ...allConstants[key], ...constants[key], ...{ ALL: all } };
      }
    }

    if (graphqlSchema.types) {
      types = `
        ${types}
        ${graphqlSchema.types}
      `
    }

    if (graphqlSchema.queries) {
      queries = `
        ${queries}
        ${graphqlSchema.queries}
      `
    }

    if (graphqlSchema.mutations) {
      mutations = `
        ${mutations}
        ${graphqlSchema.mutations}
      `
    }

    const generateCtx = context => {
      return {
        ...context,
        constants: allConstants,
        models: allModels,
        memoryStorage,
        graphqlPubsub,
        checkLogin,
        checkPermission,
        messageBroker,
      };
    };

    if (graphqlQueries) {
      for (const query of graphqlQueries) {
        resolvers.Query[query.name] = (_root, _args, context) => {
          return query.handler(_root, _args, generateCtx(context))
        }
      }
    }

    if (graphqlMutations) {
      for (const mutation of graphqlMutations) {
        resolvers.Mutation[mutation.name] = (_root, _args, context) => {
          return mutation.handler(_root, _args, generateCtx(context))
        }
      }
    }

    if (graphqlResolvers) {
      for (const resolver of graphqlResolvers) {
        if (!Object.keys(resolvers).includes(resolver.type)) {
          resolvers[resolver.type] = {}
        }
        resolvers[resolver.type][resolver.field] = (_root, _args, context) => {
          return resolver.handler(_root, _args, generateCtx(context));
        }
      }
    }

    if (msgBrokers && msgBrokers.length) {
      msgBrokers.forEach(async (mbroker) => {
        if (!Object.keys(pluginsConsumers).includes(mbroker.channel)) {
          pluginsConsumers[mbroker.channel] = {}
        }
        pluginsConsumers[mbroker.channel] = mbroker
      });
    }

    if (afterMutations && afterMutations.length) {
      afterMutations.forEach(async (afterMutation) => {
        const { type, action } = afterMutation;

        if (!Object.keys(callAfterMutations).includes(type)) {
          callAfterMutations[type] = {};
        }

        if (!Object.keys(callAfterMutations[type]).includes(action)) {
          callAfterMutations[type][action] = [];
        }

        callAfterMutations[type][action].push(
          afterMutation.handler
        )
      });
    }

    if (isLastIteration) {
      return resolve({ types, queries, mutations })
    }
  });
});