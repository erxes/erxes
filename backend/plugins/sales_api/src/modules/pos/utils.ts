import * as _ from 'underscore';
import {
  redis,
  isEnabled,
  checkServiceRunning,
  sendWorkerMessage,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels, generateModels } from '~/connectionResolvers';
import { IPosOrder, IPosOrderDocument } from './@types/orders';
import { IPosDocument } from './@types/pos';
import { sendCoreMessage } from '~/trpc/init-trpc';
import { sendPosclientHealthCheck, sendPosclientMessage } from '~/initWorker';

export const getConfig = async (code: string, defaultValue?: any) => {
  return await sendTRPCMessage({
    method: 'query',
    pluginName: 'core',
    module: 'config',
    action: 'getConfig',
    input: { code, defaultValue },
  });
};

export const getChildCategories = async (subdomain: string, categoryIds) => {
  const childs = await sendTRPCMessage({
    pluginName: 'core',
    module: 'productCategories',
    action: 'withChilds',
    input: { _ids: categoryIds },
    defaultValue: [],
  });

  const catIds: string[] = (childs || []).map((ch) => ch._id) || [];
  return Array.from(new Set(catIds));
};

const getChildTags = async (subdomain: string, tagIds) => {
  const childs = await sendCoreMessage({
    pluginName: 'core',
    module: 'tag',
    action: 'findWithChild',
    input: { query: { _id: { $in: tagIds } }, fields: { _id: 1 } },
    defaultValue: [],
  });

  const foundTagIds: string[] = (childs || []).map((ch) => ch._id) || [];
  return Array.from(new Set(foundTagIds));
};

export const getBranchesUtil = async (
  subdomain: string,
  models: IModels,
  posToken: string,
) => {
  const pos = await models.Pos.findOne({ token: posToken }).lean();

  if (!pos) {
    return { error: 'not found pos' };
  }

  const allowsPos = await models.Pos.find({
    isOnline: { $ne: true },
    branchId: { $in: pos.allowBranchIds },
  })
    .sort({ onServer: -1, name: 1 })
    .lean();

  let healthyBranchIds = [] as any;

  const { ALL_AUTO_INIT } = process.env;

  if ([true, 'true', 'True', '1'].includes(ALL_AUTO_INIT || '')) {
    healthyBranchIds = allowsPos.map((p) => p.branchId);
  } else {
    for (const allowPos of allowsPos) {
      if (healthyBranchIds.includes(allowPos.branchId)) {
        continue;
      }

      const response = await sendPosclientHealthCheck({
        subdomain,
        pos: allowPos,
      });

      if (response && response.healthy === 'ok') {
        healthyBranchIds.push(allowPos.branchId);
      }
    }
  }

  return await sendCoreMessage({
    method: 'query',
    pluginName: 'core',
    module: 'branches',
    action: 'find',
    input: {
      query: { _id: { $in: healthyBranchIds } },
      fields: {
        _id: 1,
        title: 1,
        address: 1,
        radius: 1,
        phoneNumber: 1,
        email: 1,
        coordinate: 1,
        image: 1,
        code: 1,
        order: 1,
        status: 1,
        links: 1,
      },
    },
    defaultValue: [],
  });
};

export const confirmLoyalties = async (subdomain: string, order: IPosOrder) => {
  const models = await generateModels(subdomain);

  const pos = await models.Pos.findOne({
    token: order.posToken,
    paymentTypes: {
      $elemMatch: {
        type: { $in: (order?.paidAmounts || []).map(({ type }) => type) },
        scoreCampaignId: { $exists: true },
      },
    },
  });

  if (pos) {
    const { paymentTypes = [] } = pos;
    for (const paymentType of paymentTypes) {
      if (
        paymentType.scoreCampaignId &&
        (order?.paidAmounts || []).find(({ type }) => type === paymentType.type)
      ) {
        try {
          await sendTRPCMessage({
            pluginName: 'loyalty',
            module: 'scores',
            action: 'doScoreCampaign',
            input: {
              ownerType: order.customerType || 'customer',
              ownerId: order.customerId,
              campaignId: paymentType.scoreCampaignId,
              target: order,
              actionMethod: 'subtract',
              serviceName: 'pos',
              targetId: (order as any)?._id,
            },
          });
        } catch (error) {
          console.log(error);
          throw new Error(error.message);
        }
      }
    }
  }

  const confirmItems = order.items || [];

  if (!confirmItems.length) {
    return;
  }
  const checkInfo = {};

  for (const item of confirmItems) {
    checkInfo[item.productId] = {
      voucherId: item.bonusVoucherId,
      count: item.bonusCount,
    };
  }

  try {
    await sendTRPCMessage({
      pluginName: 'loyalty',
      module: 'loyalty',
      action: 'confirmLoyalties',
      input: {
        checkInfo,
        extraInfo: {
          ...(order.extraInfo || {}),
          ownerType: order.customerType?.trim() || 'customer',
          ownerId: order.customerId || null,
          targetType: 'pos',
          targetId: (order as any)?._id,
        },
      },
    });
  } catch (e) {
    throw new Error(e.message);
  }
};

