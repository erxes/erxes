import { Boards, Pipelines, Stages } from '../../../models';
import { bulkUpdateOrders, getCollection } from '../../../models/utils';
import {
  IBoard,
  IOrderInput,
  IPipeline,
  IStage,
  IStageDocument
} from '../../../models/definitions/boards';
import { BOARD_STATUSES } from '../../../models/definitions/constants';
import { graphqlPubsub } from '../../../configs';
import { IContext } from '@erxes/api-utils/src';
import { checkPermission } from '../../utils';
import { sendFieldsGroupMessage } from '../../../messageBroker';
import { FieldsGroups } from '../../../apiCollections';

import { putCreateLog, putUpdateLog, putDeleteLog } from '../../../logUtils';
import { configReplacer } from '../../../utils';

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
  async boardsAdd(_root, doc: IBoard, { user }: IContext) {
    await checkPermission(doc.type, user, 'boardsAdd');

    const extendedDoc = { userId: user._id, ...doc };

    const board = await Boards.createBoard(extendedDoc);

    putCreateLog(
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
  async boardsEdit(_root, { _id, ...doc }: IBoardsEdit, { user }: IContext) {
    await checkPermission(doc.type, user, 'boardsEdit');

    const board = await Boards.getBoard(_id);
    const updated = await Boards.updateBoard(_id, doc);

    await putUpdateLog(
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
  async boardsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const board = await Boards.getBoard(_id);

    await checkPermission(board.type, user, 'boardsRemove');

    const removed = await Boards.removeBoard(_id);

    const relatedFieldsGroups = await FieldsGroups.find({
      boardIds: board._id
    }).toArray();

    for (const fieldGroup of relatedFieldsGroups) {
      const boardIds = fieldGroup.boardIds || [];
      fieldGroup.boardIds = boardIds.filter(e => e !== board._id);

      sendFieldsGroupMessage('updateGroup', {
        groupId: fieldGroup._id,
        fieldGroup
      });
    }

    await putDeleteLog(
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
    { user }: IContext
  ) {
    await checkPermission(doc.type, user, 'pipelinesAdd');

    if (doc.numberConfig || doc.numberSize) {
      await checkNumberConfig(doc.numberConfig || '', doc.numberSize || '');
    }

    const pipeline = await Pipelines.createPipeline(
      { userId: user._id, ...doc },
      stages
    );

    putCreateLog(
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
    { user }: IContext
  ) {
    await checkPermission(doc.type, user, 'pipelinesEdit');

    if (doc.numberConfig || doc.numberSize) {
      await checkNumberConfig(doc.numberConfig || '', doc.numberSize || '');
    }

    const pipeline = await Pipelines.getPipeline(_id);

    const updated = await Pipelines.updatePipeline(_id, doc, stages);

    await putUpdateLog(
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
  async pipelinesUpdateOrder(_root, { orders }: { orders: IOrderInput[] }) {
    return Pipelines.updateOrder(orders);
  },

  /**
   * Watch pipeline
   */
  async pipelinesWatch(
    _root,
    { _id, isAdd, type }: { _id: string; isAdd: boolean; type: string },
    { user }: IContext
  ) {
    await checkPermission(type, user, 'pipelinesWatch');

    return Pipelines.watchPipeline(_id, isAdd, user._id);
  },

  /**
   * Remove pipeline
   */
  async pipelinesRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const pipeline = await Pipelines.getPipeline(_id);

    await checkPermission(pipeline.type, user, 'pipelinesRemove');

    const removed = await Pipelines.removePipeline(_id);

    const relatedFieldsGroups = await FieldsGroups.find({
      pipelineIds: pipeline._id
    });

    for (const fieldGroup of relatedFieldsGroups) {
      const pipelineIds = fieldGroup.pipelineIds || [];
      fieldGroup.pipelineIds = pipelineIds.filter(e => e !== pipeline._id);

      sendFieldsGroupMessage('updateGroup', {
        groupId: fieldGroup._id,
        fieldGroup
      });
    }

    await putDeleteLog(
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
    { user }: IContext
  ) {
    const pipeline = await Pipelines.getPipeline(_id);

    await checkPermission(pipeline.type, user, 'pipelinesArchive');

    const archived = await Pipelines.archivePipeline(_id, status);

    const updated = await Pipelines.findOne({ _id });

    const logDoc = {
      type: `${pipeline.type}Pipelines`,
      object: pipeline,
      newData: { isActive: !status },
      description: `"${pipeline.name}" has been ${
        status === BOARD_STATUSES.ACTIVE ? 'archived' : 'unarchived'
      }"`,
      updatedDocument: updated
    };

    await putUpdateLog(
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
  async pipelinesCopied(_root, { _id }: { _id: string }, { user }: IContext) {
    const sourcePipeline = await Pipelines.getPipeline(_id);
    const sourceStages = await Stages.find({ pipelineId: _id }).lean();

    await checkPermission(sourcePipeline.type, user, 'pipelinesCopied');

    const pipelineDoc = {
      ...sourcePipeline,
      _id: undefined,
      status: sourcePipeline.status || 'active',
      name: `${sourcePipeline.name}-copied`
    };

    const copied = await Pipelines.createPipeline(pipelineDoc);

    for (const stage of sourceStages) {
      await Stages.createStage({
        ...stage,
        _id: undefined,
        probability: stage.probability || '10%',
        type: copied.type,
        pipelineId: copied._id
      });
    }

    await putUpdateLog(
      { type: `${sourcePipeline.type}Pipelines`, object: copied },
      user
    );

    return copied;
  },

  /**
   * Update stage orders
   */
  stagesUpdateOrder(_root, { orders }: { orders: IOrderInput[] }) {
    return Stages.updateOrder(orders);
  },

  /**
   * Edit stage
   */
  async stagesEdit(_root, { _id, ...doc }: IStageEdit, { user }: IContext) {
    await checkPermission(doc.type, user, 'stagesEdit');

    const stage = await Stages.getStage(_id);
    const updated = await Stages.updateStage(_id, doc);

    await putUpdateLog(
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
  async stagesRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const stage = await Stages.getStage(_id);

    await checkPermission(stage.type, user, 'stagesRemove');

    const removed = await Stages.removeStage(_id);

    await putDeleteLog(
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
    { user }: IContext
  ) {
    await checkPermission(type, user, 'itemsSort');

    const { collection } = getCollection(type);

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

    const stage = await Stages.getStage(stageId);

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
    { user }
  ) {
    await checkPermission(type, user, 'updateTimeTracking');

    return Boards.updateTimeTracking(_id, type, status, timeSpent, startDate);
  },

  async boardItemsSaveForGanttTimeline(
    _root,
    { items, links, type }: { items: any[]; links: any[]; type: string }
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

    const { collection } = getCollection(type);

    await collection.bulkWrite(bulkOps);

    return 'Success';
  }
};

export default boardMutations;
