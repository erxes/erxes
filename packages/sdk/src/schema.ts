import {
  buildASTSchema,
  getNamedType,
  type GraphQLObjectType,
  isInterfaceType,
  isObjectType,
  Kind,
  parse,
  validateSchema,
} from 'graphql';
import { pluginName } from './names';

export type ExtensionGraphql = {
  types?: string;
  queries?: string;
  mutations?: string;
};

// Every extension schema has these, like every plugin's. Values pass through
// as JSON: a Date arrives as its ISO string.
const SCALARS = 'scalar JSON\nscalar Date';

// The whole SDL the runtime serves for one extension, from its plugin-style
// strings: `types`, then the `queries` and `mutations` field lists.
export const extensionTypeDefs = ({
  types = '',
  queries = '',
  mutations = '',
}: ExtensionGraphql) =>
  [
    SCALARS,
    types,
    queries.trim() && `type Query {\n${queries}\n}`,
    mutations.trim() && `type Mutation {\n${mutations}\n}`,
  ]
    .filter(Boolean)
    .join('\n');

export type SchemaInput = {
  id: string;
  graphql: ExtensionGraphql;
  // Type -> the fields the worker has resolvers for.
  resolvers: Record<string, string[]>;
  // module -> action -> title
  permissions: Record<string, Record<string, string>>;
  // Root field -> 'module.action' or 'public'.
  fieldPermissions: Record<string, string>;
};

const ROOT_TYPES = ['Query', 'Mutation'] as const;

const fieldNames = (type: GraphQLObjectType | null | undefined) =>
  Object.keys(type?.getFields() ?? {});

// What install refuses, checked by `erxes-ext build` too so a bad schema
// fails before upload. Returns the SDL to serve, or every problem found.
export const checkExtensionSchema = (input: SchemaInput) => {
  const typeDefs = extensionTypeDefs(input.graphql);
  const problems: string[] = [];
  let document;

  try {
    document = parse(typeDefs);
  } catch (e) {
    return { typeDefs, problems: [e instanceof Error ? e.message : String(e)] };
  }

  for (const definition of document.definitions) {
    if (
      definition.kind === Kind.SCHEMA_DEFINITION ||
      definition.kind === Kind.SCHEMA_EXTENSION
    ) {
      problems.push('a schema definition is not allowed; the runtime adds it');
    }

    if ('name' in definition && definition.name?.value === 'Subscription') {
      problems.push('subscriptions are not supported');
    }
  }

  let schema;

  try {
    schema = buildASTSchema(document);
  } catch (e) {
    return {
      typeDefs,
      problems: [...problems, e instanceof Error ? e.message : String(e)],
    };
  }

  problems.push(...validateSchema(schema).map((error) => error.message));

  const prefix = pluginName(input.id);
  const actions = new Set(
    Object.entries(input.permissions).flatMap(([module, list]) =>
      Object.keys(list).map((action) => `${module}.${action}`),
    ),
  );
  const roots = {
    Query: fieldNames(schema.getQueryType()),
    Mutation: fieldNames(schema.getMutationType()),
  };
  const allRoots = [...roots.Query, ...roots.Mutation];

  for (const type of ROOT_TYPES) {
    const resolved = new Set(input.resolvers[type] ?? []);

    for (const field of roots[type]) {
      const permission = input.fieldPermissions[field];

      if (!field.startsWith(prefix)) {
        problems.push(`${type}.${field} must start with ${prefix}`);
      }

      if (!resolved.has(field)) {
        problems.push(`${type}.${field} has no resolver`);
      }

      if (permission === undefined) {
        problems.push(`${type}.${field} has no fieldPermissions entry`);
      } else if (permission !== 'public' && !actions.has(permission)) {
        problems.push(
          `${type}.${field} needs ${permission}, which permissions doesn't declare`,
        );
      }
    }

    for (const field of resolved) {
      if (!roots[type].includes(field)) {
        problems.push(`resolver ${type}.${field} has no field in the schema`);
      }
    }
  }

  for (const type of Object.keys(input.resolvers)) {
    if (!ROOT_TYPES.some((root) => root === type)) {
      problems.push(
        `resolvers on ${type}: only Query and Mutation fields have resolvers; nested fields resolve from the returned JSON`,
      );
    }
  }

  // A root type as a field type would run root resolvers below the root,
  // once per parent, past the per-request root-field cap.
  for (const type of Object.values(schema.getTypeMap())) {
    if (!isObjectType(type) && !isInterfaceType(type)) {
      continue;
    }

    for (const field of Object.values(type.getFields())) {
      const named = getNamedType(field.type).name;

      if (ROOT_TYPES.some((root) => root === named)) {
        problems.push(`${type.name}.${field.name} can't return ${named}`);
      }
    }
  }

  for (const field of Object.keys(input.fieldPermissions)) {
    if (!allRoots.includes(field)) {
      problems.push(`fieldPermissions.${field} is not a root field`);
    }
  }

  return { typeDefs, problems };
};
