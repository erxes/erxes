import { Model } from 'mongoose';
import { getCollection, watchItem, boardNumberGenerator } from './utils';
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
import { configReplacer } from '../utils';
import { putActivityLog } from '../logUtils';
import { IModels } from '../connectionResolver';
import {
  sendCoreMessage,
  sendFormsMessage,
  sendInternalNotesMessage
} from '../messageBroker';
import { updateOrder, IOrderInput } from '@erxes/api-utils/src/commonUtils';

// Not mongoose document, just stage shaped plain object
type IPipelineStage = IStage & { _id: string };

const removeStageWithItems = async (
  models: IModels,
  type: string,
  pipelineId: string,
  prevItemIds: string[] = []
) => {
  const selector = { pipelineId, _id: { $nin: prevItemIds } };

  const stageIds = await models.Stages.find(selector).distinct('_id');

  const { collection } = getCollection(models, type);

  await collection.deleteMany({ stageId: { $in: stageIds } });

  return models.Stages.deleteMany(selector);
};

const removeItems = async (
  models: IModels,
  subdomain: string,
  type: string,
  stageIds: string[]
) => {
  const { collection } = getCollection(models, type);

  const items = await collection.find(
    { stageId: { $in: stageIds } },
    { _id: 1 }
  );

  const itemIds = items.map((i) => i._id);

  await putActivityLog(subdomain, {
    action: 'removeActivityLogs',
    data: { type, itemIds }
  });

  await models.Checklists.removeChecklists(type, itemIds);

  sendCoreMessage({
    subdomain,
    action: 'conformities.removeConformities',
    data: {
      mainType: type,
      mainTypeIds: itemIds
    }
  });

  sendInternalNotesMessage({ subdomain, action: 'remove', data: itemIds });

  await collection.deleteMany({ stageId: { $in: stageIds } });
};

const removePipelineStagesWithItems = async (
  models: IModels,
  subdomain: string,
  type: string,
  pipelineId: string
) => {
  const stageIds = await models.Stages.find({ pipelineId }).distinct('_id');

  await removeItems(models, subdomain, type, stageIds);

  return models.Stages.deleteMany({ pipelineId });
};

const removeStageItems = async (
  models: IModels,
  subdomain: string,
  type: string,
  stageId: string
) => {
  await removeItems(models, subdomain, type, [stageId]);
};

const createOrUpdatePipelineStages = async (
  models: IModels,
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
  const prevItemIds = stages.map((stage) => stage._id);
  // fetch stage from database
  const prevEntries = await models.Stages.find({ _id: { $in: prevItemIds } });
  const prevEntriesIds = prevEntries.map((entry) => entry._id);

  await removeStageWithItems(models, type, pipelineId, prevItemIds);

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
      const createdStage = await models.Stages.createStage(doc);
      validStageIds.push(createdStage._id);
    }
  }

  if (bulkOpsPrevEntry.length > 0) {
    await models.Stages.bulkWrite(bulkOpsPrevEntry);
  }

  return models.Stages.deleteMany({ pipelineId, _id: { $nin: validStageIds } });
};

