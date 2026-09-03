import {
  decideSegmentNode,
  SegmentNode,
  SegmentOperator,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

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

  return {
    kind: 'field',
    contentType: DEAL_TYPE,
    fieldKey: 'stageId',
    operator: SegmentOperator.In,
    value: matching,
  };
};

export const resolveStageDerivedNode = async (
  models: IModels,
  node: SegmentNode,
): Promise<SegmentNode> => {
  if (!hasStageDerived(node)) {
    return node;
  }

  return rewriteNode(node, await gatherStageFacts(models));
};