const otherPlugins = async (subdomain, newOrder, oldOrder?, userId?) => {
  const value = await redis.get('afterMutations');
  const afterMutations = JSON.parse(value || '{}');

  if (
    afterMutations['pos:order'] &&
    afterMutations['pos:order']['synced'] &&
    afterMutations['pos:order']['synced'].length
  ) {
    const user = await sendCoreMessage({
      pluginName: 'core',
      module: 'users',
      action: 'users.findOne',
      input: { _id: userId },
      defaultValue: {},
    });

    for (const service of afterMutations['pos:order']['synced']) {
      // TODO: change message
      // await sendMessage(`${service}:afterMutation`, {
      //   subdomain,
      //   data: {
      //     type: 'pos:order',
      //     action: 'synced',
      //     object: oldOrder || newOrder,
      //     updatedDocument: newOrder,
      //     newData: newOrder,
      //     user
      //   }
      // });
    }
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
    saveInfo,
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
        id: `${marker.longitude || marker.lng}_${
          marker.latitude || marker.lat
        }`,
        location: {
          type: 'Point',
          coordinates: [
            marker.longitude || marker.lng,
            marker.latitude || marker.lat,
          ],
        },
        address,
        short: description,
      };
    }

    if (phone) {
      pushInfo.phones = phone;
    }

    if (email) {
      pushInfo.emails = email;
    }

    if (Object.keys(pushInfo).length) {
      await sendTRPCMessage({
        method: 'mutation',
        pluginName: 'core',
        module: moduleTxt,
        action: 'updateOne',
        input: {
          selector: { _id: doneOrder.customerId },
          modifier: {
            $addToSet: pushInfo,
          },
        },
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
    description: `<p>${doneOrder.description || ''}</p> <p>${
      description || ''
    }</p>`,
    stageId: deliveryConfig.stageId,
    assignedUserIds: deliveryConfig.assignedUserIds,
    watchedUserIds: deliveryConfig.watchedUserIds,
    productsData: doneOrder.items.map((i) => ({
      productId: i.productId,
      uom: 'PC',
      currency: 'MNT',
      quantity: i.count,
      unitPrice: i.unitPrice,
      amount: i.count * i.unitPrice,
      tickUsed: true,
    })),
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
            marker.latitude || marker.lat,
          ],
        },
        value: {
          lat: marker.latitude || marker.lat,
          lng: marker.longitude || marker.lng,
          description: 'location',
        },
        stringValue: `${marker.longitude || marker.lng},${
          marker.latitude || marker.lat
        }`,
      },
    ];
  }

  if ((doneOrder.deliveryInfo || {}).dealId) {
    const deal = await sendTRPCMessage({
      method: 'mutation',
      pluginName: 'sales',
      module: 'deals',
      action: 'updateOne',
      input: {
        selector: { _id: doneOrder.deliveryInfo.dealId },
        modifier: dealsData,
      },
    });

    await sendTRPCMessage({
      method: 'mutation',
      pluginName: 'sales',
      module: 'deals',
      action: 'salesPipelinesChanged',
      input: {
        pipelineId: deliveryConfig.pipelineId,
        action: 'itemUpdate',
        data: {
          item: deal,
          destinationStageId: deliveryConfig.stageId,
        },
      },
    });
  } else {
    const deal = await sendTRPCMessage({
      method: 'mutation',
      pluginName: 'sales',
      module: 'deals',
      action: 'create',
      input: {
        ...dealsData,
      },
    });

    if (
      doneOrder.customerId &&
      deal._id &&
      ['customer', 'company'].includes(doneOrder.customerType || 'customer')
    ) {
      await sendTRPCMessage({
        method: 'mutation',
        pluginName: 'core',
        module: 'conformities',
        action: 'addConformity',
        input: {
          mainType: 'deal',
          mainTypeId: deal._id,
          relType: doneOrder.customerType || 'customer',
          relTypeId: doneOrder.customerId,
        },
      });
    }

    await sendTRPCMessage({
      method: 'mutation',
      pluginName: 'sales',
      module: 'deals',
      action: 'salesPipelinesChanged',
      input: {
        pipelineId: deliveryConfig.pipelineId,
        action: 'itemAdd',
        data: {
          item: deal,
          destinationStageId: deliveryConfig.stageId,
        },
      },
    });

    await models.PosOrders.updateOne(
      { _id: doneOrder },
      {
        $set: {
          deliveryInfo: {
            ...deliveryInfo,
            dealId: deal._id,
          },
        },
      },
    );
  }
};