// pipeline lastNum generater
const generateLastNum = async (models: IModels, doc: IPipeline) => {
  const replacedConfig = await configReplacer(doc.numberConfig);
  const re = replacedConfig + '[0-9]+$';

  const pipeline = await models.Pipelines.findOne({
    lastNum: new RegExp(re),
    type: doc.type
  });

  if (pipeline) {
    return pipeline.lastNum;
  }

  const { collection } = await getCollection(models, doc.type);

  const item = await collection
    .findOne({
      number: new RegExp(re)
    })
    .sort({ createdAt: -1 });

  if (item) {
    return item.number;
  }

  // generate new number by new numberConfig
  const generatedNum = await boardNumberGenerator(
    models,
    doc.numberConfig || '',
    doc.numberSize || '',
    true
  );

  return generatedNum;
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

export const loadBoardClass = (models: IModels, subdomain: string) => {
  class Board {
    /*
     * Get a Board
     */
    public static async getBoard(_id: string) {
      const board = await models.Boards.findOne({ _id });

      if (!board) {
        throw new Error('Board not found');
      }

      return board;
    }

    /**
     * Create a board
     */
    public static async createBoard(doc: IBoard) {
      return models.Boards.create(doc);
    }

    /**
     * Update Board
     */
    public static async updateBoard(_id: string, doc: IBoard) {
      await models.Boards.updateOne({ _id }, { $set: doc });

      return models.Boards.findOne({ _id });
    }

    /**
     * Remove Board
     */
    public static async removeBoard(_id: string) {
      const board = await models.Boards.findOne({ _id });

      if (!board) {
        throw new Error('Board not found');
      }

      const pipelines = await models.Pipelines.find({ boardId: _id });

      for (const pipeline of pipelines) {
        await removePipelineStagesWithItems(
          models,
          subdomain,
          pipeline.type,
          pipeline._id
        );
      }

      for (const pipeline of pipelines) {
        await models.Pipelines.removePipeline(pipeline._id, true);
      }

      return models.Boards.deleteOne({ _id });
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

      const { collection } = getCollection(models, type);

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

export const loadPipelineClass = (models: IModels, subdomain: string) => {
  class Pipeline {
    /*
     * Get a pipeline
     */
    public static async getPipeline(_id: string) {
      const pipeline = await models.Pipelines.findOne({ _id }).lean();

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
      if (doc.numberSize) {
        doc.lastNum = await generateLastNum(models, doc);
      }

      const pipeline = await models.Pipelines.create(doc);

      if (doc.templateId) {
        const duplicatedStages = await getDuplicatedStages(models, subdomain, {
          templateId: doc.templateId,
          pipelineId: pipeline._id,
          type: doc.type
        });

        await createOrUpdatePipelineStages(
          models,
          duplicatedStages,
          pipeline._id,
          pipeline.type
        );
      } else if (stages) {
        await createOrUpdatePipelineStages(
          models,
          stages,
          pipeline._id,
          pipeline.type
        );
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
        const pipeline = await models.Pipelines.getPipeline(_id);

        if (doc.templateId !== pipeline.templateId) {
          const duplicatedStages = await getDuplicatedStages(
            models,
            subdomain,
            {
              templateId: doc.templateId,
              pipelineId: _id,
              type: doc.type
            }
          );

          await createOrUpdatePipelineStages(
            models,
            duplicatedStages,
            _id,
            doc.type
          );
        }
      } else if (stages) {
        await createOrUpdatePipelineStages(models, stages, _id, doc.type);
      }

      if (doc.numberSize) {
        const pipeline = await models.Pipelines.getPipeline(_id);

        if (pipeline.numberConfig !== doc.numberConfig) {
          doc.lastNum = await generateLastNum(models, doc);
        }
      }

      await models.Pipelines.updateOne({ _id }, { $set: doc });

      return models.Pipelines.findOne({ _id });
    }

    /*
     * Update given pipelines orders
     */
    public static async updateOrder(orders: IOrderInput[]) {
      return updateOrder(models.Pipelines, orders);
    }

    /**
     * Remove a pipeline
     */
    public static async removePipeline(_id: string, checked?: boolean) {
      const pipeline = await models.Pipelines.getPipeline(_id);

      if (!checked) {
        await removePipelineStagesWithItems(
          models,
          subdomain,
          pipeline.type,
          pipeline._id
        );
      }

      const stages = await models.Stages.find({ pipelineId: pipeline._id });

      for (const stage of stages) {
        await models.Stages.removeStage(stage._id);
      }

      return models.Pipelines.deleteOne({ _id });
    }

    /**
     * Archive a pipeline
     */
    public static async archivePipeline(_id: string) {
      const pipeline = await models.Pipelines.getPipeline(_id);
      const status =
        pipeline.status === BOARD_STATUSES.ACTIVE
          ? BOARD_STATUSES.ARCHIVED
          : BOARD_STATUSES.ACTIVE;

      await models.Pipelines.updateOne({ _id }, { $set: { status } });
    }

    public static watchPipeline(_id: string, isAdd: boolean, userId: string) {
      return watchItem(models.Pipelines, _id, isAdd, userId);
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
  checkCodeDuplication(code: string): string;
}

export const loadStageClass = (models: IModels, subdomain: string) => {
  class Stage {
    /*
     * Get a stage
     */
    public static async getStage(_id: string) {
      const stage = await models.Stages.findOne({ _id });

      if (!stage) {
        throw new Error('Stage not found');
      }

      return stage;
    }

    static async checkCodeDuplication(code: string) {
      const stage = await models.Stages.findOne({
        code
      });

      if (stage) {
        throw new Error('Code must be unique');
      }
    }

    /**
     * Create a stage
     */
    public static async createStage(doc: IStage) {
      if (doc.code) {
        await this.checkCodeDuplication(doc.code);
      }
      return models.Stages.create(doc);
    }

    /**
     * Update Stage
     */
    public static async updateStage(_id: string, doc: IStage) {
      if (doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      await models.Stages.updateOne({ _id }, { $set: doc });

      return models.Stages.findOne({ _id });
    }

    /*
     * Update given stages orders
     */
    public static async updateOrder(orders: IOrderInput[]) {
      return updateOrder(models.Stages, orders);
    }

    public static async removeStage(_id: string) {
      const stage = await models.Stages.getStage(_id);
      const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);

      await removeStageItems(models, subdomain, pipeline.type, _id);

      if (stage.formId) {
        await sendFormsMessage({
          subdomain,
          action: 'removeForm',
          data: {
            formId: stage.formId
          }
        });
      }

      return models.Stages.deleteOne({ _id });
    }
  }

  stageSchema.loadClass(Stage);

  return stageSchema;
};
