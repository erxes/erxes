import {
  decideSegmentNode,
  SegmentNode,
  SegmentOperator,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

/**
 * Rewrites stage-derived conditions into the stages they name.
 *
 * A deal stores only `stageId`; pipeline, board and probability hang off the
 * stage, so a filter on one of them cannot be compiled against the deal
 * collection. Resolving the matching stages first turns it into a condition
 * the collection can answer, which is what lets "count deals whose stage
 * probability is Won" narrow an aggregation instead of being dropped.
 *
 * The stages are decided with the shared evaluator rather than a second
 * operator table here, so the rewrite cannot drift from what the same
 * condition means anywhere else.
 */

const DEAL_TYPE = 'sales:sales.deals';

export const STAGE_DERIVED_FIELDS = [
  'pipelineId',
  'boardId',
  'stageProbability',
];

const isStageDerived = (node: SegmentNode): boolean =>
  node.kind === 'field' &&
  node.contentType === DEAL_TYPE &&
  STAGE_DERIVED_FIELDS.includes(node.fieldKey);

const hasStageDerived = (node: SegmentNode): boolean => {
  if (node.kind === 'group') {
    return node.children.some(hasStageDerived);
  }

  return isStageDerived(node);
};

type StageFacts = { _id: string; values: Map<string, unknown> };

/** Each stage's derived values, keyed the way the evaluator looks them up. */
const gatherStageFacts = async (models: IModels): Promise<StageFacts[]> => {
  const stages = await models.Stages.find(
    {},
    { _id: 1, pipelineId: 1, probability: 1 },
  ).lean();

  const pipelineIds = [
    ...new Set(stages.map((stage) => stage.pipelineId).filter(Boolean)),
  ];

  const pipelines = await models.Pipelines.find(
    { _id: { $in: pipelineIds } },
    { _id: 1, boardId: 1 },
  ).lean();

  const boardByPipeline = new Map(
    pipelines.map((pipeline) => [pipeline._id, pipeline.boardId]),
  );

  return stages.map((stage) => ({
    _id: stage._id,
    values: new Map<string, unknown>([
      [`${DEAL_TYPE}.pipelineId`, stage.pipelineId],
      [`${DEAL_TYPE}.stageProbability`, stage.probability],
      [
        `${DEAL_TYPE}.boardId`,
        stage.pipelineId ? boardByPipeline.get(stage.pipelineId) : undefined,
      ],
    ]),
  }));
};

const rewriteNode = (node: SegmentNode, stages: StageFacts[]): SegmentNode => {
  if (node.kind === 'group') {
    return {
      ...node,
      children: node.children.map((child) => rewriteNode(child, stages)),
    };
  }

  if (!isStageDerived(node)) {
    return node;
  }

  const matching = stages
    .filter(
      (stage) =>
        decideSegmentNode(node, { values: stage.values }) === 'matched',
    )
    .map((stage) => stage._id);

  // No stage matching is a real answer: no deal can satisfy the condition.
  // `In` with an empty list says exactly that, where dropping the node would
  // have counted every deal instead.
  return {
    kind: 'field',
    contentType: DEAL_TYPE,
    fieldKey: 'stageId',
    operator: SegmentOperator.In,
    value: matching,
  };
};

/**
 * Returns the tree with every stage-derived condition replaced, or the tree
 * unchanged when it has none - so the stage lookup only runs when it is needed.
 */
export const resolveStageDerivedNode = async (
  models: IModels,
  node: SegmentNode,
): Promise<SegmentNode> => {
  if (!hasStageDerived(node)) {
    return node;
  }

  return rewriteNode(node, await gatherStageFacts(models));
};
