import { generateFieldsFromSchema } from '@erxes/api-utils/src';
import { generateModels, IModels } from './connectionResolver';
import {
  sendAutomationsMessage,
  sendCardsMessage,
  sendContactsMessage,
  sendCoreMessage,
  sendEbarimtMessage,
  sendInventoriesMessage,
  sendLoyaltiesMessage,
  sendPosclientMessage,
  sendProductsMessage,
  sendSyncerkhetMessage
} from './messageBroker';
import { IPosOrder } from './models/definitions/orders';
import { IPosDocument } from './models/definitions/pos';

export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendCoreMessage({
    subdomain,
    action: 'getConfig',
    data: { code, defaultValue },
    isRPC: true
  });
};

export const getChildCategories = async (subdomain: string, categoryIds) => {
  const childs = await sendProductsMessage({
    subdomain,
    action: 'categories.withChilds',
    data: { ids: categoryIds },
    isRPC: true,
    defaultValue: []
  });

  const catIds: string[] = (childs || []).map(ch => ch._id) || [];
  return Array.from(new Set(catIds));
};

export const getBranchesUtil = async (
  subdomain: string,
  models: IModels,
  posToken: string
) => {
  const pos = await models.Pos.findOne({ token: posToken }).lean();

  if (!pos) {
    return { error: 'not found pos' };
  }

  const allowsPos = await models.Pos.find({
    isOnline: { $ne: true },
    branchId: { $in: pos.allowBranchIds }
  }).lean();

  const healthyBranchIds = [] as any;

  for (const allowPos of allowsPos) {
    const longTask = async () =>
      await sendPosclientMessage({
        subdomain,
        action: 'health_check',
        data: { token: allowPos.token },
        pos: allowPos,
        isRPC: true
      });

    const timeout = (cb, interval) => () =>
      new Promise(resolve => setTimeout(() => cb(resolve), interval));

    const onTimeout = timeout(resolve => resolve({}), 3000);

    let response = { healthy: 'down' };
    await Promise.race([longTask, onTimeout].map(f => f())).then(
      result => (response = result as { healthy: string })
    );

    if (response && response.healthy === 'ok') {
      healthyBranchIds.push(allowPos.branchId);
      break;
    }
  }

  return await sendCoreMessage({
    subdomain,
    action: 'branches.find',
    data: { query: { _id: { $in: healthyBranchIds } } },
    isRPC: true,
    defaultValue: []
  });
};

export const confirmLoyalties = async (subdomain: string, order: IPosOrder) => {
  const confirmItems = (order.items || []).filter(i => i.bonusCount) || [];

  if (!confirmItems.length) {
    return;
  }
  const checkInfo = {};

  for (const item of confirmItems) {
    checkInfo[item.productId] = {
      voucherId: item.bonusVoucherId,
      count: item.bonusCount
    };
  }

  try {
    await sendLoyaltiesMessage({
      subdomain,
      action: 'confirmLoyalties',
      data: {
        checkInfo
      }
    });
  } catch (e) {
    console.log(e.message);
  }
};

const updateCustomer = async ({ subdomain, doneOrder }) => {
  const deliveryInfo = doneOrder.deliveryInfo || {};
  const {
    marker = {},
    address,
    description,
    phone,
    email,
    saveInfo
  } = deliveryInfo;

  const customerType = doneOrder.customerType || 'customer';
  if (
    saveInfo &&
    doneOrder.customerId &&
    ['customer', 'company'].includes(customerType)
  ) {
    const moduleTxt = customerType === 'company' ? 'companies' : 'customers';

    const pushInfo: any = {};

    if (
      marker &&
      (marker.longitude || marker.lng) &&
      (marker.latitude || marker.lat)
    ) {
      pushInfo.addresses = {
        id: `${marker.longitude || marker.lng}_${marker.latitude ||
          marker.lat}`,
        location: {
          type: 'Point',
          coordinates: [
            marker.longitude || marker.lng,
            marker.latitude || marker.lat
          ]
        },
        address,
        short: description
      };
    }

    if (phone) {
      pushInfo.phones = phone;
    }

    if (email) {
      pushInfo.emails = email;
    }

    if (Object.keys(pushInfo).length) {
      await sendContactsMessage({
        subdomain,
        action: `${moduleTxt}.updateOne`,
        data: {
          selector: { _id: doneOrder.customerId },
          modifier: {
            $addToSet: pushInfo
          }
        },
        isRPC: true
      });
    }
  }
};

