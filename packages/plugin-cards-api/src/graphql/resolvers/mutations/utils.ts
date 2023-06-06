import resolvers from '..';
import {
  destroyBoardItemRelations,
  getCollection,
  getCompanyIds,
  getCustomerIds,
  getItem,
  getNewOrder
} from '../../../models/utils';
import {
  IItemCommonFields,
  IItemDragCommonFields,
  IStageDocument
} from '../../../models/definitions/boards';
import { BOARD_STATUSES } from '../../../models/definitions/constants';
import { IDeal, IDealDocument } from '../../../models/definitions/deals';
import {
  IPurchase,
  IPurchaseDocument
} from '../../../models/definitions/purchases';

import {
  IGrowthHack,
  IGrowthHackDocument
} from '../../../models/definitions/growthHacks';
import { ITaskDocument } from '../../../models/definitions/tasks';
import { ITicket, ITicketDocument } from '../../../models/definitions/tickets';
import { graphqlPubsub } from '../../../configs';
import {
  putActivityLog,
  putCreateLog,
  putDeleteLog,
  putUpdateLog
} from '../../../logUtils';
import { checkUserIds } from '@erxes/api-utils/src';
import {
  copyChecklists,
  copyPipelineLabels,
  createConformity,
  IBoardNotificationParams,
  prepareBoardItemDoc,
  sendNotifications
} from '../../utils';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { generateModels, IModels } from '../../../connectionResolver';
import {
  sendCoreMessage,
  sendFormsMessage,
  sendNotificationsMessage
} from '../../../messageBroker';

export const itemResolver = async (
  models: IModels,
  subdomain: string,
  user: any,
  type: string,
  item: IItemCommonFields
) => {
  let resolverType = '';

  switch (type) {
    case 'deal':
      resolverType = 'Deal';
      break;
    case 'purchase':
      resolverType = 'Purchase';
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
      additionInfo[subResolver] = await resolver[subResolver](
        item,
        {},
        { models, subdomain, user },
        { isSubscription: true }
      );
    } catch (unused) {
      continue;
    }
  }

  return additionInfo;
};

export const itemsAdd = async (
  models: IModels,
  subdomain: string,
  doc: (IDeal | IPurchase | IItemCommonFields | ITicket | IGrowthHack) & {
    proccessId: string;
    aboveItemId: string;
  },
  type: string,
  createModel: any,
  user?: IUserDocument,
  docModifier?: any
) => {
  const { collection } = getCollection(models, type);

  doc.initialStageId = doc.stageId;
  doc.watchedUserIds = user && [user._id];

  const modifiedDoc = docModifier ? docModifier(doc) : doc;

  const extendedDoc = {
    ...modifiedDoc,
    modifiedBy: user && user._id,
    userId: user ? user._id : doc.userId,
    order: await getNewOrder({
      collection,
      stageId: doc.stageId,
      aboveItemId: doc.aboveItemId
    })
  };

  if (extendedDoc.customFieldsData) {
    // clean custom field values
    extendedDoc.customFieldsData = await sendFormsMessage({
      subdomain,
      action: 'fields.prepareCustomFieldsData',
      data: extendedDoc.customFieldsData,
      isRPC: true
    });
  }

  const item = await createModel(extendedDoc);
  const stage = await models.Stages.getStage(item.stageId);

  await createConformity(subdomain, {
    mainType: type,
    mainTypeId: item._id,
    companyIds: doc.companyIds,
    customerIds: doc.customerIds
  });

  if (user) {
    const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);

    sendNotifications(models, subdomain, {
      item,
      user,
      type: `${type}Add`,
      action: `invited you to the ${pipeline.name}`,
      content: `'${item.name}'.`,
      contentType: type
    });

    await putCreateLog(
      models,
      subdomain,
      {
        type,
        newData: extendedDoc,
        object: item
      },
      user
    );
  }

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

