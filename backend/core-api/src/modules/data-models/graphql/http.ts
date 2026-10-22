import type { Express, Request } from 'express';
import {
  execute,
  getOperationAST,
  parse,
  validate,
  specifiedRules,
  NoSchemaIntrospectionCustomRule,
  type GraphQLSchema,
} from 'graphql';
import { maxDepthRule } from '@escape.tech/graphql-armor-max-depth';
import { maxAliasesRule } from '@escape.tech/graphql-armor-max-aliases';
import { generateApolloContext } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import {
  createWorkspaceSchema,
  getWorkspaceSnapshot,
  type WorkspaceContext,
} from './workspace';

const schemas = new WeakMap<
  object,
  { version: string; schema: GraphQLSchema }
>();

export const initDataModelGraphQL = (
  app: Express,
  baseSchema: GraphQLSchema,
): void => {
  const createContext = generateApolloContext<WorkspaceContext>(
    async (subdomain, context) => {
      const models = await generateModels(subdomain, context);
      return { ...context, models };
    },
  );
  app.post('/data-models/graphql', async (req, res) => {
    try {
      if (typeof req.body?.query !== 'string' || req.body.query.length > 100000)
        return res.status(400).json({
          errors: [
            {
              message:
                'A GraphQL query of at most 100000 characters is required',
            },
          ],
        });
      // Workspace introspection must authenticate; the platform context factory
      // intentionally skips identity only for static federation introspection.
      const request: Request = Object.create(req);
      request.body = {
        ...req.body,
        operationName: 'dataModelWorkspaceRequest',
      };
      const context = await createContext({ req: request, res });
      if (!('models' in context))
        throw new Error('Workspace context is unavailable');
      const workspace = context;
      const snapshot = await getWorkspaceSnapshot(workspace);
      const connection = workspace.models.DataModelDefinitions.db;
      let cached = schemas.get(connection);
      if (!cached || cached.version !== snapshot.version) {
        cached = {
          version: snapshot.version,
          schema: createWorkspaceSchema(baseSchema, snapshot),
        };
        schemas.set(connection, cached);
      }
      const document = parse(req.body.query);
      const operation = getOperationAST(document, req.body.operationName);
      if (operation?.operation === 'subscription')
        return res.status(400).json({
          errors: [
            {
              message:
                'Use the existing subscription endpoint for subscriptions',
            },
          ],
        });
      const errors = validate(cached.schema, document, [
        ...specifiedRules,
        ...(process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'test' ||
        process.env.INTROSPECTION?.trim().toLowerCase() === 'true'
          ? []
          : [NoSchemaIntrospectionCustomRule]),
        maxDepthRule({ n: 30 }),
        maxAliasesRule({ n: 100 }),
      ]);
      if (errors.length) return res.status(400).json({ errors });
      const result = await execute({
        schema: cached.schema,
        document,
        variableValues: req.body.variables,
        operationName: req.body.operationName,
        contextValue: workspace,
      });
      res.set('Cache-Control', 'no-store');
      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        errors: [
          {
            message:
              error instanceof Error
                ? error.message
                : 'Unable to execute workspace GraphQL',
          },
        ],
      });
    }
  });
};
