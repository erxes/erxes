import { checkApprovalLock } from 'erxes-api-shared/core-modules';
import type { IUserDocument } from 'erxes-api-shared/core-types';
import { ExpectedError, sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IContext, IModels } from '~/connectionResolvers';
import { SALES_STATUSES } from '../constants';
import { getBoardLocalConnections } from './boardConnections';

export { assertBoardIsActive, assertDealBoardIsActive } from './archiveGuard';

export type BoardArchiveScope = {
  boardId: string;
  pipelineIds: string[];
  stageIds: string[];
};

export type BoardArchivePreview = {
  pipelineCount: number;
  dealCount: number;
  automationCount: number;
  posCount: number;
  paymentCount: number;
};

const SALES_TRIGGER_TYPES = [
  'sales:sales.deals',
  'sales:sales.deals.probability',
  'sales:sales.deals.stageChanged',
  'sales:sales.deal',
  'sales:sales.deal.probability',
  'sales:sales.deal.stageChanged',
];

export const assertBoardArchivePermissions = async (
  checkPermission: IContext['checkPermission'],
): Promise<void> => {
  for (const action of ['boardsArchive', 'pipelinesEdit', 'dealsArchive']) {
    await checkPermission(action);
  }
};

const activeBoardDealsFilter = (stageIds: string[]) => ({
  stageId: { $in: stageIds },
  status: { $ne: SALES_STATUSES.ARCHIVED },
});

const getBoardDescendants = async (
  models: IModels,
  boardId: string,
): Promise<Pick<BoardArchiveScope, 'pipelineIds' | 'stageIds'>> => {
  const pipelineIds: string[] = await models.Pipelines.find({
    boardId,
  }).distinct('_id');
  const stageIds: string[] = await models.Stages.find({
    pipelineId: { $in: pipelineIds },
  }).distinct('_id');
  return { pipelineIds, stageIds };
};

const sameIds = (left: string[], right: string[]): boolean => {
  const rightIds = new Set(right);
  return left.length === right.length && left.every((id) => rightIds.has(id));
};

export const boardAutomationFilter = ({
  boardId,
  pipelineIds,
  stageIds,
}: BoardArchiveScope): Record<string, unknown> => {
  const references = [
    { 'config.boardId': boardId },
    { 'config.pipelineId': { $in: pipelineIds } },
    ...['stageId', 'fromStageId', 'toStageId'].map((field) => ({
      [`config.${field}`]: { $in: stageIds },
    })),
  ];
  const unscopedSalesTrigger = {
    type: { $in: SALES_TRIGGER_TYPES },
    ...Object.fromEntries(
      ['boardId', 'pipelineId', 'stageId', 'fromStageId', 'toStageId'].map(
        (field) => [`config.${field}`, { $in: [null, ''] }],
      ),
    ),
  };

  return {
    status: 'active',
    $or: [
      {
        triggers: {
          $elemMatch: { $or: [...references, unscopedSalesTrigger] },
        },
      },
      { actions: { $elemMatch: { $or: references } } },
      { 'workflows.actions': { $elemMatch: { $or: references } } },
      ...['actions', 'workflows.actions'].map((path) => ({
        [path]: {
          $elemMatch: {
            $or: ['module', 'targetType', 'objectType'].map((field) => ({
              [`config.${field}`]: {
                $in: ['sales:deal', ...SALES_TRIGGER_TYPES],
              },
            })),
          },
        },
      })),
    ],
  };
};

export const getBoardArchiveScope = async (
  models: IModels,
  boardId: string,
): Promise<BoardArchiveScope> => {
  await models.Boards.getBoard(boardId);
  return { boardId, ...(await getBoardDescendants(models, boardId)) };
};

