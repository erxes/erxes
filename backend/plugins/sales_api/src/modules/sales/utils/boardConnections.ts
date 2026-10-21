import type { IModels } from '~/connectionResolvers';
import type { BoardArchiveScope } from './boardArchive';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const getBoardLocalConnections = async (
  models: IModels,
  scope: BoardArchiveScope,
): Promise<{ posCount: number; paymentCount: number }> => {
  const pipelineIds = new Set(scope.pipelineIds);
  const stageIds = new Set(scope.stageIds);
  const referencesBoard = (config: unknown): boolean =>
    isRecord(config) &&
    (config.boardId === scope.boardId ||
      (typeof config.pipelineId === 'string' &&
        pipelineIds.has(config.pipelineId)) ||
      (typeof config.stageId === 'string' && stageIds.has(config.stageId)));

  let posCount = 0;
  const cursor = models.Pos.find({})
    .select({ _id: 1, deliveryConfig: 1, cardsConfig: 1 })
    .cursor();
  try {
    for await (const pos of cursor) {
      const cards: unknown = pos.cardsConfig;
      if (
        referencesBoard(pos.deliveryConfig) ||
        (isRecord(cards) && Object.values(cards).some(referencesBoard))
      )
        posCount++;
    }
  } finally {
    await cursor.close();
  }

  const paymentIds: unknown[] = await models.Pipelines.distinct('paymentIds', {
    _id: { $in: scope.pipelineIds },
  });
  const paymentCount = paymentIds.filter(
    (id) => typeof id === 'string' && id.trim(),
  ).length;
  return { posCount, paymentCount };
};