export const statusToDone = async ({
  subdomain,
  models,
  order,
  pos,
}: {
  subdomain;
  models;
  order;
  pos;
}) => {
  // must have
  const doneOrder = await models.PosOrders.findOne({
    _id: order._id,
  }).lean();

  if (!doneOrder) {
    return {};
  }

  await createDeliveryDeal({ subdomain, models, doneOrder, pos });

  await updateCustomer({ subdomain, doneOrder });

  if (pos.isOnline && doneOrder.subBranchId) {
    const toPos = await models.Pos.findOne({
      branchId: doneOrder.subBranchId,
      _id: { $ne: pos._id },
    })
      .sort({ onServer: -1, name: 1 })
      .lean();

    // paid order info to offline pos
    if (toPos) {
      await sendPosclientMessage({
        subdomain,
        action: 'erxes-posclient-to-pos-api',
        data: {
          order: {
            ...doneOrder,
            posToken: doneOrder.posToken,
            subToken: toPos.token,
            status: 'reDoing',
          },
        },
        pos: toPos,
      });
    }
  }

  return {
    status: 'success',
  };
};

const createDealPerOrder = async ({
  subdomain,
  models,
  pos,
  newOrder,
}: {
  subdomain: string;
  models: IModels;
  pos: IPosDocument;
  newOrder: IPosOrderDocument;
}) => {
  // ===> sync cards config then
  const { cardsConfig } = pos;

  const currentCardsConfig: any = (Object.values(cardsConfig || {}) || []).find(
    (c) =>
      (c || ({} as any)).branchId && (c as any).branchId === newOrder.branchId,
  );

  if (currentCardsConfig && currentCardsConfig.stageId) {
    const paymentsData: any = {};
    if (newOrder.cashAmount) {
      paymentsData.cash = {
        amount: newOrder.cashAmount,
        currency: 'MNT',
      };
    }
    if (newOrder.mobileAmount) {
      paymentsData.bank = {
        amount: newOrder.cashAmount,
        currency: 'MNT',
      };
    }
    if (newOrder.paidAmounts?.length) {
      let otherAmount = 0;
      for (const paidAmount of newOrder.paidAmounts) {
        otherAmount += paidAmount.amount;
      }
      paymentsData.other = {
        amount: newOrder.paidAmounts.reduce(
          (sum, curr) => curr.amount + sum,
          0,
        ),
        currency: 'MNT',
      };
    }

    const cardDeal = await sendTRPCMessage({
      method: 'mutation',
      pluginName: 'sales',
      module: 'deals',
      action: 'create',
      input: {
        name: `Cards: ${newOrder.number}`,
        startDate: newOrder.createdAt,
        description: `<p>${newOrder.description}</p>`,
        stageId: currentCardsConfig.stageId,
        assignedUserIds: currentCardsConfig.assignedUserIds,
        productsData: (newOrder.items || []).map((i) => ({
          productId: i.productId,
          uom: 'PC',
          currency: 'MNT',
          quantity: i.count,
          unitPrice: i.unitPrice,
          amount: i.count * (i.unitPrice || 0),
          tickUsed: true,
        })),
        paymentsData,
      },
    });

    if (newOrder.customerId && cardDeal._id) {
      await sendTRPCMessage({
        method: 'mutation',
        pluginName: 'core',
        module: 'conformities',
        action: 'addConformity',
        input: {
          mainType: 'deal',
          mainTypeId: cardDeal._id,
          relType: newOrder.customerType || 'customer',
          relTypeId: newOrder.customerId,
        },
      });
    }
    await sendTRPCMessage({
      method: 'mutation',
      pluginName: 'sales',
      module: 'deals',
      action: 'salesPipelinesChanged',
      input: {
        pipelineId: currentCardsConfig.pipelineId,
        action: 'itemAdd',
        data: {
          item: cardDeal,
          destinationStageId: currentCardsConfig.stageId,
        },
      },
    });

    await models.PosOrders.updateOne(
      { _id: newOrder._id },
      { $set: { convertDealId: cardDeal._id } },
    );
    return cardDeal._id;
  }
  // end sync cards config then <
  return;
};

