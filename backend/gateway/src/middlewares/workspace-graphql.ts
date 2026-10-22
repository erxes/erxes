import { composeServices } from '@apollo/composition';
import { json, type Express, type Request, type Response } from 'express';
import {
  execute,
  extendSchema,
  getOperationAST,
  GraphQLError,
  isAbstractType,
  isObjectType,
  isLeafType,
  getNamedType,
  parse,
  print,
  specifiedRules,
  NoSchemaIntrospectionCustomRule,
  TypeInfo,
  validate,
  visit,
  visitWithTypeInfo,
  Kind,
  type DocumentNode,
  type FieldNode,
  type FragmentDefinitionNode,
  type GraphQLSchema,
  type OperationDefinitionNode,
  type GraphQLFormattedError,
} from 'graphql';
import { maxDepthRule } from '@escape.tech/graphql-armor-max-depth';
import { maxAliasesRule } from '@escape.tech/graphql-armor-max-aliases';
import { readFileSync, statSync } from 'node:fs';
import { z } from 'zod';
import { apolloRouterPort } from '~/apollo-router';
import { supergraphPath } from '~/apollo-router/paths';

const responseSchema = z.object({
  data: z.record(z.unknown()).nullish(),
  errors: z
    .array(
      z.object({
        message: z.string(),
        path: z.array(z.union([z.string(), z.number()])).optional(),
        extensions: z.record(z.unknown()).optional(),
      }),
    )
    .optional(),
});
const metadataSchema = z.object({
  data: z.object({
    dataModelWorkspaceSchema: z.object({
      version: z.string(),
      sdl: z.string(),
    }),
  }),
});
export interface WorkspaceRequest {
  headers: Record<string, string>;
  core: string;
  response: Response;
  errors: GraphQLFormattedError[];
  loads: Map<string, Promise<Record<string, unknown>>>;
  transportAliases?: { identity: string; typename: string };
}
export interface CachedSchema {
  schema: GraphQLSchema;
  generatedRoots: Set<string>;
  customFields: Map<string, string>;
  snapshot: string;
}
let platform: { mtime: number; schema: GraphQLSchema } | undefined;
const workspaces = new Map<string, CachedSchema>();
const transportIdentity = Symbol('workspaceRecordIdentity');
const transportTypename = Symbol('workspaceRecordType');

const getTransportAliases = (
  operation: OperationDefinitionNode,
  fragments: Record<string, FragmentDefinitionNode>,
) => {
  const keys = new Set<string>();
  visit(
    {
      kind: Kind.DOCUMENT,
      definitions: [operation, ...Object.values(fragments)],
    },
    {
      Field(node) {
        keys.add(node.alias?.value ?? node.name.value);
      },
    },
  );
  const unused = (prefix: string): string => {
    let key = prefix;
    while (keys.has(key)) key += '_';
    keys.add(key);
    return key;
  };
  return {
    identity: unused('__erxes_record_id'),
    typename: unused('__erxes_record_type'),
  };
};

// Transport identities must not overwrite client aliases, including `_id: name`
// or `__typename: name`. Symbols remain invisible even inside JSON scalar data.
const annotateTransport = (
  value: unknown,
  aliases: { identity: string; typename: string },
): void => {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((entry: unknown) => annotateTransport(entry, aliases));
    return;
  }
  for (const [key, entry] of Object.entries(value)) {
    if (
      typeof entry === 'string' &&
      (key === aliases.identity || key === aliases.typename)
    ) {
      Object.defineProperty(
        value,
        key === aliases.identity ? transportIdentity : transportTypename,
        { value: entry, configurable: true },
      );
    }
    annotateTransport(entry, aliases);
  }
};

