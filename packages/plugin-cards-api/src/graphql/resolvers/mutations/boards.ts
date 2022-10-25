import { bulkUpdateOrders, getCollection } from '../../../models/utils';
import {
  IBoard,
  IPipeline,
  IStage,
  IStageDocument
} from '../../../models/definitions/boards';
import { BOARD_STATUSES } from '../../../models/definitions/constants';
import { graphqlPubsub } from '../../../configs';
import { checkPermission } from '../../utils';

import { putCreateLog, putUpdateLog, putDeleteLog } from '../../../logUtils';
import { configReplacer } from '../../../utils';
import { IContext } from '../../../connectionResolver';
import { sendFormsMessage } from '../../../messageBroker';
import { IOrderInput } from '@erxes/api-utils/src/commonUtils';

interface IBoardsEdit extends IBoard {
  _id: string;
}

interface IPipelinesAdd extends IPipeline {
  stages: IStageDocument[];
}

interface IPipelinesEdit extends IPipelinesAdd {
  _id: string;
}

interface IStageEdit extends IStage {
  _id: string;
}

const checkNumberConfig = async (numberConfig: string, numberSize: string) => {
  if (!numberConfig) {
    throw new Error('Please input number configuration.');
  }

  if (!numberSize) {
    throw new Error('Please input fractional part.');
  }

  const replaced = await configReplacer(numberConfig);
  const re = /[0-9]$/;

  if (re.test(replaced)) {
    throw new Error(
      `Please make sure that the number configuration itself doesn't end with any number.`
    );
  }

  return;
};