const syncErkhetRemainder = async ({ subdomain, models, pos, newOrder }) => {
  if (!(pos.erkhetConfig && pos.erkhetConfig.isSyncErkhet)) {
    return;
  }
  let resp;

  if (newOrder.isPre && !newOrder.paidDate) {
    // TODO: CallPrepaymentFromSubServices erkhet rmq beldeh, holboh
    return;
  }

  if (newOrder.status === 'return') {
    resp = await sendTRPCMessage({
      method: 'mutation',
      pluginName: 'coreintegration',
      module: 'syncerkhet',
      action: 'returnOrder',
      input: {
        pos,
        order: newOrder,
      },
      // timeout: 50000
    });
  } else {
    resp = await sendTRPCMessage({
      method: 'mutation',
      pluginName: 'coreintegration',
      module: 'syncerkhet',
      action: 'toOrder',
      input: {
        pos,
        order: newOrder,
      },
      // timeout: 50000
    });
  }

  if (resp && (resp.message || resp.error)) {
    const txt = JSON.stringify({
      message: resp.message,
      error: resp.error,
    });

    await models.PosOrders.updateOne(
      { _id: newOrder._id },
      { $set: { syncErkhetInfo: txt } },
    );
  }
};

const syncInventoriesRem = async ({
  subdomain,
  newOrder,
  oldBranchId,
  pos,
}) => {
  if (!(pos.checkRemainder && newOrder.departmentId)) {
    return;
  }

  let multiplier = 1;
  if (newOrder.status === 'return') {
    multiplier = -1;
  }

  if (newOrder.isPre) {
    if (!newOrder.paidDate) {
      if (
        newOrder.branchId &&
        (!oldBranchId || oldBranchId !== newOrder.branchId)
      ) {
        await sendTRPCMessage({
          method: 'mutation',
          pluginName: 'accounting',
          module: 'remainders',
          action: 'updateMany',
          input: {
            branchId: newOrder.branchId,
            departmentId: newOrder.departmentId,
            productsData: (newOrder.items || []).map((item) => ({
              productId: item.productId,
              uom: item.uom,
              diffSoonOut: item.count * multiplier,
            })),
          },
        });
      }

      if (oldBranchId && oldBranchId !== newOrder.branchId) {
        await sendTRPCMessage({
          method: 'mutation',
          pluginName: 'accounting',
          module: 'remainders',
          action: 'updateMany',
          input: {
            branchId: oldBranchId,
            departmentId: newOrder.departmentId,
            productsData: (newOrder.items || []).map((item) => ({
              productId: item.productId,
              uom: item.uom,
              diffSoonOut: -1 * item.count * multiplier,
            })),
          },
        });
      }

      return;
    }
  }
  // ene doorhuudiig bas paidDate shalgah tuhai bodoh
  // jich bas jururiin salbariin zb bodoh, neg salbar deer l zaragdaj baiga avch salbar deer zuvhun tur hadgalah
  // ene ni techstore bas adil baina

  if (
    newOrder.branchId &&
    (!oldBranchId || oldBranchId !== newOrder.branchId)
  ) {
    await sendTRPCMessage({
      method: 'mutation',
      pluginName: 'accounting',
      module: 'remainders',
      action: 'updateMany',
      input: {
        branchId: newOrder.branchId,
        departmentId: newOrder.departmentId,
        productsData: (newOrder.items || []).map((item) => ({
          productId: item.productId,
          uom: item.uom,
          diffCount: -1 * item.count * multiplier,
          diffSoonOut: newOrder.isPre ? -1 * item.count * multiplier : 0,
        })),
      },
    });
  }

  if (oldBranchId && oldBranchId !== newOrder.branchId) {
    await sendTRPCMessage({
      method: 'mutation',
      pluginName: 'accounting',
      module: 'remainders',
      action: 'updateMany',
      input: {
        branchId: oldBranchId,
        departmentId: newOrder.departmentId,
        productsData: (newOrder.items || []).map((item) => ({
          productId: item.productId,
          uom: item.uom,
          diffCount: item.count * multiplier,
          diffSoonOut: newOrder.isPre ? item.count * multiplier : 0,
        })),
      },
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
}: {
  subdomain: string;
  models: IModels;
  order;
  items;
  pos: IPosDocument;
  posToken: string;
  responses;
}) => {
  const oldOrder = await models.PosOrders.findOne({ _id: order._id }).lean();
  const oldBranchId = oldOrder ? oldOrder.branchId : '';

  if (await isEnabled('ebarimt')) {
    for (const response of responses || []) {
      if (response && response._id) {
        await sendTRPCMessage({
          method: 'mutation',
          pluginName: 'coreintegration',
          module: 'putresponses',
          action: 'createOrUpdate',
          input: { _id: response._id, doc: { ...response, posToken } },
          defaultValue: [],
        });
      }
    }
  }

  await models.PosOrders.updateOne(
    { _id: order._id },
    {
      $set: {
        ...order,
        posToken,
        items,
        scopeBrandIds: pos.scopeBrandIds,
        branchId: order.branchId || pos.branchId,
        departmentId: order.departmentId || pos.departmentId,
      },
    },
    { upsert: true },
  );

  const newOrder = await models.PosOrders.findOne({ _id: order._id }).lean();

  if (!newOrder) {
    return;
  }

  let convertDealId;
  if (newOrder.paidDate) {
    if (newOrder.customerId && (await checkServiceRunning('automations'))) {
      try {
        sendWorkerQueue('automations', 'trigger').add('trigger', {
          subdomain,
          data: { type: 'pos:posOrder', targets: [newOrder] },
        });
      } catch (e) {
        console.log(subdomain, e.message);
      }
    }

    try {
      await confirmLoyalties(subdomain, newOrder);
    } catch (e) {
      console.log(subdomain, e.message);
    }

    try {
      await otherPlugins(subdomain, newOrder, oldOrder, newOrder.userId);
    } catch (e) {
      console.log(subdomain, e.message);
    }

    try {
      convertDealId = await createDealPerOrder({
        subdomain,
        models,
        pos,
        newOrder,
      });
    } catch (e) {
      console.log(subdomain, e.message);
    }
  }

  if (pos.isOnline && newOrder.subBranchId) {
    const toPos = await models.Pos.findOne({
      branchId: newOrder.subBranchId,
      _id: { $ne: pos._id },
    })
      .sort({ onServer: -1, name: 1 })
      .lean();

    // paid order info to offline pos
    if (toPos) {
      await sendPosclientMessage({
        subdomain,
        action: 'erxes-posclient-to-pos-api',
        data: {
          order: {
            ...newOrder,
            convertDealId,
            posToken,
            subToken: toPos.token,
          },
        },
        pos: toPos,
      });
    }

    // change branch and before another pos synced then remove from befort sync
    if (
      oldOrder &&
      oldOrder.subBranchId &&
      newOrder.subBranchId !== oldOrder.subBranchId
    ) {
      const toCancelPos = await models.Pos.findOne({
        branchId: oldOrder.subBranchId,
        _id: { $ne: pos._id },
      }).lean();

      if (toCancelPos) {
        await sendPosclientMessage({
          subdomain,
          action: 'erxes-posclient-to-pos-api-remove',
          data: {
            order: { ...newOrder, posToken, subToken: toCancelPos.token },
          },
          pos: toCancelPos,
        });
      }
    }
  }

  if (newOrder.paidDate) {
    try {
      await syncErkhetRemainder({ subdomain, models, pos, newOrder });
    } catch (e) {
      console.log(subdomain, e.message);
    }

    try {
      await syncInventoriesRem({ subdomain, newOrder, oldBranchId, pos });
    } catch (e) {
      console.log(subdomain, e.message);
    }
  }

  const syncedResponseIds = (
    (await sendTRPCMessage({
      pluginName: 'coreintegration',
      module: 'putresponses',
      action: 'find',
      input: {
        query: { _id: { $in: (responses || []).map((resp) => resp._id) } },
      },
      defaultValue: [],
    })) || []
  ).map((r) => r._id);

  // return info saved
  await sendPosclientMessage({
    subdomain,
    action: `updateSynced`,
    data: {
      status: 'ok',
      posToken,
      responseIds: syncedResponseIds,
      orderId: newOrder._id,
      convertDealId,
    },
    pos,
  });
};

const checkProductsByRule = async (subdomain, products, rule) => {
  let filterIds: string[] = [];
  const productIds = products.map((p) => p._id);

  if (rule.productCategoryIds?.length) {
    const includeCatIds = await getChildCategories(
      subdomain,
      rule.productCategoryIds,
    );

    const includeProductIdsCat = products
      .filter((p) => includeCatIds.includes(p.categoryId))
      .map((p) => p._id);
    filterIds = filterIds.concat(
      _.intersection(includeProductIdsCat, productIds),
    );
  }

  if (rule.tagIds?.length) {
    const includeTagIds = await getChildTags(subdomain, rule.tagIds);

    const includeProductIdsTag = products
      .filter((p) => _.intersection(includeTagIds, p.tagIds || []).length)
      .map((p) => p._id);
    filterIds = filterIds.concat(
      _.intersection(includeProductIdsTag, productIds),
    );
  }

  if (rule.productIds?.length) {
    filterIds = filterIds.concat(_.intersection(rule.productIds, productIds));
  }

  if (!filterIds.length) {
    return [];
  }

  // found an special products
  const filterProducts = products.filter((p) => filterIds.includes(p._id));
  if (rule.excludeCatIds?.length) {
    const excludeCatIds = await getChildCategories(
      subdomain,
      rule.excludeCatIds,
    );

    const excProductIdsCat = filterProducts
      .filter((p) => excludeCatIds.includes(p.categoryId))
      .map((p) => p._id);
    filterIds = filterIds.filter((f) => !excProductIdsCat.includes(f));
  }

  if (rule.excludeTagIds?.length) {
    const excludeTagIds = await getChildTags(subdomain, rule.excludeTagIds);

    const excProductIdsTag = filterProducts
      .filter((p) => _.intersection(excludeTagIds, p.tagIds || []).length)
      .map((p) => p._id);
    filterIds = filterIds.filter((f) => !excProductIdsTag.includes(f));
  }

  if (rule.excludeProductIds?.length) {
    filterIds = filterIds.filter((f) => !rule.excludeProductIds.includes(f));
  }

  return filterIds;
};

export const calcProductsTaxRule = async (
  subdomain: string,
  config,
  products,
) => {
  const vatRules =
    (config?.reverseVatRules?.length &&
      (await sendTRPCMessage({
        pluginName: 'coreintegration',
        module: 'productRules',
        action: 'find',
        input: { _id: { $in: config.reverseVatRules } },
        defaultValue: [],
      }))) ||
    [];

  const ctaxRules =
    (config?.reverseCtaxRules?.length &&
      (await sendTRPCMessage({
        pluginName: 'coreintegration',
        module: 'productRules',
        action: 'find',
        input: { _id: { $in: config.reverseCtaxRules } },
        defaultValue: [],
      }))) ||
    [];

  const productsById = {};
  for (const product of products) {
    productsById[product._id] = product;
  }

  if (vatRules.length) {
    for (const rule of vatRules) {
      const productIdsByRule = await checkProductsByRule(
        subdomain,
        products,
        rule,
      );

      for (const pId of productIdsByRule) {
        if (!productsById[pId].taxRule) {
          productsById[pId].taxRule = {};
        }

        productsById[pId].taxRule.taxCode = rule.taxCode;
        productsById[pId].taxRule.taxType = rule.taxType;
      }
    }
  }

  if (ctaxRules.length) {
    for (const rule of ctaxRules) {
      const productIdsByRule = await checkProductsByRule(
        subdomain,
        products,
        rule,
      );

      for (const pId of productIdsByRule) {
        if (!productsById[pId].taxRule) {
          productsById[pId].taxRule = {};
        }

        productsById[pId].taxRule.citytaxCode = rule.taxCode;
        productsById[pId].taxRule.citytaxPercent = rule.taxPercent;
      }
    }
  }

  return productsById;
};
