import { Model, model } from 'mongoose';
import { ACTIVITY_LOG_ACTIONS, putActivityLog } from '../../data/logUtils';
import { Checklists, Conformities, Forms, InternalNotes } from './';
import { getCollection, updateOrder, watchItem } from './boardUtils';
import {
  boardSchema,
  IBoard,
  IBoardDocument,
  IPipeline,
  IPipelineDocument,
  IStage,
  IStageDocument,
  pipelineSchema,
  stageSchema
} from './definitions/boards';
import { BOARD_STATUSES } from './definitions/constants';
import { getDuplicatedStages } from './PipelineTemplates';

export interface IOrderInput {
  _id: string;
  order: number;
}

// Not mongoose document, just stage shaped plain object
type IPipelineStage = IStage & { _id: string };

const removeStageWithItems = async (
  type: string,
  pipelineId: string,
  prevItemIds: string[] = []
) => {
  const selector = { pipelineId, _id: { $nin: prevItemIds } };

  const stageIds = await Stages.find(selector).distinct('_id');

  const { collection } = getCollection(type);

  await collection.deleteMany({ stageId: { $in: stageIds } });

  return Stages.deleteMany(selector);
};

const removeItems = async (type: string, stageIds: string[]) => {
  const { collection } = getCollection(type);

  const items = await collection.find(
    { stageId: { $in: stageIds } },
    { _id: 1 }
  );
  const itemIds = items.map(i => i._id);

  await putActivityLog({
    action: ACTIVITY_LOG_ACTIONS.REMOVE_ACTIVITY_LOGS,
    data: { type, itemIds }
  });
  await Checklists.removeChecklists(type, itemIds);
  await Conformities.removeConformities({
    mainType: type,
    mainTypeIds: itemIds
  });
  await InternalNotes.removeInternalNotes(type, itemIds);

  await collection.deleteMany({ stageId: { $in: stageIds } });
};

const removePipelineStagesWithItems = async (
  type: string,
  pipelineId: string
) => {
  const stageIds = await Stages.find({ pipelineId }).distinct('_id');

  await removeItems(type, stageIds);

  return Stages.deleteMany({ pipelineId });
};

const removeStageItems = async (type: string, stageId: string) => {
  await removeItems(type, [stageId]);
};

const createOrUpdatePipelineStages = async (
  stages: IPipelineStage[],
  pipelineId: string,
  type: string
) => {
  let order = 0;

  const validStageIds: string[] = [];
  const bulkOpsPrevEntry: Array<{
    updateOne: {
      filter: { _id: string };
      update: { $set: IStage };
    };
  }> = [];
  const prevItemIds = stages.map(stage => stage._id);
  // fetch stage from database
  const prevEntries = await Stages.find({ _id: { $in: prevItemIds } });
  const prevEntriesIds = prevEntries.map(entry => entry._id);

  await removeStageWithItems(type, pipelineId, prevItemIds);

  for (const stage of stages) {
    order++;

    const doc: any = { ...stage, order, pipelineId };

    const _id = doc._id;

    const prevEntry = prevEntriesIds.includes(_id);

    // edit
    if (prevEntry) {
      validStageIds.push(_id);

      bulkOpsPrevEntry.push({
        updateOne: {
          filter: {
            _id
          },
          update: {
            $set: doc
          }
        }
      });
      // create
    } else {
      delete doc._id;
      const createdStage = await Stages.createStage(doc);
      validStageIds.push(createdStage._id);
    }
  }

  if (bulkOpsPrevEntry.length > 0) {
    await Stages.bulkWrite(bulkOpsPrevEntry);
  }

  return Stages.deleteMany({ pipelineId, _id: { $nin: validStageIds } });
};

export interface IBoardModel extends Model<IBoardDocument> {
  getBoard(_id: string): Promise<IBoardDocument>;
  createBoard(doc: IBoard): Promise<IBoardDocument>;
  updateBoard(_id: string, doc: IBoard): Promise<IBoardDocument>;
  removeBoard(_id: string): object;
  updateTimeTracking(
    _id: string,
    type: string,
    status: string,
    timeSpent: number,
    startDate: string
  ): Promise<any>;
}

export const loadBoardClass = () => {
  class Board {
    /*
     * Get a Board
     */
    public static async getBoard(_id: string) {
      const board = await Boards.findOne({ _id });

      if (!board) {
        throw new Error('Board not found');
      }

      return board;
    }

    /**
     * Create a board
     */
    public static async createBoard(doc: IBoard) {
      return Boards.create(doc);
    }

    /**
     * Update Board
     */
    public static async updateBoard(_id: string, doc: IBoard) {
      await Boards.updateOne({ _id }, { $set: doc });

      return Boards.findOne({ _id });
    }

    /**
     * Remove Board
     */
    public static async removeBoard(_id: string) {
      const board = await Boards.findOne({ _id });

      if (!board) {
        throw new Error('Board not found');
      }

      const pipelines = await Pipelines.find({ boardId: _id });

      for (const pipeline of pipelines) {
        await removePipelineStagesWithItems(pipeline.type, pipeline._id);
      }

      for (const pipeline of pipelines) {
        await Pipelines.removePipeline(pipeline._id, true);
      }

      return Boards.deleteOne({ _id });
    }

    public static async updateTimeTracking(
      _id: string,
      type: string,
      status: string,
      timeSpent: number,
      startDate?: string
    ) {
      const doc: { status: string; timeSpent: number; startDate?: string } = {
        status,
        timeSpent
      };

      if (startDate) {
        doc.startDate = startDate;
      }

      const { collection } = getCollection(type);

      await collection.updateOne({ _id }, { $set: { timeTrack: doc } });

      return collection.findOne({ _id }).lean();
    }
  }

  boardSchema.loadClass(Board);

  return boardSchema;
};

