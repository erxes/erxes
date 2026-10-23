import {
  getNamedType,
  isObjectType,
  isScalarType,
  isEnumType,
  type GraphQLObjectType,
  type GraphQLField,
} from 'graphql';
import { z } from 'zod';
import { buildGraphqlTools, loadMergedSchema } from './graphqlTools';
import { AGENTS_GRAPHQL_RECORD_TYPES } from './graphqlReferences';
import { AGENT_REFERENCE_TYPES, extractAgentReferences } from './references';

export const agentsReferenceLookupSchema = z.object({
  type: z.enum(AGENT_REFERENCE_TYPES),
  id: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
});
const fieldsByType: Record<
  z.infer<typeof agentsReferenceLookupSchema>['type'],
  string[]
> = {
  customer: ['firstName', 'lastName', 'primaryEmail', 'primaryPhone', 'code'],
  company: ['primaryName', 'names', 'primaryEmail'],
  user: ['username', 'email'],
  product: ['name', 'code'],
  branch: ['title', 'code'],
  department: ['title', 'code'],
  unit: ['title', 'code'],
  brand: ['name'],
  deal: ['name', 'boardId'],
  conversation: ['content'],
};
const scalarSelection = (type: GraphQLObjectType, names: string[]): string[] =>
  names.filter((name) => {
    const field = type.getFields()[name];
    return (
      field &&
      (isScalarType(getNamedType(field.type)) ||
        isEnumType(getNamedType(field.type)))
    );
  });
/** The operation names are platform contracts, not model input. Verify them
 * against the live schema and fail closed when a service/type is unavailable. */
export const referenceLookupOperation = (
  field: GraphQLField<unknown, unknown> | undefined,
  expected: string,
): string | undefined => {
  if (!field) return undefined;
  const type = getNamedType(field.type);
  const id = field.args.find((argument) => argument.name === '_id');
  if (
    !isObjectType(type) ||
    AGENTS_GRAPHQL_RECORD_TYPES[type.name] !== expected ||
    !id ||
    !type.getFields()._id
  )
    return undefined;
  const selections = scalarSelection(type, [
    '_id',
    ...fieldsByType[expected as keyof typeof fieldsByType],
  ]);
  if (expected === 'user') {
    const details = type.getFields().details;
    const detailsType = details && getNamedType(details.type);
    if (
      detailsType &&
      isObjectType(detailsType) &&
      scalarSelection(detailsType, ['fullName']).length
    )
      selections.push('details { fullName }');
  }
  if (expected === 'deal') {
    const pipeline = type.getFields().pipeline;
    const pipelineType = pipeline && getNamedType(pipeline.type);
    if (
      pipelineType &&
      isObjectType(pipelineType) &&
      pipelineType.getFields()._id
    )
      selections.push(
        `pipeline { ${scalarSelection(pipelineType, ['_id', 'boardId']).join(
          ' ',
        )} }`,
      );
  }
  return `query AgentsResolveReference($id: ${id.type.toString()}) { node: ${
    field.name
  }(_id: $id) { ${selections.join(' ')} } }`;
};
export const resolveAgentsReference = async (
  identity: { subdomain: string; userId: string },
  input: z.infer<typeof agentsReferenceLookupSchema>,
) => {
  const schema = await loadMergedSchema();
  const field = schema?.getQueryType()?.getFields()[`${input.type}Detail`];
  const query = referenceLookupOperation(field, input.type);
  if (!query) return undefined;
  const { RequestContext } = await import('@mastra/core/request-context');
  const { noopObserve } = await import('@mastra/core/tools');
  const requestContext = new RequestContext();
  requestContext.set('subdomain', identity.subdomain);
  requestContext.set('userId', identity.userId);
  requestContext.set('approvalMode', 'writes');
  const { callGraphql } = await buildGraphqlTools();
  if (!callGraphql.execute) return undefined;
  const raw = await callGraphql.execute(
    {
      query,
      variables: { id: input.id },
      operationName: 'AgentsResolveReference',
    },
    { requestContext, observe: noopObserve },
  );
  const parsed = z
    .object({
      status: z.literal('ok'),
      data: z.object({ node: z.object({ _id: z.string() }).passthrough() }),
    })
    .safeParse(raw);
  if (!parsed.success || parsed.data.data.node._id !== input.id)
    return undefined;
  const node = parsed.data.data.node;
  const token = extractAgentReferences(input.type, node)[0];
  const label = token?.match(/^\[\[[^:]+:[^:]+:(.*)\]\]$/)?.[1];
  if (!label) return undefined;
  let location: { boardId: string; pipelineId: string } | undefined;
  if (input.type === 'deal') {
    const pipeline = z
      .object({ _id: z.string(), boardId: z.string().nullish() })
      .safeParse(node.pipeline);
    const boardId =
      typeof node.boardId === 'string' && node.boardId
        ? node.boardId
        : pipeline.success
        ? pipeline.data.boardId
        : undefined;
    if (
      !boardId ||
      !pipeline.success ||
      !/^[A-Za-z0-9_-]{1,64}$/.test(boardId) ||
      !/^[A-Za-z0-9_-]{1,64}$/.test(pipeline.data._id)
    )
      return undefined;
    location = { boardId, pipelineId: pipeline.data._id };
  }
  return {
    type: input.type,
    id: input.id,
    label,
    ...(location ? { location } : {}),
  };
};
