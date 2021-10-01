import resolvers from '..';
import { Boards, Notifications, Pipelines, Stages } from '../../../db/models';
import {
  destroyBoardItemRelations,
  getCollection,
  getCompanyIds,
  getCustomerIds,
  getItem,
  getNewOrder
} from '../../../db/models/boardUtils';
import {
  IItemCommonFields,
  IItemDragCommonFields,
  IStageDocument
} from '../../../db/models/definitions/boards';
import {
  BOARD_STATUSES,
  NOTIFICATION_TYPES
} from '../../../db/models/definitions/constants';
import { IDeal, IDealDocument } from '../../../db/models/definitions/deals';
import {
  IGrowthHack,
  IGrowthHackDocument
} from '../../../db/models/definitions/growthHacks';
import { ITaskDocument } from '../../../db/models/definitions/tasks';
import {
  ITicket,
  ITicketDocument
} from '../../../db/models/definitions/tickets';
import { IUserDocument } from '../../../db/models/definitions/users';
import { graphqlPubsub } from '../../../pubsub';
import {
  ACTIVITY_LOG_ACTIONS,
  putActivityLog,
  putCreateLog,
  putDeleteLog,
  putUpdateLog
} from '../../logUtils';
import { checkUserIds } from '../../utils';
import {
  copyChecklists,
  copyPipelineLabels,
  createConformity,
  IBoardNotificationParams,
  prepareBoardItemDoc,
  sendNotifications
} from '../boardUtils';

export const itemResolver = async (type: string, item: IItemCommonFields) => {
  let resolverType = '';

  switch (type) {
    case 'deal':
      resolverType = 'Deal';
      break;

    case 'task':
      resolverType = 'Task';
      break;

    case 'ticket':
      resolverType = 'Ticket';
      break;

    case 'growthHack':
      resolverType = 'GrowthHack';
      break;
  }

  const additionInfo = {};
  const resolver = resolvers[resolverType] || {};

  for (const subResolver of Object.keys(resolver)) {
    try {
      additionInfo[subResolver] = await resolver[subResolver](item);
    } catch (unused) {
      continue;
    }
  }

  return additionInfo;
};

export const itemsAdd = async (
  doc: (IDeal | IItemCommonFields | ITicket | IGrowthHack) & {
    proccessId: string;
    aboveItemId: string;
  },
  type: string,
  createModel: any,
  user?: IUserDocument,
  docModifier?: any
) => {
  const { collection } = getCollection(type);

  doc.initialStageId = doc.stageId;
  doc.watchedUserIds = user && [user._id];

  const modifiedDoc = docModifier ? docModifier(doc) : doc;

  const extendedDoc = {
    ...modifiedDoc,
    modifiedBy: user && user._id,
    userId: user && user._id,
    order: await getNewOrder({
      collection,
      stageId: doc.stageId,
      aboveItemId: doc.aboveItemId
    })
  };

  const item = await createModel(extendedDoc);

  await createConformity({
    mainType: type,
    mainTypeId: item._id,
    companyIds: doc.companyIds,
    customerIds: doc.customerIds
  });

  if (user) {
    await sendNotifications({
      item,
      user,
      type: NOTIFICATION_TYPES.DEAL_ADD,
      action: `invited you to the ${type}`,
      content: `'${item.name}'.`,
      contentType: type
    });

    await putCreateLog(
      {
        type,
        newData: extendedDoc,
        object: item
      },
      user
    );
  }

  const stage = await Stages.getStage(item.stageId);

  graphqlPubsub.publish('pipelinesChanged', {
    pipelinesChanged: {
      _id: stage.pipelineId,
      proccessId: doc.proccessId,
      action: 'itemAdd',
      data: {
        item,
        aboveItemId: doc.aboveItemId,
        destinationStageId: stage._id
      }
    }
  });

  return item;
};

export const changeItemStatus = async ({
  type,
  item,
  status,
  proccessId,
  stage
}: {
  type: string;
  item: any;
  status: string;
  proccessId: string;
  stage: IStageDocument;
}) => {
  if (status === 'archived') {
    graphqlPubsub.publish('pipelinesChanged', {
      pipelinesChanged: {
        _id: stage.pipelineId,
        proccessId,
        action: 'itemRemove',
        data: {
          item,
          oldStageId: item.stageId
        }
      }
    });

    return;
  }

  const { collection } = getCollection(type);

  const aboveItems = await collection
    .find({
      stageId: item.stageId,
      status: { $ne: BOARD_STATUSES.ARCHIVED },
      order: { $lt: item.order }
    })
    .sort({ order: -1 })
    .limit(1);

  const aboveItemId = aboveItems[0]?._id || '';

  // maybe, recovered order includes to oldOrders
  await collection.updateOne(
    {
      _id: item._id
    },
    {
      order: await getNewOrder({
        collection,
        stageId: item.stageId,
        aboveItemId
      })
    }
  );

  graphqlPubsub.publish('pipelinesChanged', {
    pipelinesChanged: {
      _id: stage.pipelineId,
      proccessId,
      action: 'itemAdd',
      data: {
        item: { ...item._doc, ...(await itemResolver(type, item)) },
        aboveItemId,
        destinationStageId: item.stageId
      }
    }
  });
};

