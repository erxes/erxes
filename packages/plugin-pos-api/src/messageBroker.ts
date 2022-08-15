import { afterMutationHandlers } from './afterMutations';
import { generateModels, IModels } from './connectionResolver';
import { IPosDocument } from './models/definitions/pos';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { orderToErkhet, getBranchesUtil } from './utils';
import { serviceDiscovery } from './configs';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('pos:afterMutation', async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
    return;
  });

  consumeQueue('pos:createOrUpdateOrders', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { action, posToken, response, order, items } = data;
    const pos = await models.Pos.findOne({ token: posToken }).lean();

    // ====== if (action === 'statusToDone')
    if (action === 'statusToDone') {
      // must have
      const doneOrder = await models.PosOrders.findOne({
        _id: order._id
      }).lean();

      const { deliveryConfig = {} } = pos;
      const deliveryInfo = doneOrder.deliveryInfo || {};
      const { marker = {}, description } = deliveryInfo;

      const deal = await sendCardsMessage({
        subdomain,
        action: 'create',
        data: {
          name: `Delivery: ${doneOrder.number}`,
          startDate: doneOrder.createdAt,
          description,
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
          customFieldsData: [
            {
              field: deliveryConfig.mapCustomField.replace(
                'customFieldsData.',
                ''
              ),
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
              stringValue: `${marker.longitude ||
                marker.lng},${marker.latitude || marker.lat}`
            }
          ],
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
        },
        isRPC: true,
        defaultValue: {}
      });

      if (doneOrder.customerId && deal._id) {
        await sendCoreMessage({
          subdomain,
          action: 'conformities.addConformity',
          data: {
            mainType: 'deal',
            mainTypeId: deal._id,
            relType: 'customer',
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

      return {
        status: 'success'
      };
    }

    // ====== if (action === 'makePayment')
    await sendEbarimtMessage({
      subdomain,
      action: 'putresponses.createOrUpdate',
      data: { _id: response._id, doc: { ...response, posToken } },
      isRPC: true
    });

    await models.PosOrders.updateOne(
      { _id: order._id },
      {
        $set: {
          ...order,
          posToken,
          items,
          branchId: order.branchId || pos.branchId
        }
      },
      { upsert: true }
    );

    const newOrder = await models.PosOrders.findOne({ _id: order._id }).lean();

    // ===> sync cards config then
    const { cardsConfig = [] } = pos;
    const currentCardsConfig = cardsConfig.find(
      c => c.branchId && c.branchId === newOrder.branchId
    );

    if (currentCardsConfig) {
      const cardDeal = await sendCardsMessage({
        subdomain,
        action: 'deals.create',
        data: {
          name: `Cards: ${newOrder.number}`,
          startDate: newOrder.createdAt,
          description: newOrder.deliveryInfo
            ? newOrder.deliveryInfo.address
            : '',
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
            relType: 'customer',
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

    // return info saved
    sendPosclientMessage({
      subdomain,
      action: `updateSynced`,
      data: {
        status: 'ok',
        posToken,
        responseId: response._id,
        orderId: order._id
      },
      pos
    });

    console.log(newOrder.type, newOrder.branchId, '1111111111111111');
    if (newOrder.type === 'delivery' && newOrder.branchId) {
      const toPos = await models.Pos.findOne({ branchId: newOrder.branchId });

      // paid order info to offline pos
      // TODO: this message RPC, offline pos has seen by this message check
      console.log(
        toPos ? `${toPos.token}, ${toPos._id}` : '',
        '22222222222222222222222222'
      );
      if (toPos) {
        console.log(toPos.token, 'dddddddddddddddddddddddddddddd', posToken);
        await sendPosclientMessage({
          subdomain,
          action: 'erxes-posclient-to-pos-api',
          data: {
            order: { ...newOrder, posToken }
          },
          pos: toPos
        });
      }
    }

    await orderToErkhet(
      subdomain,
      models,
      client,
      pos,
      order._id,
      response._id
    );

    return {
      status: 'success'
    };
  });

  consumeRPCQueue('pos:findSlots', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.PosSlots.find({ posId: data.posId }).lean()
    };
  });

  consumeRPCQueue('pos:ecommerceGetBranches', async ({ subdomain, data }) => {
    const { posToken } = data;

    const models = await generateModels(subdomain);
    return {
      status: 'success',
      data: await getBranchesUtil(subdomain, models, posToken)
    };
  });

  consumeRPCQueue('pos:ordersDeliveryInfo', async ({ subdomain, data }) => {
    const { orderId } = data;
    const models = await generateModels(subdomain);

    const order = await models.PosOrders.findOne({ _id: orderId }).lean();

    // on kitchen
    if (!order.deliveryInfo) {
      return {
        status: 'success',
        data: {
          error: 'Deleted delivery information.'
        }
      };
    }

    if (!order.deliveryInfo.dealId) {
      return {
        status: 'success',
        data: {
          _id: order._id,
          status: 'onKitchen',
          date: order.paidDate
        }
      };
    }

    const dealId = order.deliveryInfo.dealId;
    const deal = await sendCardsMessage({
      subdomain,
      action: 'deals.findOne',
      data: { _id: dealId },
      isRPC: true
    });

    if (!deal) {
      return {
        status: 'success',
        data: {
          error: 'Deleted delivery information.'
        }
      };
    }

    const stage = await sendCardsMessage({
      subdomain,
      action: 'stages.findOne',
      data: { _id: deal.stageId },
      isRPC: true
    });

    return {
      status: 'success',
      data: {
        _id: order._id,
        status: stage.name,
        date: deal.stageChangedDate || deal.modifiedDate || deal.createdAt
      }
    };
  });
};

export const sendProductsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'products',
    ...args
  });
};

export const sendCardsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'cards',
    ...args
  });
};

export const sendContactsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'contacts',
    ...args
  });
};

export const sendEbarimtMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'ebarimt',
    ...args
  });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'core',
    ...args
  });
};

export const sendPosclientMessage = async (
  args: ISendMessageArgs & {
    pos: IPosDocument;
  }
) => {
  const { action, pos } = args;
  let lastAction = action;
  let serviceName = 'posclient';

  const { ALL_AUTO_INIT } = process.env;

  if (
    ![true, 'true', 'True', '1'].includes(ALL_AUTO_INIT || '') &&
    !pos.onServer
  ) {
    lastAction = `posclient:${action}_${pos.token}`;
    serviceName = '';
    args.data.thirdService = true;
  }

  args.data.token = pos.token;

  return await sendMessage({
    client,
    serviceDiscovery,
    serviceName,
    ...args,
    action: lastAction
  });
};

export default function() {
  return client;
}