const getPlatformSchema = (): { mtime: number; schema: GraphQLSchema } => {
  const mtime = statSync(supergraphPath).mtimeMs;
  if (platform?.mtime === mtime) return platform;
  // Federation's public API schema removes join/link internals and inaccessible
  // fields. Reuse the installed composition package rather than exposing raw SDL.
  const result = composeServices([
    { name: 'platform', typeDefs: parse(readFileSync(supergraphPath, 'utf8')) },
  ]);
  if (result.errors)
    throw new Error('Unable to construct the platform API schema');
  platform = { mtime, schema: result.schema.toAPISchema().toGraphQLJSSchema() };
  return platform;
};

const requestHeaders = (req: Request): Record<string, string> => {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    hostname: req.hostname,
  };
  for (const key of [
    'user',
    'userid',
    'cpuser',
    'clientportal',
    'authorization',
    'cookie',
    'sessioncode',
    'x-erxes-process-id',
    'nginx-hostname',
  ]) {
    const value = req.headers[key];
    if (typeof value === 'string') headers[key] = value;
  }
  return headers;
};

const remote = async (
  url: string,
  document: DocumentNode,
  variables: Record<string, unknown> | undefined,
  context: WorkspaceRequest,
  collectErrors = true,
) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: context.headers,
    body: JSON.stringify({ query: print(document), variables }),
    signal: AbortSignal.timeout(30000),
  });
  for (const cookie of response.headers.getSetCookie())
    context.response.append('Set-Cookie', cookie);
  const result = responseSchema.parse(await response.json());
  if (result.errors?.length) {
    if (!collectErrors)
      throw new GraphQLError(result.errors[0].message, {
        extensions: result.errors[0].extensions,
      });
    context.errors.push(...result.errors);
  }
  return { data: result.data ?? {}, errors: result.errors ?? [] };
};

const referencedFragments = (
  operation: OperationDefinitionNode,
  fragments: Map<string, FragmentDefinitionNode>,
): FragmentDefinitionNode[] => {
  const found = new Map<string, FragmentDefinitionNode>();
  const find = (
    node: OperationDefinitionNode | FragmentDefinitionNode,
  ): void => {
    visit(node, {
      FragmentSpread(spread) {
        if (found.has(spread.name.value)) return;
        const fragment = fragments.get(spread.name.value);
        if (fragment) {
          found.set(spread.name.value, fragment);
          find(fragment);
        }
      },
    });
  };
  find(operation);
  return [...found.values()];
};

// A delegated root keeps aliases, directives and reachable fragments, and drops
// unused variables. This is AST delegation, never string-based query splitting.
export const delegateDocument = (
  schema: GraphQLSchema,
  operation: OperationDefinitionNode,
  field: FieldNode,
  fragments: Map<string, FragmentDefinitionNode>,
  customFields: Map<string, string>,
  pruneCustom: boolean,
  aliases = { identity: '__erxes_record_id', typename: '__erxes_record_type' },
): DocumentNode => {
  const root = {
    ...operation,
    selectionSet: { ...operation.selectionSet, selections: [field] },
  };
  const document: DocumentNode = {
    kind: Kind.DOCUMENT,
    definitions: [root, ...referencedFragments(root, fragments)],
  };
  const typeInfo = new TypeInfo(schema);
  const pruned = pruneCustom
    ? visit(
        document,
        visitWithTypeInfo(typeInfo, {
          Field(node) {
            const parent = typeInfo.getParentType();
            if (parent && customFields.has(`${parent.name}.${node.name.value}`))
              return null;
          },
          SelectionSet: {
            leave(node) {
              const parent = typeInfo.getParentType();
              if (
                !parent ||
                ['Query', 'Mutation', 'Subscription'].includes(parent.name)
              )
                return;
              const selections = [...node.selections];
              selections.push({
                kind: Kind.FIELD,
                alias: { kind: Kind.NAME, value: aliases.typename },
                name: { kind: Kind.NAME, value: '__typename' },
              });
              if (isObjectType(parent) && parent.getFields()._id)
                selections.push({
                  kind: Kind.FIELD,
                  alias: { kind: Kind.NAME, value: aliases.identity },
                  name: { kind: Kind.NAME, value: '_id' },
                });
              return { ...node, selections };
            },
          },
        }),
      )
    : document;
  const prunedOperation = getOperationAST(pruned);
  if (!prunedOperation) throw new Error('Missing delegated operation');
  const prunedFragments = new Map(
    pruned.definitions
      .filter(
        (entry): entry is FragmentDefinitionNode =>
          entry.kind === Kind.FRAGMENT_DEFINITION,
      )
      .map((entry) => [entry.name.value, entry]),
  );
  const usedFragments = referencedFragments(prunedOperation, prunedFragments);
  const withoutVariables: DocumentNode = {
    kind: Kind.DOCUMENT,
    definitions: [
      { ...prunedOperation, variableDefinitions: [] },
      ...usedFragments,
    ],
  };
  const variables = new Set<string>();
  visit(withoutVariables, {
    Variable(node) {
      variables.add(node.name.value);
    },
  });
  return {
    kind: Kind.DOCUMENT,
    definitions: [
      {
        ...prunedOperation,
        variableDefinitions: prunedOperation.variableDefinitions?.filter(
          (entry) => variables.has(entry.variable.name.value),
        ),
      },
      ...usedFragments,
    ],
  };
};

