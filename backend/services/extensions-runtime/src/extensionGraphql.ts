import { randomUUID } from 'node:crypto';
import { canGroup, type PermissionUser } from 'erxes-api-shared/core-modules';
import {
  buildASTSchema,
  defaultFieldResolver,
  execute,
  type ExecutionResult,
  type FragmentDefinitionNode,
  getOperationAST,
  GraphQLError,
  type GraphQLFieldResolver,
  type GraphQLSchema,
  Kind,
  parse,
  type SelectionSetNode,
  validate,
} from 'graphql';
import { z } from 'zod';
import type { IExtensionDocument } from './connectionResolver';
import { ApiError } from './errors';
import { LIMITS } from './limits';
import { actionName } from './permissions';
import { invoke, type Session } from './sandbox';

export const GraphqlRequest = z.object({
  query: z.string(),
  variables: z.record(z.string(), z.unknown()).nullish(),
  operationName: z.string().nullish(),
});

// A failure as a GraphQL error: the code in `extensions.code`, field issues
// in `extensions.issues`.
export const graphqlError = (
  code: string,
  message: string,
  issues?: { path: string; message: string }[],
) =>
  new GraphQLError(message, {
    extensions: { code, ...(issues && { issues }) },
  });

// One schema per installed build, built from its SDL the first time a
// request needs it. A build never changes under its hash.
const schemas = new Map<string, GraphQLSchema>();
const MAX_SCHEMAS = 500;

const schemaOf = ({ buildHash, typeDefs }: IExtensionDocument) => {
  const cached = schemas.get(buildHash);

  if (cached) {
    return cached;
  }

  const schema = buildASTSchema(parse(typeDefs));
  schemas.set(buildHash, schema);

  if (schemas.size > MAX_SCHEMAS) {
    schemas.delete(schemas.keys().next().value ?? '');
  }

  return schema;
};

type Fragments = Map<string, FragmentDefinitionNode>;

// The deepest selection. validate() has refused fragment cycles already.
const depthOf = (
  set: SelectionSetNode | undefined,
  fragments: Fragments,
): number =>
  Math.max(
    0,
    ...(set?.selections ?? []).map((selection) =>
      selection.kind === Kind.FIELD
        ? 1 + depthOf(selection.selectionSet, fragments)
        : depthOf(
            selection.kind === Kind.INLINE_FRAGMENT
              ? selection.selectionSet
              : fragments.get(selection.name.value)?.selectionSet,
            fragments,
          ),
    ),
  );

// Root fields a request runs, each one sandbox call: aliases count apart.
const rootFieldCount = (
  set: SelectionSetNode | undefined,
  fragments: Fragments,
): number =>
  (set?.selections ?? []).reduce(
    (count, selection) =>
      count +
      (selection.kind === Kind.FIELD
        ? 1
        : rootFieldCount(
            selection.kind === Kind.INLINE_FRAGMENT
              ? selection.selectionSet
              : fragments.get(selection.name.value)?.selectionSet,
            fragments,
          )),
    0,
  );

// A sandbox or host failure as the GraphQL error the browser gets. One
// nobody mapped stays in the log; the browser gets its correlation id.
const toGraphqlError = (e: unknown) => {
  if (e instanceof GraphQLError) {
    return e;
  }

  if (e instanceof ApiError) {
    return graphqlError(e.code, e.message, e.issues);
  }

  const correlationId = randomUUID();
  console.error(`[${correlationId}] extension GraphQL`, e);
  return graphqlError('INTERNAL', `Internal error (${correlationId})`);
};

export type GraphqlCall = {
  ext: IExtensionDocument;
  tenant: string;
  user: PermissionUser;
  session: Session;
  request: z.infer<typeof GraphqlRequest>;
};

// One request to an extension's schema: validated against it, capped in
// depth and root fields, then executed. Every root field checks its
// permission and runs in the sandbox as one call; nested fields resolve
// from the JSON it returned with the default resolver.
export const runExtensionGraphql = async ({
  ext,
  tenant,
  user,
  session,
  request,
}: GraphqlCall): Promise<ExecutionResult> => {
  const schema = schemaOf(ext);
  let document;

  try {
    // A token cap first: validate() compares every pair of selections, so a
    // long flat query would block the event loop before the caps below.
    document = parse(request.query, { maxTokens: LIMITS.graphqlMaxTokens });
  } catch (e) {
    return { errors: [toGraphqlError(e)] };
  }

  const invalid = validate(schema, document);

  if (invalid.length > 0) {
    return { errors: invalid };
  }

  const operation = getOperationAST(document, request.operationName);
  const fragments: Fragments = new Map(
    document.definitions.flatMap((definition) =>
      definition.kind === Kind.FRAGMENT_DEFINITION
        ? [[definition.name.value, definition]]
        : [],
    ),
  );

  if (depthOf(operation?.selectionSet, fragments) > LIMITS.graphqlMaxDepth) {
    return {
      errors: [
        graphqlError(
          'QUERY_TOO_DEEP',
          `Selections nest deeper than ${LIMITS.graphqlMaxDepth} levels`,
        ),
      ],
    };
  }

  if (
    rootFieldCount(operation?.selectionSet, fragments) >
    LIMITS.graphqlMaxRootFields
  ) {
    return {
      errors: [
        graphqlError(
          'TOO_MANY_ROOT_FIELDS',
          `One request may select at most ${LIMITS.graphqlMaxRootFields} root fields`,
        ),
      ],
    };
  }

  // One check per action per request, however many fields need it.
  const checks = new Map<string, Promise<boolean>>();
  const can = (permission: string) => {
    const check =
      checks.get(permission) ??
      canGroup(tenant, actionName(ext.extId, permission), user);
    checks.set(permission, check);
    return check;
  };

  const runRoot = async (
    type: string,
    field: string,
    args: Record<string, unknown>,
  ) => {
    // Deny by default: a field the install recorded no permission for runs
    // for nobody.
    const permission = ext.fieldPermissions[field];

    if (
      !(permission === 'public' || (!!permission && (await can(permission))))
    ) {
      throw graphqlError('FORBIDDEN', 'Permission required');
    }

    try {
      const result = await invoke({
        tenant,
        extId: ext.extId,
        version: ext.version,
        code: ext.code,
        codeHash: ext.codeHash,
        collections: ext.collections,
        operations: ext.operations ?? {},
        name: `${type}.${field}`,
        input: args,
        user: { _id: user._id },
        session,
      });

      if (!result.ok) {
        const { code, message, issues } = result.error;
        throw graphqlError(code, message, issues);
      }

      return result.data;
    } catch (e) {
      throw toGraphqlError(e);
    }
  };

  const fieldResolver: GraphQLFieldResolver<unknown, unknown> = (
    source,
    args,
    context,
    info,
  ) =>
    info.path.prev === undefined
      ? runRoot(info.parentType.name, info.fieldName, args)
      : defaultFieldResolver(source, args, context, info);

  return execute({
    schema,
    document,
    operationName: request.operationName,
    variableValues: request.variables,
    fieldResolver,
  });
};