export const changeItemStatus = async (
  models: IModels,
  subdomain: string,
  user: any,
  {
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
  }
) => {
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

  const { collection } = getCollection(models, type);

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
        item: {
          ...item._doc,
          ...(await itemResolver(models, subdomain, user, type, item))
        },
        aboveItemId,
        destinationStageId: item.stageId
      }
    }
  });
};

export const itemsEdit = async (
  models: IModels,
  subdomain: string,
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

  const stage = await models.Stages.getStage(oldItem.stageId);

  const { canEditMemberIds } = stage;

  if (
    canEditMemberIds &&
    canEditMemberIds.length > 0 &&
    !canEditMemberIds.includes(user._id)
  ) {
    throw new Error('Permission denied');
  }

  if (extendedDoc.customFieldsData) {
    // clean custom field values
    extendedDoc.customFieldsData = await sendFormsMessage({
      subdomain,
      action: 'fields.prepareCustomFieldsData',
      data: extendedDoc.customFieldsData,
      isRPC: true
    });
  }

  const updatedItem = await modelUpate(_id, extendedDoc);
  // labels should be copied to newly moved pipeline
  if (doc.stageId) {
    await copyPipelineLabels(models, { item: oldItem, doc, user });
  }

  const notificationDoc: IBoardNotificationParams = {
    item: updatedItem,
    user,
    type: `${type}Edit`,
    contentType: type
  };

  if (doc.status && oldItem.status && oldItem.status !== doc.status) {
    const activityAction = doc.status === 'active' ? 'activated' : 'archived';

    putActivityLog(subdomain, {
      action: 'createArchiveLog',
      data: {
        item: updatedItem,
        contentType: type,
        action: 'archive',
        userId: user._id,
        createdBy: user._id,
        contentId: updatedItem._id,
        content: activityAction
      }
    });

    // order notification
    await changeItemStatus(models, subdomain, user, {
      type,
      item: updatedItem,
      status: activityAction,
      proccessId,
      stage
    });
  }

  if (doc.assignedUserIds) {
    const { addedUserIds, removedUserIds } = checkUserIds(
      oldItem.assignedUserIds,
      doc.assignedUserIds
    );

    const activityContent = { addedUserIds, removedUserIds };

    putActivityLog(subdomain, {
      action: 'createAssigneLog',
      data: {
        contentId: _id,
        userId: user._id,
        contentType: type,
        content: activityContent,
        action: 'assignee',
        createdBy: user._id
      }
    });

    notificationDoc.invitedUsers = addedUserIds;
    notificationDoc.removedUsers = removedUserIds;
  }

  await sendNotifications(models, subdomain, notificationDoc);

  if (!notificationDoc.invitedUsers && !notificationDoc.removedUsers) {
    sendCoreMessage({
      subdomain: 'os',
      action: 'sendMobileNotification',
      data: {
        title: notificationDoc?.item?.name,
        body: `${user?.details?.fullName ||
          user?.details?.shortName} has updated`,
        receivers: notificationDoc?.item?.assignedUserIds,
        data: {
          type,
          id: _id
        }
      }
    });
  }

  putUpdateLog(
    models,
    subdomain,
    {
      type,
      object: oldItem,
      newData: extendedDoc,
      updatedDocument: updatedItem
    },
    user
  );

  const oldStage = await models.Stages.getStage(oldItem.stageId);

  if (doc.tagIds || doc.startDate || doc.closeDate || doc.name) {
    graphqlPubsub.publish('pipelinesChanged', {
      pipelinesChanged: {
        _id: stage.pipelineId
      }
    });
  }

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
            ...(await itemResolver(models, subdomain, user, type, updatedItem))
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
            ...(await itemResolver(models, subdomain, user, type, updatedItem))
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
    models,
    subdomain,
    user._id,
    oldItem,
    type,
    updatedItem.stageId
  );

  await sendNotifications(models, subdomain, {
    item: updatedItem,
    user,
    type: `${type}Change`,
    content,
    action,
    contentType: type
  });

  return updatedItem;
};