const createDeliveryDeal = async ({ subdomain, models, doneOrder, pos }) => {
  const { deliveryConfig = {} } = pos;
  const deliveryInfo = doneOrder.deliveryInfo || {};
  const { marker = {}, description } = deliveryInfo;

  const dealsData: any = {
    name: `Delivery: ${doneOrder.number}`,
    startDate: doneOrder.createdAt,
    closeDate: doneOrder.dueDate,
    description,
    stageId: deliveryConfig.stageId,
    assignedUserIds: deliveryConfig.assignedUserIds,
    watchedUserIds: deliveryConfig.watchedUserIds,
    productsData: doneOrder.items.map(i => ({
      productId: i.productId,
      uom: 'PC',
      currency: 'MNT',
      quantity: i.count,
      unitPrice: i.unitPrice,
      amount: i.count * i.unitPrice,
      tickUsed: true
    }))
  };

  if (deliveryConfig.mapCustomField) {
    // {
    //   "locationValue": {
    //     "type": "Point",
    //     "coordinates": [
    //       106.936283111572,
    //       47.920138551642
    //     ]
    //   },
    //   "field": "dznoBhE3XCkCaHuBX",
    //   "value": {
    //     "lat": 47.920138551642,
    //     "lng": 106.936283111572
    //   },
    //   "stringValue": "106.93628311157227,47.920138551642026"
    // }
    dealsData.customFieldsData = [
      {
        field: deliveryConfig.mapCustomField.replace('customFieldsData.', ''),
        locationValue: {
          type: 'Point',
          coordinates: [
            marker.longitude || marker.lng,
            marker.latitude || marker.lat
          ]
        },
        value: {
          lat: marker.latitude || marker.lat,
          lng: marker.longitude || marker.lng,
          description: 'location'
        },
        stringValue: `${marker.longitude || marker.lng},${marker.latitude ||
          marker.lat}`
      }
    ];
  }

  if ((doneOrder.deliveryInfo || {}).dealId) {
    const deal = await sendCardsMessage({
      subdomain,
      action: 'deals.updateOne',
      data: {
        selector: { _id: doneOrder.deliveryInfo.dealId },
        modifier: dealsData
      },
      isRPC: true,
      defaultValue: {}
    });

    await sendCardsMessage({
      subdomain,
      action: 'pipelinesChanged',
      data: {
        pipelineId: deliveryConfig.pipelineId,
        action: 'itemUpdate',
        data: {
          item: deal,
          destinationStageId: deliveryConfig.stageId
        }
      }
    });
  } else {
    const deal = await sendCardsMessage({
      subdomain,
      action: 'deals.create',
      data: dealsData,
      isRPC: true,
      defaultValue: {}
    });

    if (
      doneOrder.customerId &&
      deal._id &&
      ['customer', 'company'].includes(doneOrder.customerType || 'customer')
    ) {
      await sendCoreMessage({
        subdomain,
        action: 'conformities.addConformity',
        data: {
          mainType: 'deal',
          mainTypeId: deal._id,
          relType: doneOrder.customerType || 'customer',
          relTypeId: doneOrder.customerId
        },
        isRPC: true
      });
    }

    await sendCardsMessage({
      subdomain,
      action: 'pipelinesChanged',
      data: {
        pipelineId: deliveryConfig.pipelineId,
        action: 'itemAdd',
        data: {
          item: deal,
          destinationStageId: deliveryConfig.stageId
        }
      }
    });

    await models.PosOrders.updateOne(
      { _id: doneOrder },
      {
        $set: {
          deliveryInfo: {
            ...deliveryInfo,
            dealId: deal._id
          }
        }
      }
    );
  }
};

export const statusToDone = async ({
  subdomain,
  models,
  order,
  pos
}: {
  subdomain;
  models;
  order;
  pos;
}) => {
  // must have
  const doneOrder = await models.PosOrders.findOne({
    _id: order._id
  }).lean();

  if (!doneOrder) {
    return {};
  }

  await createDeliveryDeal({ subdomain, models, doneOrder, pos });

  await updateCustomer({ subdomain, doneOrder });

  return {
    status: 'success'
  };
};

const createDealPerOrder = async ({ subdomain, pos, newOrder }) => {
  // ===> sync cards config then
  const { cardsConfig } = pos;

  const currentCardsConfig: any = (Object.values(cardsConfig || {}) || []).find(
    c =>
      (c || ({} as any)).branchId && (c as any).branchId === newOrder.branchId
  );

  if (currentCardsConfig && currentCardsConfig.stageId) {
    const cardDeal = await sendCardsMessage({
      subdomain,
      action: 'deals.create',
      data: {
        name: `Cards: ${newOrder.number}`,
        startDate: newOrder.createdAt,
        description: newOrder.deliveryInfo ? newOrder.deliveryInfo.address : '',
        stageId: currentCardsConfig.stageId,
        assignedUserIds: currentCardsConfig.assignedUserIds,
        productsData: newOrder.items.map(i => ({
          productId: i.productId,
          uom: 'PC',
          currency: 'MNT',
          quantity: i.count,
          unitPrice: i.unitPrice,
          amount: i.count * i.unitPrice,
          tickUsed: true
        }))
      },
      isRPC: true,
      defaultValue: {}
    });

    if (newOrder.customerId && cardDeal._id) {
      await sendCoreMessage({
        subdomain,
        action: 'conformities.addConformity',
        data: {
          mainType: 'deal',
          mainTypeId: cardDeal._id,
          relType: newOrder.customerType || 'customer',
          relTypeId: newOrder.customerId
        },
        isRPC: true
      });
    }

    await sendCardsMessage({
      subdomain,
      action: 'pipelinesChanged',
      data: {
        pipelineId: currentCardsConfig.pipelineId,
        action: 'itemAdd',
        data: {
          item: cardDeal,
          destinationStageId: currentCardsConfig.stageId
        }
      }
    });
  }
  // end sync cards config then <
};