export const createWorkspaceGatewaySchema = (
  base: GraphQLSchema,
  sdl: string,
  snapshot: string,
): CachedSchema => {
  const extension = parse(sdl);
  const schema = extendSchema(base, extension);
  const generatedRoots = new Set<string>();
  const customFields = new Map<string, string>();
  for (const definition of extension.definitions) {
    if (definition.kind !== Kind.OBJECT_TYPE_EXTENSION) continue;
    for (const field of definition.fields ?? []) {
      if (['Query', 'Mutation'].includes(definition.name.value))
        generatedRoots.add(field.name.value);
      else
        customFields.set(
          `${definition.name.value}.${field.name.value}`,
          definition.name.value,
        );
    }
  }
  for (const type of Object.values(schema.getTypeMap())) {
    if (isAbstractType(type))
      type.resolveType = (value: unknown) => {
        if (
          value &&
          typeof value === 'object' &&
          transportTypename in value &&
          typeof value[transportTypename] === 'string'
        )
          return value[transportTypename];
        if (
          value &&
          typeof value === 'object' &&
          '__typename' in value &&
          typeof value.__typename === 'string'
        )
          return value.__typename;
        return undefined;
      };
    if (!isObjectType(type) || type.name.startsWith('__')) continue;
    for (const [fieldName, field] of Object.entries(type.getFields())) {
      if (['Query', 'Mutation'].includes(type.name)) {
        field.resolve = async (
          _source,
          _args,
          context: WorkspaceRequest,
          info,
        ) => {
          const operation = { ...info.operation, name: undefined };
          const aliases = (context.transportAliases ??= getTransportAliases(
            info.operation,
            info.fragments,
          ));
          const selected = info.fieldNodes[0];
          const fieldNode = selected.selectionSet
            ? {
                ...selected,
                selectionSet: {
                  ...selected.selectionSet,
                  selections: info.fieldNodes.flatMap(
                    (node) => node.selectionSet?.selections ?? [],
                  ),
                },
              }
            : selected;
          const document = delegateDocument(
            schema,
            operation,
            fieldNode,
            new Map(Object.entries(info.fragments)),
            customFields,
            !generatedRoots.has(fieldName),
            aliases,
          );
          const destination = generatedRoots.has(fieldName)
            ? `${context.core}/data-models/graphql`
            : `http://127.0.0.1:${apolloRouterPort}/`;
          const result = await remote(
            destination,
            document,
            info.variableValues,
            context,
          );
          const data = result.data;
          annotateTransport(data, aliases);
          if (info.operation.operation === 'mutation') context.loads.clear();
          if (data[String(info.path.key)] == null && result.errors.length) {
            context.errors = context.errors.filter(
              (error) =>
                !result.errors.some((remoteError) => remoteError === error),
            );
            const [error] = result.errors;
            throw new GraphQLError(error.message, {
              extensions: error.extensions,
            });
          }
          return data[String(info.path.key)] ?? null;
        };
      } else if (customFields.has(`${type.name}.${fieldName}`)) {
        field.resolve = async (
          source: Record<PropertyKey, unknown>,
          _args,
          context: WorkspaceRequest,
          info,
        ) => {
          // Generated roots already executed nested selections in core.
          if (
            Object.prototype.hasOwnProperty.call(source, String(info.path.key))
          )
            return source[String(info.path.key)];
          const identity = source[transportIdentity] ?? source._id;
          if (typeof identity !== 'string')
            throw new Error('A record identity is required for a model field');
          const nested = !isLeafType(getNamedType(field.type));
          const key = `${type.name}:${identity}${
            nested
              ? `:${info.fieldNodes
                  .map((node) => print(node))
                  .join(' ')}:${JSON.stringify(info.variableValues)}`
              : ''
          }`;
          let load = context.loads.get(key);
          if (!load) {
            const modelName = (
              {
                Customer: 'customer',
                Company: 'company',
                Product: 'product',
                User: 'user',
              } as Record<string, string>
            )[type.name];
            if (!modelName) throw new Error('Unsupported built-in model type');
            const names = [...customFields.keys()]
              .filter((name) => name.startsWith(`${type.name}.`))
              .map((name) => name.slice(type.name.length + 1))
              .filter((name) =>
                isLeafType(getNamedType(type.getFields()[name].type)),
              )
              .map((name) =>
                name === '_dataModelVersion'
                  ? '_dataModelVersion: version'
                  : name,
              );
            const root = `dataModel_${modelName}Fields`;
            let identityVariable = '_id';
            while (
              Object.prototype.hasOwnProperty.call(
                info.variableValues,
                identityVariable,
              )
            )
              identityVariable += '_';
            const variableDefinitions = [
              ...(info.operation.variableDefinitions ?? []).map((definition) =>
                print(definition),
              ),
              `$${identityVariable}: String!`,
            ];
            const document =
              parse(`query dataModelBuiltinValues(${variableDefinitions.join(
                ', ',
              )}) {
              ${root}(_id: $${identityVariable}) { ${names.join(' ')} ${
                nested
                  ? info.fieldNodes.map((node) => print(node)).join(' ')
                  : ''
              } }
            } ${Object.values(info.fragments)
              .map((fragment) => print(fragment))
              .join('\n')}`);
            const operation = getOperationAST(document);
            if (!operation)
              throw new Error('Missing relation hydration operation');
            const rootNode = operation.selectionSet.selections[0];
            if (rootNode.kind !== Kind.FIELD)
              throw new Error('Missing relation hydration root');
            const delegated = delegateDocument(
              schema,
              operation,
              rootNode,
              new Map(Object.entries(info.fragments)),
              customFields,
              false,
            );
            load = remote(
              `${context.core}/data-models/graphql`,
              delegated,
              { ...info.variableValues, [identityVariable]: identity },
              context,
              false,
            ).then(({ data }) => {
              const value = data[root];
              if (!value || typeof value !== 'object' || Array.isArray(value))
                return {};
              return Object.fromEntries(Object.entries(value));
            });
            context.loads.set(key, load);
          }
          return (
            (await load)[nested ? String(info.path.key) : fieldName] ?? null
          );
        };
      } else {
        field.resolve = (
          source: Record<string, unknown>,
          _args,
          _context,
          info,
        ) =>
          Object.prototype.hasOwnProperty.call(source, String(info.path.key))
            ? source[String(info.path.key)]
            : source[fieldName];
      }
    }
  }
  return { schema, generatedRoots, customFields, snapshot };
};

