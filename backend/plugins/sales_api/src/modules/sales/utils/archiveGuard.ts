import { ExpectedError } from 'erxes-api-shared/utils';
import type { IModels } from '~/connectionResolvers';
import { SALES_STATUSES } from '../constants';

type ArchiveEntity = {
  _id: string;
  name?: string;
  status?: string;
};

type DealArchiveState = ArchiveEntity & { stageId: string };
type ArchiveEntityType = 'board' | 'pipeline' | 'stage' | 'deal';

export class SalesArchiveError extends ExpectedError {
  readonly extensions: {
    code: string;
    entityType: ArchiveEntityType;
    entityId: string;
  };

  constructor(
    entityType: ArchiveEntityType,
    entity: ArchiveEntity,
    inProgress = false,
  ) {
    const code = inProgress
      ? 'SALES_BOARD_ARCHIVING'
      : `SALES_${entityType.toUpperCase()}_ARCHIVED`;
    const message = inProgress
      ? `This board has an unfinished archive: "${
          entity.name || entity._id
        }". Finish archiving it before adding or moving records here.`
      : `This ${entityType} is archived: "${entity.name || entity._id}". ${
          entityType === 'deal'
            ? 'Restore the deal to an active destination before changing it.'
            : `Choose an active ${entityType}.`
        }`;
    super(message, code);
    Object.setPrototypeOf(this, new.target.prototype);
    this.extensions = { code, entityType, entityId: entity._id };
  }
}

const assertActive = (
  entityType: ArchiveEntityType,
  entity: ArchiveEntity,
): void => {
  if (entity.status === SALES_STATUSES.ARCHIVED) {
    throw new SalesArchiveError(entityType, entity);
  }
};

export const assertBoardIsActive = async (
  models: IModels,
  boardId: string,
): Promise<void> => {
  const board = await models.Boards.getBoard(boardId);
  assertActive('board', board);
  if (board.archiveInProgress)
    throw new SalesArchiveError('board', board, true);
};

export const assertPipelineIsActive = async (
  models: IModels,
  pipelineId: string,
): Promise<void> => {
  const pipeline = await models.Pipelines.getPipeline(pipelineId);
  await assertBoardIsActive(models, pipeline.boardId);
  assertActive('pipeline', pipeline);
};

export const assertDealBoardIsActive = async (
  models: IModels,
  stageId: string,
): Promise<void> => {
  const stage = await models.Stages.getStage(stageId);
  await assertPipelineIsActive(models, stage.pipelineId);
  assertActive('stage', stage);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const protectedPath = (path: string): boolean =>
  ['stageId', 'status'].includes(path.split('.')[0]);

const readUpdate = (modifier: unknown) => {
  if (!isRecord(modifier)) {
    throw new ExpectedError('Deal update must be an object.', 'BAD_USER_INPUT');
  }
  const fields: string[] = [];
  const values: Record<string, unknown> = {};
  for (const [operator, update] of Object.entries(modifier)) {
    if (!operator.startsWith('$')) {
      if (
        protectedPath(operator) &&
        !['stageId', 'status'].includes(operator)
      ) {
        throw new ExpectedError(
          'Invalid deal stageId or status path.',
          'BAD_USER_INPUT',
        );
      }
      fields.push(operator);
      values[operator] = update;
      continue;
    }
    if (!isRecord(update)) {
      throw new ExpectedError(
        'Invalid deal update operator.',
        'BAD_USER_INPUT',
      );
    }
    for (const [path, value] of Object.entries(update)) {
      fields.push(path);
      if (operator === '$rename' && typeof value === 'string')
        fields.push(value);
      if (
        (protectedPath(path) &&
          (operator !== '$set' || !['stageId', 'status'].includes(path))) ||
        (operator === '$rename' &&
          typeof value === 'string' &&
          protectedPath(value))
      ) {
        throw new ExpectedError(
          'Deal stageId and status can only be changed with explicit values.',
          'BAD_USER_INPUT',
        );
      }
      if (operator === '$set') values[path] = value;
    }
  }
  if (
    values.stageId !== undefined &&
    (typeof values.stageId !== 'string' || !values.stageId.trim())
  ) {
    throw new ExpectedError(
      'A valid destination stage is required.',
      'BAD_USER_INPUT',
    );
  }
  if (
    values.status !== undefined &&
    (typeof values.status !== 'string' ||
      ![SALES_STATUSES.ACTIVE, SALES_STATUSES.ARCHIVED].includes(values.status))
  ) {
    throw new ExpectedError('Invalid deal status.', 'BAD_USER_INPUT');
  }
  return { fields, values };
};

export const assertDealUpdatesAllowed = async (
  models: IModels,
  deals: readonly DealArchiveState[],
  modifier: unknown,
  { allowRestore = false } = {},
): Promise<void> => {
  const { fields, values } = readUpdate(modifier);
  const stageIds = new Set<string>();
  for (const deal of deals) {
    const restoring =
      allowRestore &&
      deal.status === SALES_STATUSES.ARCHIVED &&
      values.status === SALES_STATUSES.ACTIVE;
    if (deal.status === SALES_STATUSES.ARCHIVED && !restoring) {
      throw new SalesArchiveError('deal', deal);
    }
    const archiving =
      values.status === SALES_STATUSES.ARCHIVED &&
      fields.every((path) =>
        ['status', 'modifiedBy', 'modifiedAt'].includes(path),
      );
    if (archiving) continue;
    if (!restoring) stageIds.add(deal.stageId);
    stageIds.add(
      typeof values.stageId === 'string' ? values.stageId : deal.stageId,
    );
  }
  for (const stageId of stageIds)
    await assertDealBoardIsActive(models, stageId);
};