export const itemsEdit = async (
  _id: string,
  type: string,
  oldItem: any,
  doc: any,
  proccessId: string,
  user: IUserDocument,
  modelUpate
) => {
  const extendedDoc = {
    ...doc,
    modifiedAt: new Date(),
    modifiedBy: user._id
  };

  const updatedItem = await modelUpate(_id, extendedDoc);
  // labels should be copied to newly moved pipeline
  if (doc.stageId) {
    await copyPipelineLabels({ item: oldItem, doc, user });
  }

  const notificationDoc: IBoardNotificationParams = {
    item: updatedItem,
    user,
    type: NOTIFICATION_TYPES.TASK_EDIT,
    contentType: type
  };

  const stage = await Stages.getStage(updatedItem.stageId);

  if (doc.status && oldItem.status && oldItem.status !== doc.status) {
    const activityAction = doc.status === 'active' ? 'activated' : 'archived';

    await putActivityLog({
      action: ACTIVITY_LOG_ACTIONS.CREATE_ARCHIVE_LOG,
      data: {
        item: updatedItem,
        contentType: type,
        action: activityAction,
        userId: user._id
      }
    });

    // order notification
    await changeItemStatus({
      type,
      item: updatedItem,
      status: activityAction,
      proccessId,
      stage
    });
  }

  if (doc.assignedUserIds && doc.assignedUserIds.length > 0) {
    const { addedUserIds, removedUserIds } = checkUserIds(
      oldItem.assignedUserIds,
      doc.assignedUserIds
    );

    const activityContent = { addedUserIds, removedUserIds };

    await putActivityLog({
      action: ACTIVITY_LOG_ACTIONS.CREATE_ASSIGNE_LOG,
      data: {
        contentId: _id,
        userId: user._id,
        contentType: type,
        content: activityContent
      }
    });

    notificationDoc.invitedUsers = addedUserIds;
    notificationDoc.removedUsers = removedUserIds;
  }

  await sendNotifications(notificationDoc);

  await putUpdateLog(
    {
      type,
      object: oldItem,
      newData: extendedDoc,
      updatedDocument: updatedItem
    },
    user
  );

  const oldStage = await Stages.getStage(oldItem.stageId);

  if (oldStage.pipelineId !== stage.pipelineId) {
    graphqlPubsub.publish('pipelinesChanged', {
      pipelinesChanged: {
        _id: oldStage.pipelineId,
        proccessId,
        action: 'itemRemove',
        data: {
          item: oldItem,
          oldStageId: oldStage._id
        }
      }
    });

    graphqlPubsub.publish('pipelinesChanged', {
      pipelinesChanged: {
        _id: stage.pipelineId,
        proccessId,
        action: 'itemAdd',
        data: {
          item: {
            ...updatedItem._doc,
            ...(await itemResolver(type, updatedItem))
          },
          aboveItemId: '',
          destinationStageId: stage._id
        }
      }
    });
  } else {
    graphqlPubsub.publish('pipelinesChanged', {
      pipelinesChanged: {
        _id: stage.pipelineId,
        proccessId,
        action: 'itemUpdate',
        data: {
          item: {
            ...updatedItem._doc,
            ...(await itemResolver(type, updatedItem))
          }
        }
      }
    });
  }

  if (oldItem.stageId === updatedItem.stageId) {
    return updatedItem;
  }

  // if task moves between stages
  const { content, action } = await itemMover(
    user._id,
    oldItem,
    type,
    updatedItem.stageId
  );

  await sendNotifications({
    item: updatedItem,
    user,
    type: NOTIFICATION_TYPES.TASK_CHANGE,
    content,
    action,
    contentType: type
  });

  return updatedItem;
};

const itemMover = async (
  userId: string,
  item: IDealDocument | ITaskDocument | ITicketDocument | IGrowthHackDocument,
  contentType: string,
  destinationStageId: string
) => {
  const oldStageId = item.stageId;

  let action = `changed order of your ${contentType}:`;
  let content = `'${item.name}'`;

  if (oldStageId !== destinationStageId) {
    const stage = await Stages.getStage(destinationStageId);
    const oldStage = await Stages.getStage(oldStageId);

    const pipeline = await Pipelines.getPipeline(stage.pipelineId);
    const oldPipeline = await Pipelines.getPipeline(oldStage.pipelineId);

    const board = await Boards.getBoard(pipeline.boardId);
    const oldBoard = await Boards.getBoard(oldPipeline.boardId);

    action = `moved '${item.name}' from ${oldBoard.name}-${oldPipeline.name}-${oldStage.name} to `;

    content = `${board.name}-${pipeline.name}-${stage.name}`;

    const link = `/${contentType}/board?id=${board._id}&pipelineId=${pipeline._id}&itemId=${item._id}`;

    const activityLogContent = {
      oldStageId,
      destinationStageId,
      text: `${oldStage.name} to ${stage.name}`
    };

    await putActivityLog({
      action: ACTIVITY_LOG_ACTIONS.CREATE_BOARD_ITEM_MOVEMENT_LOG,
      data: {
        item,
        contentType,
        userId,
        activityLogContent,
        link
      }
    });

    await Notifications.updateMany(
      { contentType, contentTypeId: item._id },
      { $set: { link } }
    );
  }

  return { content, action };
};

