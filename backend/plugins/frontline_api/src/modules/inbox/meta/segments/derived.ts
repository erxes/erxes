import {
  decideSegmentNode,
  SegmentDerivedRequest,
  SegmentNode,
  SegmentOperator,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { CONVERSATION_TYPE } from './fields';

/**
 * The channel a conversation arrived through.
 *
 * A conversation stores only `integrationId`; the channel is the integration's
 * `kind`. Resolved once per distinct integration rather than once per
 * conversation - a tenant has a handful of integrations and can have millions
 * of conversations.
 */

const KIND_FIELD = 'integrationKind';

export const resolveIntegrationKind = async (
  models: IModels,
  requests: SegmentDerivedRequest[],
  subjectIds: string[],
): Promise<Record<string, Record<string, unknown>>> => {
  const mine = requests.filter((request) => request.fieldKey === KIND_FIELD);

  if (!mine.length || !subjectIds.length) {
    return {};
  }

  const conversations = await models.Conversations.find(
    { _id: { $in: subjectIds } },
    { _id: 1, integrationId: 1 },
  ).lean();

  const integrationIds = [
    ...new Set(
      conversations
        .map((conversation) => conversation.integrationId)
        .filter(Boolean),
    ),
  ];

  const integrations = await models.Integrations.find(
    { _id: { $in: integrationIds } },
    { _id: 1, kind: 1 },
  ).lean();

  const kindById = new Map(
    integrations.map((integration) => [integration._id, integration.kind]),
  );

  const values: Record<string, Record<string, unknown>> = {};

  for (const conversation of conversations) {
    const kind = conversation.integrationId
      ? kindById.get(conversation.integrationId)
      : undefined;

    if (kind === undefined) {
      continue;
    }

    for (const request of mine) {
      values[conversation._id] = {
        ...(values[conversation._id] || {}),
        [request.ref]: kind,
      };
    }
  }

  return values;
};

const isKindNode = (node: SegmentNode): boolean =>
  node.kind === 'field' &&
  node.contentType === CONVERSATION_TYPE &&
  node.fieldKey === KIND_FIELD;

const hasKindNode = (node: SegmentNode): boolean =>
  node.kind === 'group' ? node.children.some(hasKindNode) : isKindNode(node);

/**
 * Rewrites a channel condition into the integrations it names.
 *
 * A filter on the channel cannot be compiled against the conversation
 * collection, so the matching integrations are resolved first - which is what
 * lets "count conversations from Facebook" narrow a query instead of being
 * reported unanswerable.
 */
const rewrite = (
  node: SegmentNode,
  integrations: { _id: string; values: Map<string, unknown> }[],
): SegmentNode => {
  if (node.kind === 'group') {
    return {
      ...node,
      children: node.children.map((child) => rewrite(child, integrations)),
    };
  }

  if (!isKindNode(node)) {
    return node;
  }

  const matching = integrations
    .filter(
      (integration) =>
        decideSegmentNode(node, { values: integration.values }) === 'matched',
    )
    .map((integration) => integration._id);

  // No integration matching is a real answer: no conversation can satisfy it.
  // `In` with an empty list says exactly that, where dropping the node would
  // have counted every conversation instead.
  return {
    kind: 'field',
    contentType: CONVERSATION_TYPE,
    fieldKey: 'integrationId',
    operator: SegmentOperator.In,
    value: matching,
  };
};

export const resolveIntegrationKindNode = async (
  models: IModels,
  node: SegmentNode,
): Promise<SegmentNode> => {
  if (!hasKindNode(node)) {
    return node;
  }

  const integrations = await models.Integrations.find(
    {},
    { _id: 1, kind: 1 },
  ).lean();

  return rewrite(
    node,
    integrations.map((integration) => ({
      _id: integration._id,
      values: new Map<string, unknown>([
        [`${CONVERSATION_TYPE}.${KIND_FIELD}`, integration.kind],
      ]),
    })),
  );
};