export const getBoardArchivePreview = async (
  models: IModels,
  subdomain: string,
  scope: BoardArchiveScope,
): Promise<BoardArchivePreview> => {
  const [pipelineCount, dealCount, automationCount, connections] =
    await Promise.all([
      models.Pipelines.countDocuments({
        _id: { $in: scope.pipelineIds },
        status: { $ne: SALES_STATUSES.ARCHIVED },
      }),
      models.Deals.countDocuments(activeBoardDealsFilter(scope.stageIds)),
      sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'automation',
        action: 'count',
        method: 'query',
        input: { query: boardAutomationFilter(scope) },
        defaultValue: 0,
        throwOnError: true,
      }),
      getBoardLocalConnections(models, scope),
    ]);
  if (
    typeof automationCount !== 'number' ||
    !Number.isSafeInteger(automationCount) ||
    automationCount < 0
  ) {
    throw new ExpectedError(
      'Could not check automation connections. Please try again.',
      'SERVICE_UNAVAILABLE',
    );
  }
  return { pipelineCount, dealCount, automationCount, ...connections };
};

export const assertBoardArchiveAccess = async (
  models: IModels,
  subdomain: string,
  scope: BoardArchiveScope,
  user: IUserDocument,
): Promise<void> => {
  const restrictedStages = await models.Stages.find({
    _id: { $in: scope.stageIds },
    'canEditMemberIds.0': { $exists: true },
    canEditMemberIds: { $ne: user._id },
  }).distinct('_id');
  if (
    restrictedStages.length &&
    (await models.Deals.exists(activeBoardDealsFilter(restrictedStages)))
  ) {
    throw new ExpectedError(
      'Some deals cannot be archived because their stage restricts editing.',
      'FORBIDDEN',
    );
  }

  const cursor = models.Deals.find(activeBoardDealsFilter(scope.stageIds))
    .select({ _id: 1, userId: 1 })
    .cursor();
  let batch: { _id: string; userId?: string }[] = [];
  const checkBatch = async (): Promise<void> => {
    const states = await checkApprovalLock.states({
      subdomain,
      userId: user._id,
      contentType: 'sales:deal',
      contentIds: batch.map((deal) => deal._id),
      ownerIdsByContentId: Object.fromEntries(
        batch.flatMap((deal) => (deal.userId ? [[deal._id, deal.userId]] : [])),
      ),
      action: 'archive',
    });
    const accessById = new Map(
      states.map((state) => [state.contentId, state.hasAccess]),
    );
    if (
      states.length !== batch.length ||
      batch.some((deal) => accessById.get(deal._id) !== true)
    ) {
      throw new ExpectedError(
        'Some deals are locked or their approval access could not be checked.',
        'FORBIDDEN',
      );
    }
  };
  try {
    for await (const deal of cursor) {
      batch.push({ _id: deal._id, userId: deal.userId });
      if (batch.length === 500) {
        await checkBatch();
        batch = [];
      }
    }
    if (batch.length) await checkBatch();
  } finally {
    await cursor.close();
  }
};

export const archiveBoardDescendants = async (
  models: IModels,
  scope: BoardArchiveScope,
  expectedDealCount: number,
  userId: string,
): Promise<void> => {
  const current = await getBoardDescendants(models, scope.boardId);
  const currentDealCount = await models.Deals.countDocuments(
    activeBoardDealsFilter(current.stageIds),
  );
  if (
    !sameIds(current.pipelineIds, scope.pipelineIds) ||
    !sameIds(current.stageIds, scope.stageIds) ||
    currentDealCount !== expectedDealCount
  ) {
    throw new ExpectedError(
      'Board contents changed during the archive check. Review the preview and try again.',
      'CONFLICT',
    );
  }
  await models.Deals.updateMany(activeBoardDealsFilter(scope.stageIds), {
    $set: {
      status: SALES_STATUSES.ARCHIVED,
      modifiedBy: userId,
      modifiedAt: new Date(),
    },
  });
  await models.Pipelines.updateMany(
    { boardId: scope.boardId, status: { $ne: SALES_STATUSES.ARCHIVED } },
    { $set: { status: SALES_STATUSES.ARCHIVED } },
  );
};