const itemMover = async (
  models: IModels,
  subdomain: string,
  userId: string,
  item:
    | IDealDocument
    | IPurchaseDocument
    | ITaskDocument
    | ITicketDocument
    | IGrowthHackDocument,
  contentType: string,
  destinationStageId: string
) => {
  const oldStageId = item.stageId;

  let action = `changed order of your ${contentType}:`;
  let content = `'${item.name}'`;

  if (oldStageId !== destinationStageId) {
    const stage = await models.Stages.getStage(destinationStageId);
    const oldStage = await models.Stages.getStage(oldStageId);

    const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);
    const oldPipeline = await models.Pipelines.getPipeline(oldStage.pipelineId);

    const board = await models.Boards.getBoard(pipeline.boardId);
    const oldBoard = await models.Boards.getBoard(oldPipeline.boardId);

    action = `moved '${item.name}' from ${oldBoard.name}-${oldPipeline.name}-${oldStage.name} to `;

    content = `${board.name}-${pipeline.name}-${stage.name}`;

    const link = `/${contentType}/board?id=${board._id}&pipelineId=${pipeline._id}&itemId=${item._id}`;

    const activityLogContent = {
      oldStageId,
      destinationStageId,
      text: `${oldStage.name} to ${stage.name}`
    };

    await putActivityLog(subdomain, {
      action: 'createBoardItemMovementLog',
      data: {
        item,
        contentType,
        userId,
        activityLogContent,
        link,
        action: 'moved',
        contentId: item._id,
        createdBy: userId,
        content: activityLogContent
      }
    });

    sendNotificationsMessage({
      subdomain,
      action: 'batchUpdate',
      data: {
        selector: { contentType, contentTypeId: item._id },
        modifier: { $set: { link } }
      }
    });
  }

  return { content, action };
};

export const checkMovePermission = (
  stage: IStageDocument,
  user: IUserDocument
) => {
  if (
    stage.canMoveMemberIds &&
    stage.canMoveMemberIds.length > 0 &&
    !stage.canMoveMemberIds.includes(user._id)
  ) {
    throw new Error('Permission denied');
  }
};

export const itemsChange = async (
  models: IModels,
  subdomain: string,
  doc: IItemDragCommonFields,
  type: string,
  user: IUserDocument,
  modelUpdate: any
) => {
  const { collection } = getCollection(models, type);

  const {
    proccessId,
    itemId,
    aboveItemId,
    destinationStageId,
    sourceStageId
  } = doc;

  const item = await getItem(models, type, { _id: itemId });
  const stage = await models.Stages.getStage(item.stageId);

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
    checkMovePermission(stage, user);

    const destinationStage = await models.Stages.getStage(destinationStageId);

    checkMovePermission(destinationStage, user);

    extendedDoc.stageChangedDate = new Date();
  }

  const updatedItem = await modelUpdate(itemId, extendedDoc);

  const { content, action } = await itemMover(
    models,
    subdomain,
    user._id,
    item,
    type,
    destinationStageId
  );

  await sendNotifications(models, subdomain, {
    item,
    user,
    type: `${type}Change`,
    content,
    action,
    contentType: type
  });

  if (item?.assignedUserIds && item?.assignedUserIds?.length > 0) {
    sendCoreMessage({
      subdomain: 'os',
      action: 'sendMobileNotification',
      data: {
        title: `${item.name}`,
        body: `${user?.details?.fullName || user?.details?.shortName} ${action +
          content}`,
        receivers: item?.assignedUserIds,
        data: {
          type,
          id: item._id
        }
      }
    });
  }

  await putUpdateLog(
    models,
    subdomain,
    {
      type,
      object: item,
      newData: extendedDoc,
      updatedDocument: updatedItem
    },
    user
  );

  // order notification
  const labels = await models.PipelineLabels.find({
    _id: {
      $in: item.labelIds
    }
  });

  graphqlPubsub.publish('pipelinesChanged', {
    pipelinesChanged: {
      _id: stage.pipelineId,
      proccessId,
      action: 'orderUpdated',
      data: {
        item: {
          ...item._doc,
          ...(await itemResolver(models, subdomain, user, type, item)),
          labels
        },
        aboveItemId,
        destinationStageId,
        oldStageId: sourceStageId
      }
    }
  });

  return item;
};