export const itemsChange = async (
  doc: IItemDragCommonFields,
  type: string,
  user: IUserDocument,
  modelUpdate: any
) => {
  const { collection } = getCollection(type);
  const {
    proccessId,
    itemId,
    aboveItemId,
    destinationStageId,
    sourceStageId
  } = doc;

  const item = await getItem(type, { _id: itemId });

  const extendedDoc: IItemCommonFields = {
    modifiedAt: new Date(),
    modifiedBy: user._id,
    stageId: destinationStageId,
    order: await getNewOrder({
      collection,
      stageId: destinationStageId,
      aboveItemId
    })
  };

  if (item.stageId !== destinationStageId) {
    extendedDoc.stageChangedDate = new Date();
  }

  const updatedItem = await modelUpdate(itemId, extendedDoc);

  const { content, action } = await itemMover(
    user._id,
    item,
    type,
    destinationStageId
  );

  await sendNotifications({
    item,
    user,
    type: NOTIFICATION_TYPES.DEAL_CHANGE,
    content,
    action,
    contentType: type
  });

  await putUpdateLog(
    {
      type,
      object: item,
      newData: extendedDoc,
      updatedDocument: updatedItem
    },
    user
  );

  // order notification
  const stage = await Stages.getStage(item.stageId);

  graphqlPubsub.publish('pipelinesChanged', {
    pipelinesChanged: {
      _id: stage.pipelineId,
      proccessId,
      action: 'orderUpdated',
      data: {
        item: { ...item._doc, ...(await itemResolver(type, item)) },
        aboveItemId,
        destinationStageId,
        oldStageId: sourceStageId
      }
    }
  });

  return item;
};

export const itemsRemove = async (
  _id: string,
  type: string,
  user: IUserDocument
) => {
  const item = await getItem(type, { _id });

  await sendNotifications({
    item,
    user,
    type: `${type}Delete`,
    action: `deleted ${type}:`,
    content: `'${item.name}'`,
    contentType: type
  });

  await destroyBoardItemRelations(item._id, type);

  const removed = await item.remove();

  await putDeleteLog({ type, object: item }, user);

  return removed;
};

export const itemsCopy = async (
  _id: string,
  proccessId: string,
  type: string,
  user: IUserDocument,
  extraDocParam: string[],
  modelCreate: any
) => {
  const { collection } = getCollection(type);
  const item = await collection.findOne({ _id }).lean();

  const doc = await prepareBoardItemDoc(item, collection, user._id);

  for (const param of extraDocParam) {
    doc[param] = item[param];
  }

  const clone = await modelCreate(doc);

  const companyIds = await getCompanyIds(type, _id);
  const customerIds = await getCustomerIds(type, _id);

  await createConformity({
    mainType: type,
    mainTypeId: clone._id,
    customerIds,
    companyIds
  });

  await copyChecklists({
    contentType: type,
    contentTypeId: item._id,
    targetContentId: clone._id,
    user
  });

  // order notification
  const stage = await Stages.getStage(clone.stageId);

  graphqlPubsub.publish('pipelinesChanged', {
    pipelinesChanged: {
      _id: stage.pipelineId,
      proccessId,
      action: 'itemAdd',
      data: {
        item: { ...clone._doc, ...(await itemResolver(type, clone)) },
        aboveItemId: _id,
        destinationStageId: stage._id
      }
    }
  });

  await publishHelperItemsConformities(clone, stage);

  return clone;
};

export const itemsArchive = async (
  stageId: string,
  type: string,
  proccessId: string,
  user: IUserDocument
) => {
  const { collection } = getCollection(type);

  const items = await collection.find({
    stageId,
    status: { $ne: BOARD_STATUSES.ARCHIVED }
  });

  await collection.updateMany(
    { stageId },
    { $set: { status: BOARD_STATUSES.ARCHIVED } }
  );

  // order notification
  const stage = await Stages.getStage(stageId);

  for (const item of items) {
    await putActivityLog({
      action: ACTIVITY_LOG_ACTIONS.CREATE_ARCHIVE_LOG,
      data: {
        item,
        contentType: type,
        action: 'archived',
        userId: user._id
      }
    });

    graphqlPubsub.publish('pipelinesChanged', {
      pipelinesChanged: {
        _id: stage.pipelineId,
        proccessId,
        action: 'itemsRemove',
        data: {
          item,
          destinationStageId: stage._id
        }
      }
    });
  }

  return 'ok';
};

export const publishHelperItemsConformities = async (
  item: IDealDocument | ITicketDocument | ITaskDocument | IGrowthHackDocument,
  stage: IStageDocument
) => {
  graphqlPubsub.publish('pipelinesChanged', {
    pipelinesChanged: {
      _id: stage.pipelineId,
      proccessId: Math.random().toString(),
      action: 'itemOfConformitiesUpdate',
      data: {
        item: {
          ...item
        }
      }
    }
  });
};