export interface IPipelineModel extends Model<IPipelineDocument> {
  getPipeline(_id: string): Promise<IPipelineDocument>;
  createPipeline(
    doc: IPipeline,
    stages?: IPipelineStage[]
  ): Promise<IPipelineDocument>;
  updatePipeline(
    _id: string,
    doc: IPipeline,
    stages?: IPipelineStage[]
  ): Promise<IPipelineDocument>;
  updateOrder(orders: IOrderInput[]): Promise<IPipelineDocument[]>;
  watchPipeline(_id: string, isAdd: boolean, userId: string): void;
  removePipeline(_id: string, checked?: boolean): object;
  archivePipeline(_id: string, status?: string): object;
}

export const loadPipelineClass = () => {
  class Pipeline {
    /*
     * Get a pipeline
     */
    public static async getPipeline(_id: string) {
      const pipeline = await Pipelines.findOne({ _id }).lean();

      if (!pipeline) {
        throw new Error('Pipeline not found');
      }

      return pipeline;
    }

    /**
     * Create a pipeline
     */
    public static async createPipeline(
      doc: IPipeline,
      stages?: IPipelineStage[]
    ) {
      const pipeline = await Pipelines.create(doc);

      if (doc.templateId) {
        const duplicatedStages = await getDuplicatedStages({
          templateId: doc.templateId,
          pipelineId: pipeline._id,
          type: doc.type
        });

        await createOrUpdatePipelineStages(
          duplicatedStages,
          pipeline._id,
          pipeline.type
        );
      } else if (stages) {
        await createOrUpdatePipelineStages(stages, pipeline._id, pipeline.type);
      }

      return pipeline;
    }

    /**
     * Update a pipeline
     */
    public static async updatePipeline(
      _id: string,
      doc: IPipeline,
      stages?: IPipelineStage[]
    ) {
      if (doc.templateId) {
        const pipeline = await Pipelines.getPipeline(_id);

        if (doc.templateId !== pipeline.templateId) {
          const duplicatedStages = await getDuplicatedStages({
            templateId: doc.templateId,
            pipelineId: _id,
            type: doc.type
          });

          await createOrUpdatePipelineStages(duplicatedStages, _id, doc.type);
        }
      } else if (stages) {
        await createOrUpdatePipelineStages(stages, _id, doc.type);
      }

      await Pipelines.updateOne({ _id }, { $set: doc });

      return Pipelines.findOne({ _id });
    }

    /*
     * Update given pipelines orders
     */
    public static async updateOrder(orders: IOrderInput[]) {
      return updateOrder(Pipelines, orders);
    }

    /**
     * Remove a pipeline
     */
    public static async removePipeline(_id: string, checked?: boolean) {
      const pipeline = await Pipelines.getPipeline(_id);

      if (!checked) {
        await removePipelineStagesWithItems(pipeline.type, pipeline._id);
      }

      const stages = await Stages.find({ pipelineId: pipeline._id });

      for (const stage of stages) {
        await Stages.removeStage(stage._id);
      }

      return Pipelines.deleteOne({ _id });
    }

    /**
     * Archive a pipeline
     */
    public static async archivePipeline(_id: string) {
      const pipeline = await Pipelines.getPipeline(_id);
      const status =
        pipeline.status === BOARD_STATUSES.ACTIVE
          ? BOARD_STATUSES.ARCHIVED
          : BOARD_STATUSES.ACTIVE;

      await Pipelines.updateOne({ _id }, { $set: { status } });
    }

    public static watchPipeline(_id: string, isAdd: boolean, userId: string) {
      return watchItem(Pipelines, _id, isAdd, userId);
    }
  }

  pipelineSchema.loadClass(Pipeline);

  return pipelineSchema;
};

export interface IStageModel extends Model<IStageDocument> {
  getStage(_id: string): Promise<IStageDocument>;
  createStage(doc: IStage): Promise<IStageDocument>;
  removeStage(_id: string): object;
  updateStage(_id: string, doc: IStage): Promise<IStageDocument>;
  updateOrder(orders: IOrderInput[]): Promise<IStageDocument[]>;
}

export const loadStageClass = () => {
  class Stage {
    /*
     * Get a stage
     */
    public static async getStage(_id: string) {
      const stage = await Stages.findOne({ _id });

      if (!stage) {
        throw new Error('Stage not found');
      }

      return stage;
    }

    /**
     * Create a stage
     */
    public static createStage(doc: IStage) {
      return Stages.create(doc);
    }

    /**
     * Update Stage
     */
    public static async updateStage(_id: string, doc: IStage) {
      await Stages.updateOne({ _id }, { $set: doc });

      return Stages.findOne({ _id });
    }

    /*
     * Update given stages orders
     */
    public static async updateOrder(orders: IOrderInput[]) {
      return updateOrder(Stages, orders);
    }

    public static async removeStage(_id: string) {
      const stage = await Stages.getStage(_id);
      const pipeline = await Pipelines.getPipeline(stage.pipelineId);

      await removeStageItems(pipeline.type, _id);

      if (stage.formId) {
        await Forms.removeForm(stage.formId);
      }

      return Stages.deleteOne({ _id });
    }
  }

  stageSchema.loadClass(Stage);

  return stageSchema;
};

loadBoardClass();
loadPipelineClass();
loadStageClass();

// tslint:disable-next-line
const Boards = model<IBoardDocument, IBoardModel>('boards', boardSchema);

// tslint:disable-next-line
const Pipelines = model<IPipelineDocument, IPipelineModel>(
  'pipelines',
  pipelineSchema
);

// tslint:disable-next-line
const Stages = model<IStageDocument, IStageModel>('stages', stageSchema);

export { Boards, Pipelines, Stages };