const boardMutations = {
  /**
   * Create new board
   */
  async boardsAdd(
    _root,
    doc: IBoard,
    { user, models, subdomain, docModifier }: IContext
  ) {
    await checkPermission(models, subdomain, doc.type, user, 'boardsAdd');

    const extendedDoc = docModifier({ userId: user._id, ...doc });

    const board = await models.Boards.createBoard(extendedDoc);

    await putCreateLog(
      models,
      subdomain,
      {
        type: `${doc.type}Boards`,
        newData: extendedDoc,
        object: board
      },
      user
    );

    return board;
  },

  /**
   * Edit board
   */
  async boardsEdit(
    _root,
    { _id, ...doc }: IBoardsEdit,
    { user, models, subdomain }: IContext
  ) {
    await checkPermission(models, subdomain, doc.type, user, 'boardsEdit');

    const board = await models.Boards.getBoard(_id);
    const updated = await models.Boards.updateBoard(_id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: `${doc.type}Boards`,
        newData: doc,
        object: board,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Remove board
   */
  async boardsRemove(
    _root,
    { _id }: { _id: string },
    { models, subdomain, user }: IContext
  ) {
    const board = await models.Boards.getBoard(_id);

    await checkPermission(models, subdomain, board.type, user, 'boardsRemove');

    const removed = await models.Boards.removeBoard(_id);

    const relatedFieldsGroups = await sendFormsMessage({
      subdomain,
      action: 'fieldsGroups.find',
      data: {
        query: {
          boardIds: board._id
        }
      },
      isRPC: true,
      defaultValue: []
    });

    for (const fieldGroup of relatedFieldsGroups) {
      const boardIds = fieldGroup.boardIds || [];
      fieldGroup.boardIds = boardIds.filter(e => e !== board._id);

      await sendFormsMessage({
        subdomain,
        action: 'updateGroup',
        data: { groupId: fieldGroup._id, fieldGroup }
      });
    }

    await putDeleteLog(
      models,
      subdomain,
      { type: `${board.type}Boards`, object: board },
      user
    );

    return removed;
  },

  /**
   * Create new pipeline
   */
  async pipelinesAdd(
    _root,
    { stages, ...doc }: IPipelinesAdd,
    { user, models, subdomain }: IContext
  ) {
    await checkPermission(models, subdomain, doc.type, user, 'pipelinesAdd');

    if (doc.numberConfig || doc.numberSize) {
      await checkNumberConfig(doc.numberConfig || '', doc.numberSize || '');
    }

    const pipeline = await models.Pipelines.createPipeline(
      { userId: user._id, ...doc },
      stages
    );

    await putCreateLog(
      models,
      subdomain,
      {
        type: `${doc.type}Pipelines`,
        newData: doc,
        object: pipeline
      },
      user
    );

    return pipeline;
  },

  /**
   * Edit pipeline
   */
  async pipelinesEdit(
    _root,
    { _id, stages, ...doc }: IPipelinesEdit,
    { user, models, subdomain }: IContext
  ) {
    await checkPermission(models, subdomain, doc.type, user, 'pipelinesEdit');

    if (doc.numberConfig || doc.numberSize) {
      await checkNumberConfig(doc.numberConfig || '', doc.numberSize || '');
    }

    const pipeline = await models.Pipelines.getPipeline(_id);

    const updated = await models.Pipelines.updatePipeline(_id, doc, stages);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: `${doc.type}Pipelines`,
        newData: doc,
        object: pipeline,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Update pipeline orders
   */
  async pipelinesUpdateOrder(
    _root,
    { orders }: { orders: IOrderInput[] },
    { models }: IContext
  ) {
    return models.Pipelines.updateOrder(orders);
  },

  /**
   * Watch pipeline
   */
  async pipelinesWatch(
    _root,
    { _id, isAdd, type }: { _id: string; isAdd: boolean; type: string },
    { user, subdomain, models }: IContext
  ) {
    await checkPermission(models, subdomain, type, user, 'pipelinesWatch');

    return models.Pipelines.watchPipeline(_id, isAdd, user._id);
  },

  /**
   * Remove pipeline
   */
  async pipelinesRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const pipeline = await models.Pipelines.getPipeline(_id);

    await checkPermission(
      models,
      subdomain,
      pipeline.type,
      user,
      'pipelinesRemove'
    );

    const removed = await models.Pipelines.removePipeline(_id);

    const relatedFieldsGroups = await sendFormsMessage({
      subdomain,
      action: 'fieldsGroups.find',
      data: {
        query: {
          pipelineIds: pipeline._id
        }
      },
      isRPC: true,
      defaultValue: []
    });

    for (const fieldGroup of relatedFieldsGroups) {
      const pipelineIds = fieldGroup.pipelineIds || [];
      fieldGroup.pipelineIds = pipelineIds.filter(e => e !== pipeline._id);

      await sendFormsMessage({
        subdomain,
        action: 'updateGroup',
        data: {
          groupId: fieldGroup._id,
          fieldGroup
        }
      });
    }

    await putDeleteLog(
      models,
      subdomain,
      { type: `${pipeline.type}Pipelines`, object: pipeline },
      user
    );

    return removed;
  },

  /**
   * Archive pipeline
   */
  async pipelinesArchive(
    _root,
    { _id, status }: { _id; status: string },
    { user, models, subdomain }: IContext
  ) {
    const pipeline = await models.Pipelines.getPipeline(_id);

    await checkPermission(
      models,
      subdomain,
      pipeline.type,
      user,
      'pipelinesArchive'
    );

    const archived = await models.Pipelines.archivePipeline(_id, status);

    const updated = await models.Pipelines.findOne({ _id });

    await putUpdateLog(
      models,
      subdomain,
      {
        type: `${pipeline.type}Pipelines`,
        object: pipeline,
        newData: { isActive: !status },
        description: `"${pipeline.name}" has been ${
          status === BOARD_STATUSES.ACTIVE ? 'archived' : 'unarchived'
        }"`,
        updatedDocument: updated
      },
      user
    );

    return archived;
  },

  /**
   * Duplicate pipeline
   */
  async pipelinesCopied(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const sourcePipeline = await models.Pipelines.getPipeline(_id);
    const sourceStages = await models.Stages.find({ pipelineId: _id }).lean();

    await checkPermission(
      models,
      subdomain,
      sourcePipeline.type,
      user,
      'pipelinesCopied'
    );

    const pipelineDoc = {
      ...sourcePipeline,
      _id: undefined,
      status: sourcePipeline.status || 'active',
      name: `${sourcePipeline.name}-copied`
    };

    const copied = await models.Pipelines.createPipeline(pipelineDoc);

    for (const stage of sourceStages) {
      await models.Stages.createStage({
        ...stage,
        _id: undefined,
        probability: stage.probability || '10%',
        type: copied.type,
        pipelineId: copied._id
      });
    }

    await putUpdateLog(
      models,
      subdomain,
      { type: `${sourcePipeline.type}Pipelines`, object: copied },
      user
    );

    return copied;
  },

  /**
   * Update stage orders
   */
  stagesUpdateOrder(
    _root,
    { orders }: { orders: IOrderInput[] },
    { models }: IContext
  ) {
    return models.Stages.updateOrder(orders);
  },

  /**
   * Edit stage
   */
  async stagesEdit(
    _root,
    { _id, ...doc }: IStageEdit,
    { user, models, subdomain }: IContext
  ) {
    await checkPermission(models, subdomain, doc.type, user, 'stagesEdit');

    const stage = await models.Stages.getStage(_id);
    const updated = await models.Stages.updateStage(_id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: `${doc.type}Stages`,
        newData: doc,
        object: stage,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Remove stage
   */
  async stagesRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const stage = await models.Stages.getStage(_id);

    await checkPermission(models, subdomain, stage.type, user, 'stagesRemove');

    const removed = await models.Stages.removeStage(_id);

    await putDeleteLog(
      models,
      subdomain,
      { type: `${stage.type}Stages`, object: stage },
      user
    );

    return removed;
  },

  async stagesSortItems(
    _root,
    {
      stageId,
      type,
      proccessId,
      sortType
    }: {
      stageId: string;
      type: string;
      proccessId: string;
      sortType: string;
    },
    { user, subdomain, models }: IContext
  ) {
    await checkPermission(models, subdomain, type, user, 'itemsSort');

    const { collection } = getCollection(models, type);

    const sortTypes = {
      'created-asc': { createdAt: 1 },
      'created-desc': { createdAt: -1 },
      'modified-asc': { modifiedAt: 1 },
      'modified-desc': { modifiedAt: -1 },
      'close-asc': { closeDate: 1, order: 1 },
      'close-desc': { closeDate: -1, order: 1 },
      'alphabetically-asc': { name: 1 }
    };
    const sort: { [key: string]: any } = sortTypes[sortType];

    if (sortType === 'close-asc') {
      await bulkUpdateOrders({
        collection,
        stageId,
        sort,
        additionFilter: { closeDate: { $ne: null } }
      });
      await bulkUpdateOrders({
        collection,
        stageId,
        sort: { order: 1 },
        additionFilter: { closeDate: null },
        startOrder: 100001
      });
    } else {
      const response = await bulkUpdateOrders({ collection, stageId, sort });

      if (!response) {
        return;
      }
    }

    const stage = await models.Stages.getStage(stageId);

    graphqlPubsub.publish('pipelinesChanged', {
      pipelinesChanged: {
        _id: stage.pipelineId,
        proccessId,
        action: 'reOrdered',
        data: {
          destinationStageId: stageId
        }
      }
    });

    return 'ok';
  },

  async boardItemUpdateTimeTracking(
    _root,
    {
      _id,
      type,
      status,
      timeSpent,
      startDate
    }: {
      _id: string;
      type: string;
      status: string;
      timeSpent: number;
      startDate: string;
    },
    { user, subdomain, models }: IContext
  ) {
    await checkPermission(models, subdomain, type, user, 'updateTimeTracking');

    return models.Boards.updateTimeTracking(
      _id,
      type,
      status,
      timeSpent,
      startDate
    );
  },

  async boardItemsSaveForGanttTimeline(
    _root,
    { items, links, type }: { items: any[]; links: any[]; type: string },
    { models }: IContext
  ) {
    const bulkOps: any[] = [];

    for (const item of items) {
      bulkOps.push({
        updateOne: {
          filter: {
            _id: item._id
          },
          update: {
            $set: {
              startDate: item.startDate,
              closeDate: item.closeDate,
              relations: links.filter(link => link.start === item._id)
            }
          }
        }
      });
    }

    const { collection } = getCollection(models, type);

    await collection.bulkWrite(bulkOps);

    return 'Success';
  }
};

export default boardMutations;