export const applyWorkspaceGraphQL = (
  app: Express,
  getCoreAddress: () => string,
  readPlatformSchema: () => {
    mtime: number;
    schema: GraphQLSchema;
  } = getPlatformSchema,
): void => {
  const parseBody = json({ limit: '15mb' });
  app.all(
    '/graphql',
    (req, res, next) => {
      if (typeof req.headers.user !== 'string') return next();
      return parseBody(req, res, next);
    },
    async (req, res, next) => {
      // Anonymous/authentication/client-portal traffic retains the existing router.
      // Identity headers have already been sanitized and established by the gateway.
      if (typeof req.headers.user !== 'string') return next();
      const body = req.method === 'GET' ? req.query : req.body;
      if (typeof body?.query !== 'string') return next();
      let dynamic = false;
      const generatedRequest = /\bdataModel_/.test(body.query);
      try {
        let document: DocumentNode;
        try {
          document = parse(body.query);
        } catch {
          return next();
        }
        const operationName =
          typeof body.operationName === 'string'
            ? body.operationName
            : undefined;
        const operation = getOperationAST(document, operationName);
        if (!operation || operation.operation === 'subscription') return next();
        const base = readPlatformSchema();
        // Known platform operations need neither metadata permission nor a core
        // metadata round trip. Unknown fields may be workspace-owned extensions.
        let candidate = generatedRequest;
        const typeInfo = new TypeInfo(base.schema);
        visit(
          document,
          visitWithTypeInfo(typeInfo, {
            Field(node) {
              if (
                ['__schema', '__type'].includes(node.name.value) ||
                !typeInfo.getFieldDef()
              )
                candidate = true;
            },
          }),
        );
        if (!candidate) return next();
        const core = getCoreAddress();
        const headers = requestHeaders(req);
        const response = await fetch(`${core}/graphql`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query:
              'query dataModelWorkspaceGatewaySchema { dataModelWorkspaceSchema { version sdl } }',
          }),
          signal: AbortSignal.timeout(10000),
        });
        const result = metadataSchema.safeParse(await response.json());
        if (!result.success) {
          if (/\bdataModel_/.test(body.query))
            return res.status(403).json({
              errors: [
                {
                  message:
                    'Workspace model schema is unavailable or access is denied',
                },
              ],
            });
          return next();
        }
        const metadata = result.data.data.dataModelWorkspaceSchema;
        const snapshot = `${headers['nginx-hostname'] ?? req.hostname}:${
          base.mtime
        }:${metadata.version}`;
        let cached = workspaces.get(snapshot);
        if (!cached) {
          cached = createWorkspaceGatewaySchema(
            base.schema,
            metadata.sdl,
            snapshot,
          );
          if (workspaces.size >= 128)
            workspaces.delete(workspaces.keys().next().value ?? '');
          workspaces.set(snapshot, cached);
        }
        visit(document, {
          Field(node) {
            if (
              cached.generatedRoots.has(node.name.value) ||
              ['__schema', '__type'].includes(node.name.value) ||
              [...cached.customFields.keys()].some((name) =>
                name.endsWith(`.${node.name.value}`),
              )
            )
              dynamic = true;
          },
        });
        if (!dynamic) return next();
        if (body.query.length > 100000)
          return res.status(400).json({
            errors: [{ message: 'GraphQL query exceeds 100000 characters' }],
          });
        if (req.method !== 'POST' && operation.operation === 'mutation')
          return res
            .status(405)
            .json({ errors: [{ message: 'Mutations require POST' }] });
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
        const variables =
          typeof body.variables === 'string'
            ? JSON.parse(body.variables)
            : body.variables;
        const context: WorkspaceRequest = {
          headers,
          core,
          response: res,
          errors: [],
          loads: new Map(),
        };
        const execution = await execute({
          schema: cached.schema,
          document,
          variableValues: variables,
          operationName,
          contextValue: context,
        });
        res.set('Cache-Control', 'no-store');
        return res.json({
          ...execution,
          ...(context.errors.length
            ? { errors: [...(execution.errors ?? []), ...context.errors] }
            : {}),
        });
      } catch (error) {
        if (!dynamic && !generatedRequest) return next();
        return res.status(400).json({
          errors: [
            {
              message:
                error instanceof Error
                  ? error.message
                  : 'Workspace GraphQL request failed',
            },
          ],
        });
      }
    },
  );
};