export const itemsRemove = async (
  models: IModels,
  subdomain: string,
  _id: string,
  type: string,
  user: IUserDocument
) => {
  const item = await getItem(models, type, { _id });

  await sendNotifications(models, subdomain, {
    item,
    user,
    type: `${type}Delete`,
    action: `deleted ${type}:`,
    content: `'${item.name}'`,
    contentType: type
  });

  if (item?.assignedUserIds && item?.assignedUserIds?.length > 0) {
    sendCoreMessage({
      subdomain: 'os',
      action: 'sendMobileNotification',
      data: {
        title: `${item.name}`,
        body: `${user?.details?.fullName ||
          user?.details?.shortName} deleted the ${type}`,
        receivers: item?.assignedUserIds,
        data: {
          type,
          id: item._id
        }
      }
    });
  }

  await destroyBoardItemRelations(models, subdomain, item._id, type);

  const removed = await item.remove();

  await putDeleteLog(models, subdomain, { type, object: item }, user);

  return removed;
};

export const itemsCopy = async (
  models: IModels,
  subdomain: string,
  _id: string,
  proccessId: string,
  type: string,
  user: IUserDocument,
  extraDocParam: string[],
  modelCreate: any
) => {
  const { collection } = getCollection(models, type);
  const item = await collection.findOne({ _id }).lean();

  const doc = await prepareBoardItemDoc(item, collection, user._id);

  delete doc.sourceConversationIds;

  for (const param of extraDocParam) {
    doc[param] = item[param];
  }

  const clone = await modelCreate(doc);

  const companyIds = await getCompanyIds(subdomain, type, _id);
  const customerIds = await getCustomerIds(subdomain, type, _id);

  await createConformity(subdomain, {
    mainType: type,
    mainTypeId: clone._id,
    customerIds,
    companyIds
  });

  await copyChecklists(models, {
    contentType: type,
    contentTypeId: item._id,
    targetContentId: clone._id,
    user
  });

  // order notification
  const stage = await models.Stages.getStage(clone.stageId);

  graphqlPubsub.publish('pipelinesChanged', {
    pipelinesChanged: {
      _id: stage.pipelineId,
      proccessId,
      action: 'itemAdd',
      data: {
        item: {
          ...clone._doc,
          ...(await itemResolver(models, subdomain, user, type, clone))
        },
        aboveItemId: _id,
        destinationStageId: stage._id
      }
    }
  });

  await publishHelperItemsConformities(clone, stage);

  return clone;
};

export const itemsArchive = async (
  models: IModels,
  subdomain: string,
  stageId: string,
  type: string,
  proccessId: string,
  user: IUserDocument
) => {
  const { collection } = getCollection(models, type);

  const items = await collection
    .find({
      stageId,
      status: { $ne: BOARD_STATUSES.ARCHIVED }
    })
    .lean();

  await collection.updateMany(
    { stageId },
    { $set: { status: BOARD_STATUSES.ARCHIVED } }
  );

  // order notification
  const stage = await models.Stages.getStage(stageId);

  for (const item of items) {
    await putActivityLog(subdomain, {
      action: 'createArchiveLog',
      data: {
        item,
        contentType: type,
        action: 'archive',
        userId: user._id,
        createdBy: user._id,
        contentId: item._id,
        content: 'archived'
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
  item:
    | IDealDocument
    | IPurchaseDocument
    | ITicketDocument
    | ITaskDocument
    | IGrowthHackDocument,
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

export const publishHelper = async (
  subdomain: string,
  type: string,
  itemId: string
) => {
  const models = await generateModels(subdomain);

  const item = await getItem(models, type, { _id: itemId });

  const stage = await models.Stages.getStage(item.stageId);
  await publishHelperItemsConformities(item, stage);
};
