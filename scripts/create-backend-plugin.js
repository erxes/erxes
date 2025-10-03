const fs = require('fs');
const path = require('path');

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function createBackendPlugin(pluginName, moduleName) {
  // Convert plugin name to kebab case
  const kebabCaseName = pluginName
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

  // Capitalize first letter of moduleName
  const capitalizedModuleName = capitalizeFirstLetter(moduleName);

  // Create backend plugin directory
  const backendPluginDir = path.join(
    __dirname,
    '..',
    'backend',
    'plugins',
    kebabCaseName + '_api',
  );

  // Create backend plugin directory structure
  const backendDirectories = [
    '',
    'src',
    'src/apollo',
    'src/apollo/resolvers',
    'src/apollo/schema',
    'src/trpc',
    'src/modules',
    `src/modules/${moduleName}`,
    `src/modules/${moduleName}/graphql`,
    `src/modules/${moduleName}/graphql/schemas`,
    `src/modules/${moduleName}/graphql/resolvers`,
    `src/modules/${moduleName}/graphql/resolvers/queries`,
    `src/modules/${moduleName}/graphql/resolvers/mutations`,
    `src/modules/${moduleName}/graphql/resolvers/customResolvers`,
    `src/modules/${moduleName}/db`,
    `src/modules/${moduleName}/db/models`,
    `src/modules/${moduleName}/db/definitions`,
    `src/modules/${moduleName}/@types`,
  ];

  backendDirectories.forEach((dir) => {
    fs.mkdirSync(path.join(backendPluginDir, dir), { recursive: true });
  });

  // Create package.json
  const packageJson = {
    name: kebabCaseName + '_api',
    version: '1.0.0',
    description: '',
    main: 'index.js',
    scripts: {
      dev: 'nodemon src/main.ts',
      build:
        'tsc --project tsconfig.build.json && tsc-alias -p tsconfig.build.json',
      start: 'node -r tsconfig-paths/register dist/src/main.js',
    },
    keywords: [],
    author: '',
    license: 'ISC',
    dependencies: {
      'erxes-api-shared': 'workspace:^',
    },
    devDependencies: {},
  };

  fs.writeFileSync(
    path.join(backendPluginDir, 'package.json'),
    JSON.stringify(packageJson, null, 2),
  );

  const tsConfigBuild = {
    extends: './tsconfig.json',
    compilerOptions: {
      rootDir: '.',
      paths: {
        '~/*': ['./src/*'],
        '@/*': ['./src/modules/*'],
      },
      types: ['node'],
    },
    exclude: ['node_modules', 'dist', '**/*spec.ts'],
  };

  fs.writeFileSync(
    path.join(backendPluginDir, 'tsconfig.build.json'),
    JSON.stringify(tsConfigBuild, null, 2),
  );

  // Create tsconfig.json
  const tsConfig = {
    extends: '../../../tsconfig.base.json',
    compilerOptions: {
      baseUrl: '.',
      module: 'commonjs',
      declaration: true,
      removeComments: true,
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      allowSyntheticDefaultImports: true,
      allowUnreachableCode: false,
      esModuleInterop: true,
      target: 'es2017',
      sourceMap: true,
      inlineSources: true,
      outDir: './dist',
      incremental: true,
      skipLibCheck: true,
      strictNullChecks: true,
      alwaysStrict: true,
      noImplicitAny: false,
      strictBindCallApply: false,
      forceConsistentCasingInFileNames: false,
      noFallthroughCasesInSwitch: false,
      resolveJsonModule: true,
      types: ['jest', 'node'],
      paths: {
        '~/*': ['./src/*'],
        '@/*': ['./src/modules/*'],
        'erxes-api-shared/*': ['../../erxes-api-shared/src/*'],
      },
    },
    'ts-node': {
      files: true,
      require: ['tsconfig-paths/register'],
    },
    exclude: ['dist', 'frontend/**/*'],
    include: ['src/**/*.ts', 'src/**/*.tsx'],
  };

  fs.writeFileSync(
    path.join(backendPluginDir, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2),
  );

  const projectJson = {
    name: kebabCaseName + '_api',
    $schema: '../../../node_modules/nx/schemas/project-schema.json',
    sourceRoot: 'backend/plugins/' + kebabCaseName + '_api/src',
    projectType: 'application',
    tags: [],
    targets: {
      build: {
        executor: 'nx:run-commands',
        cache: true,
        options: {
          cwd: 'backend/plugins/' + kebabCaseName + '_api',
          commands: ['pnpm build'],
        },
        dependsOn: ['^build', 'build:packageJson'],
      },

      'build:packageJson': {
        executor: '@nx/js:tsc',
        options: {
          main: 'backend/plugins/' + kebabCaseName + '_api/dist/src/main.js',
          tsConfig:
            'backend/plugins/' + kebabCaseName + '_api/tsconfig.build.json',
          outputPath: 'backend/plugins/' + kebabCaseName + '_api/dist',
          updateBuildableProjectDepsInPackageJson: true,

          buildableProjectDepsInPackageJsonType: 'dependencies',
        },
      },

      start: {
        executor: 'nx:run-commands',
        dependsOn: ['typecheck', 'build'],
        options: {
          cwd: 'backend/plugins/' + kebabCaseName + '_api',
          command: 'NODE_ENV=development node dist/src/main.js',
        },
      },

      serve: {
        executor: 'nx:run-commands',

        options: {
          cwd: 'backend/plugins/' + kebabCaseName + '_api',
          command: 'NODE_ENV=development pnpm dev',
        },
      },

      'docker-build': {
        dependsOn: ['build'],
        command:
          'docker build -f backend/plugins/' +
          kebabCaseName +
          '_api/Dockerfile . -t erxes/erxes-next-' +
          kebabCaseName +
          '_api',
      },
    },
  };

  fs.writeFileSync(
    path.join(backendPluginDir, 'project.json'),
    JSON.stringify(projectJson, null, 2),
  );

  // Create main.ts
  const mainContent = `import { startPlugin } from 'erxes-api-shared/utils';
import { typeDefs } from '~/apollo/typeDefs';
import { appRouter } from '~/trpc/init-trpc';
import resolvers from './apollo/resolvers';
import { generateModels } from './connectionResolvers';

startPlugin({
  name: '${kebabCaseName}',
  port: 33010,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers,
  }),
  apolloServerContext: async (subdomain, context) => {
    const models = await generateModels(subdomain);

    context.models = models;

    return context;
  },
  trpcAppRouter: {
    router: appRouter,
    createContext: async (subdomain, context) => {
      const models = await generateModels(subdomain);

      context.models = models;

      return context;
    },
  },
});

`;

  fs.writeFileSync(path.join(backendPluginDir, 'src', 'main.ts'), mainContent);

  const connectionResolversContent = `import { createGenerateModels } from 'erxes-api-shared/utils';
import { IMainContext } from 'erxes-api-shared/core-types';
import { I${capitalizedModuleName}Document } from '@/${moduleName}/@types/${moduleName}';

import mongoose from 'mongoose';

import { load${capitalizedModuleName}Class, I${capitalizedModuleName}Model } from '@/${moduleName}/db/models/${moduleName}';

export interface IModels {
  ${capitalizedModuleName}: I${capitalizedModuleName}Model;
}

export interface IContext extends IMainContext {
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.${capitalizedModuleName} = db.model<I${capitalizedModuleName}Document, I${capitalizedModuleName}Model>(
    '${moduleName}',
    load${capitalizedModuleName}Class(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
`;

  fs.writeFileSync(
    path.join(backendPluginDir, 'src', 'connectionResolvers.ts'),
    connectionResolversContent,
  );

  // Create apollo/apolloServer.ts
  const apolloTypeDefs = `import { apolloCommonTypes } from 'erxes-api-shared/utils';
import { DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';
import { mutations, queries, types } from '~/apollo/schema/schema';

export const typeDefs = async (): Promise<DocumentNode> => {
  return gql\`
    \${apolloCommonTypes}
    \${types}
    extend type Query {
      \${queries}
    }
    extend type Mutation {
      \${mutations}
    }
  \`;
};
`;

  fs.writeFileSync(
    path.join(backendPluginDir, 'src', 'apollo', 'typeDefs.ts'),
    apolloTypeDefs,
  );

  const apolloResolvers = `import { apolloCustomScalars } from 'erxes-api-shared/utils';
import { customResolvers } from './resolvers';
import { mutations } from './mutations';
import { queries } from './queries';
const resolvers: any = {
  Mutation: {
    ...mutations,
  },
  Query: {
    ...queries,
  },
  ...apolloCustomScalars,
  ...customResolvers,
};

export default resolvers;
`;

  fs.writeFileSync(
    path.join(backendPluginDir, 'src', 'apollo', 'resolvers', 'index.ts'),
    apolloResolvers,
  );

  const apolloMutations = `import { ${moduleName}Mutations } from '@/${moduleName}/graphql/resolvers/mutations/${moduleName}';

export const mutations = {
  ...${moduleName}Mutations,
};
`;

  fs.writeFileSync(
    path.join(backendPluginDir, 'src', 'apollo', 'resolvers', 'mutations.ts'),
    apolloMutations,
  );

  const apolloQueries = `import { ${moduleName}Queries } from '@/${moduleName}/graphql/resolvers/queries/${moduleName}';

export const queries = {
  ...${moduleName}Queries,
};
`;

  fs.writeFileSync(
    path.join(backendPluginDir, 'src', 'apollo', 'resolvers', 'queries.ts'),
    apolloQueries,
  );

  const apolloCustomResolvers = `import { ${capitalizedModuleName} } from '@/${moduleName}/graphql/resolvers/customResolvers/${moduleName}';

export const customResolvers = {
  ${capitalizedModuleName},
};
`;

  fs.writeFileSync(
    path.join(backendPluginDir, 'src', 'apollo', 'resolvers', 'resolvers.ts'),
    apolloCustomResolvers,
  );

  // Create apollo/schema/schema.ts
  const schemaContent = `import {
  mutations as ${capitalizedModuleName}Mutations,
  queries as ${capitalizedModuleName}Queries,
  types as ${capitalizedModuleName}Types,
} from '@/${moduleName}/graphql/schemas/${moduleName}';

export const types = \`
  \${${capitalizedModuleName}Types}
\`;

export const queries = \`
  \${${capitalizedModuleName}Queries}
\`;

export const mutations = \`
  \${${capitalizedModuleName}Mutations}
\`;

export default { types, queries, mutations };
`;

  fs.writeFileSync(
    path.join(backendPluginDir, 'src', 'apollo', 'schema', 'schema.ts'),
    schemaContent,
  );

  // Create trpc/init-trpc.ts
  const initTrpcContent = `import { initTRPC } from '@trpc/server';

import { ITRPCContext } from 'erxes-api-shared/utils';

const t = initTRPC.context<ITRPCContext>().create();

export const appRouter = t.router({
  ${kebabCaseName}: {
    hello: t.procedure.query(() => {
      return 'Hello ${kebabCaseName}';
    }),
  },
});

export type AppRouter = typeof appRouter;
`;

  fs.writeFileSync(
    path.join(backendPluginDir, 'src', 'trpc', 'init-trpc.ts'),
    initTrpcContent,
  );

  const trpcClientsContent = `import { httpBatchLink, createTRPCUntypedClient } from '@trpc/client';
import { getPlugin, isEnabled } from 'erxes-api-shared/utils';

export const coreTRPCClient = async (): Promise<
  ReturnType<typeof createTRPCUntypedClient>
> => {
  const isCoreEnabled = await isEnabled('core');

  if (!isCoreEnabled) {
    throw new Error('Core plugin is not enabled');
  }

  const core = await getPlugin('core');

  const client = createTRPCUntypedClient({
    links: [httpBatchLink({ url: core.address + '/trpc' })],
  });

  return client;
};
`;

  fs.writeFileSync(
    path.join(backendPluginDir, 'src', 'trpc', 'trpcClients.ts'),
    trpcClientsContent,
  );

  // Create modules/${moduleName}/types/index.ts
  const moduleTypesContent = `import { Document } from 'mongoose';

export interface I${capitalizedModuleName} {
  name?: string;
}

export interface I${capitalizedModuleName}Document extends I${capitalizedModuleName}, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
`;

  fs.writeFileSync(
    path.join(
      backendPluginDir,
      'src',
      'modules',
      moduleName,
      '@types',
      `${moduleName}.ts`,
    ),
    moduleTypesContent,
  );

  const modelsDefinitionContent = `import { Schema } from 'mongoose';

import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const ${moduleName}Schema = schemaWrapper(
  new Schema(
    {
      _id: mongooseStringRandomId,
      name: { type: String, label: 'Name' },
    },
    {
      timestamps: true,
    },
  ),
);
`;

  fs.writeFileSync(
    path.join(
      backendPluginDir,
      'src',
      'modules',
      moduleName,
      'db',
      'definitions',
      `${moduleName}.ts`,
    ),
    modelsDefinitionContent,
  );

  const modelsContent = `import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ${moduleName}Schema } from '@/${moduleName}/db/definitions/${moduleName}';
import { I${capitalizedModuleName}, I${capitalizedModuleName}Document } from '@/${moduleName}/@types/${moduleName}';

export interface I${capitalizedModuleName}Model extends Model<I${capitalizedModuleName}Document> {
  get${capitalizedModuleName}(_id: string): Promise<I${capitalizedModuleName}Document>;
  get${capitalizedModuleName}s(): Promise<I${capitalizedModuleName}Document[]>;
  create${capitalizedModuleName}(doc: I${capitalizedModuleName}): Promise<I${capitalizedModuleName}Document>;
  update${capitalizedModuleName}(_id: string, doc: I${capitalizedModuleName}): Promise<I${capitalizedModuleName}Document>;
  remove${capitalizedModuleName}(${capitalizedModuleName}Id: string): Promise<{  ok: number }>;
}

export const load${capitalizedModuleName}Class = (models: IModels) => {
  class ${capitalizedModuleName} {
    /**
     * Retrieves ${kebabCaseName}
     */
    public static async get${capitalizedModuleName}(_id: string) {
      const ${capitalizedModuleName} = await models.${capitalizedModuleName}.findOne({ _id }).lean();

      if (!${capitalizedModuleName}) {
        throw new Error('${capitalizedModuleName} not found');
      }

      return ${capitalizedModuleName};
    }

    /**
     * Retrieves all ${kebabCaseName}s
     */
    public static async get${capitalizedModuleName}s(): Promise<I${capitalizedModuleName}Document[]> {
      return models.${capitalizedModuleName}.find().lean();
    }

    /**
     * Create a ${kebabCaseName}
     */
    public static async create${capitalizedModuleName}(doc: I${capitalizedModuleName}): Promise<I${capitalizedModuleName}Document> {
      return models.${capitalizedModuleName}.create(doc);
    }

    /*
     * Update ${kebabCaseName}
     */
    public static async update${capitalizedModuleName}(_id: string, doc: I${capitalizedModuleName}) {
      return await models.${capitalizedModuleName}.findOneAndUpdate(
        { _id },
        { $set: { ...doc } },
      );
    }

    /**
     * Remove ${kebabCaseName}
     */
    public static async remove${capitalizedModuleName}(${capitalizedModuleName}Id: string[]) {
      return models.${capitalizedModuleName}.deleteOne({ _id: { $in: ${capitalizedModuleName}Id } });
    }
  }

  ${moduleName}Schema.loadClass(${capitalizedModuleName});

  return ${moduleName}Schema;
};
`;

  fs.writeFileSync(
    path.join(
      backendPluginDir,
      'src',
      'modules',
      moduleName,
      'db',
      'models',
      `${capitalizedModuleName}.ts`,
    ),
    modelsContent,
  );

  // Create modules/${moduleName}/graphql/schemas/extensions.ts
  const apolloSchemaContent = `export const types = \`
  type ${capitalizedModuleName} {
    _id: String
    name: String
    description: String
  }
\`;

export const queries = \`
  get${capitalizedModuleName}(_id: String!): ${capitalizedModuleName}
  get${capitalizedModuleName}s: [${capitalizedModuleName}]
\`;

export const mutations = \`
  create${capitalizedModuleName}(name: String!): ${capitalizedModuleName}
  update${capitalizedModuleName}(_id: String!, name: String!): ${capitalizedModuleName}
  remove${capitalizedModuleName}(_id: String!): ${capitalizedModuleName}
\`;
`;

  const queriesContent = `
  import { IContext } from '~/connectionResolvers';

   export const ${moduleName}Queries = {
    get${capitalizedModuleName}: async (_parent: undefined, { _id }, { models }: IContext) => {
      return models.${capitalizedModuleName}.get${capitalizedModuleName}(_id);
    },
    
    get${capitalizedModuleName}s: async (_parent: undefined, { models }: IContext) => {
      return models.${capitalizedModuleName}.get${capitalizedModuleName}s();
    },
  };
`;

  fs.writeFileSync(
    path.join(
      backendPluginDir,
      'src',
      'modules',
      moduleName,
      'graphql',
      'resolvers',
      'queries',
      `${moduleName}.ts`,
    ),
    queriesContent,
  );

  const mutationsContent = `
  import { IContext } from '~/connectionResolvers';

  export const ${moduleName}Mutations = {
    create${capitalizedModuleName}: async (_parent: undefined, { name }, { models }: IContext) => {
      return models.${capitalizedModuleName}.create${capitalizedModuleName}({name});
    },

    update${capitalizedModuleName}: async (_parent: undefined, { _id, name }, { models }: IContext) => {
      return models.${capitalizedModuleName}.update${capitalizedModuleName}(_id, {name});
    },

    remove${capitalizedModuleName}: async (_parent: undefined, { _id }, { models }: IContext) => {
      return models.${capitalizedModuleName}.remove${capitalizedModuleName}(_id);
    },
  };

`;

  fs.writeFileSync(
    path.join(
      backendPluginDir,
      'src',
      'modules',
      moduleName,
      'graphql',
      'resolvers',
      'mutations',
      `${moduleName}.ts`,
    ),
    mutationsContent,
  );

  const resolverContent = `export const ${capitalizedModuleName} = {
    async description() {
      return '${capitalizedModuleName} description';
    },
  };
  `;

  fs.writeFileSync(
    path.join(
      backendPluginDir,
      'src',
      'modules',
      moduleName,
      'graphql',
      'resolvers',
      'customResolvers',
      `${moduleName}.ts`,
    ),
    resolverContent,
  );

  fs.writeFileSync(
    path.join(
      backendPluginDir,
      'src',
      'modules',
      moduleName,
      'graphql',
      'schemas',
      `${moduleName}.ts`,
    ),
    apolloSchemaContent,
  );

  // Create .gitignore
  const gitignoreContent = `node_modules
dist
.env
*.log
`;

  fs.writeFileSync(path.join(backendPluginDir, '.gitignore'), gitignoreContent);

  console.log(`\nNext steps:`);
  console.log(`1. cd backend/plugins/${kebabCaseName}_api`);
  console.log(`2. npm install`);
  console.log(`3. Start developing your plugin!`);
}

module.exports = { createBackendPlugin };