const syncErkhetRemainder = async ({ subdomain, models, pos, newOrder }) => {
  if (!(pos.erkhetConfig && pos.erkhetConfig.isSyncErkhet)) {
    return;
  }
  const resp = await sendSyncerkhetMessage({
    subdomain,
    action: 'toOrder',
    data: {
      pos,
      order: newOrder
    },
    isRPC: true,
    defaultValue: {},
    timeout: 50000
  });

  if (resp.message || resp.error) {
    const txt = JSON.stringify({
      message: resp.message,
      error: resp.error
    });

    await models.PosOrders.updateOne(
      { _id: newOrder._id },
      { $set: { syncErkhetInfo: txt } }
    );
  }
};

const syncInventoriesRem = async ({
  subdomain,
  newOrder,
  oldBranchId,
  pos
}) => {
  if (!(pos.checkRemainder && newOrder.departmentId)) {
    return;
  }

  if (
    (!oldBranchId && newOrder.branchId) ||
    (oldBranchId && oldBranchId !== newOrder.branchId)
  ) {
    sendInventoriesMessage({
      subdomain,
      action: 'remainders.updateMany',
      data: {
        branchId: newOrder.branchId,
        departmentId: newOrder.departmentId,
        productsData: (newOrder.items || []).map(item => ({
          productId: item.productId,
          uom: item.uom,
          diffCount: -1 * item.count
        }))
      }
    });
  }

  if (oldBranchId && oldBranchId !== newOrder.branchId) {
    sendInventoriesMessage({
      subdomain,
      action: 'remainders.updateMany',
      data: {
        branchId: oldBranchId,
        departmentId: newOrder.departmentId,
        productsData: (newOrder.items || []).map(item => ({
          productId: item.productId,
          uom: item.uom,
          diffCount: item.count
        }))
      }
    });
  }
};

export const syncOrderFromClient = async ({
  subdomain,
  models,
  order,
  items,
  pos,
  posToken,
  responses,
  oldBranchId
}: {
  subdomain: string;
  models: IModels;
  order;
  items;
  pos: IPosDocument;
  posToken: string;
  responses;
  oldBranchId: string;
}) => {
  for (const response of responses || []) {
    if (response && response._id) {
      await sendEbarimtMessage({
        subdomain,
        action: 'putresponses.createOrUpdate',
        data: { _id: response._id, doc: { ...response, posToken } },
        isRPC: true
      });
    }
  }

  await models.PosOrders.updateOne(
    { _id: order._id },
    {
      $set: {
        ...order,
        posToken,
        items,
        branchId: order.branchId || pos.branchId,
        departmentId: order.departmentId || pos.departmentId
      }
    },
    { upsert: true }
  );

  const newOrder = await models.PosOrders.findOne({ _id: order._id }).lean();

  if (!newOrder) {
    return;
  }

  if (newOrder.customerId) {
    await sendAutomationsMessage({
      subdomain,
      action: 'trigger',
      data: {
        type: 'pos:posOrder',
        targets: [newOrder]
      }
    });
  }

  await confirmLoyalties(subdomain, newOrder);

  await createDealPerOrder({ subdomain, pos, newOrder });

  if (pos.isOnline && newOrder.branchId) {
    const toPos = await models.Pos.findOne({
      branchId: newOrder.branchId
    }).lean();

    // paid order info to offline pos
    if (toPos) {
      await sendPosclientMessage({
        subdomain,
        action: 'erxes-posclient-to-pos-api',
        data: {
          order: { ...newOrder, posToken, subToken: toPos.token }
        },
        pos: toPos
      });
    }
  }

  await syncErkhetRemainder({ subdomain, models, pos, newOrder });

  await syncInventoriesRem({ subdomain, newOrder, oldBranchId, pos });

  const syncedResponeIds = (
    (await sendEbarimtMessage({
      subdomain,
      action: 'putresponses.find',
      data: {
        query: { _id: { $in: (responses || []).map(resp => resp._id) } }
      },
      isRPC: true,
      defaultValue: []
    })) || []
  ).map(r => r._id);

  // return info saved
  await sendPosclientMessage({
    subdomain,
    action: `updateSynced`,
    data: {
      status: 'ok',
      posToken,
      responseIds: syncedResponeIds,
      orderId: newOrder._id
    },
    pos
  });
};
