import { afterMutationHandlers } from './afterMutations';
import { generateModels, IModels } from './connectionResolver';
import { IPosDocument } from './models/definitions/pos';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { orderToErkhet } from './utils';
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

    const { action, posToken, syncId, response, order, items } = data;
    const pos = await models.Pos.findOne({ token: posToken }).lean();
    const syncInfos = { ...pos.syncInfos, ...{ [syncId]: new Date() } };

    await models.Pos.updateOne({ _id: pos._id }, { $set: { syncInfos } });

    // ====== if (action === 'statusToDone')
    if (action === 'statusToDone') {
      // must have
      const doneOrder = await models.PosOrders.findOne({
        _id: order._id
      }).lean();

      const { deliveryConfig = {} } = pos;
      const deliveryInfo = doneOrder.deliveryInfo || {};
      const { marker = {} } = deliveryInfo;
      const { cardsConfig = {} } = pos;
      const currentCardsConfig = cardsConfig.carsConfig.find(
        c => c.branchId && c.branchId === doneOrder.branchId
      );

      if (currentCardsConfig) {
        const cardDeal = await sendCardsMessage({
          subdomain,
          action: 'deals.create',
          data: {
            name: `Cards: ${doneOrder.number}`,
            startDate: doneOrder.createdAt,
            description: deliveryInfo?.address || '',
            stageId: currentCardsConfig.stageId,
            assignedUserIds: currentCardsConfig.assignedUserIds,
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
      }

      const deal = await sendCardsMessage({
        subdomain,
        action: '',
        data: {
          name: `Delivery: ${doneOrder.number}`,
          startDate: doneOrder.createdAt,
          description: deliveryInfo.address,
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
                coordinates: [marker.longitude, marker.latitude]
              },
              value: {
                lat: marker.latitude,
                lng: marker.longitude,
                description: 'location'
              },
              stringValue: `${marker.longitude},${marker.latitude}`
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
      data: { _id: response._id, doc: { ...response, posToken, syncId } },
      isRPC: true
    });

    await models.PosOrders.updateOne(
      { _id: order._id },
      {
        $set: {
          ...order,
          posToken,
          syncId,
          items,
          branchId: order.branchId || pos.branchId
        }
      },
      { upsert: true }
    );

    const newOrder = await models.PosOrders.findOne({ _id: order._id }).lean();
    // return info saved
    sendPosclientMessage({
      subdomain,
      action: `updateSynced`,
      data: {
        status: 'ok',
        posToken,
        syncId,
        responseId: response._id,
        orderId: order._id,
        thirdService: true
      },
      pos
    });

    if (newOrder.type === 'delivery' && newOrder.branchId) {
      const toPos = await models.Pos.findOne({ branchId: newOrder.branchId });

      // paid order info to offline pos
      // TODO: this message RPC, offline pos has seen by this message check
      if (toPos) {
        await sendPosclientMessage({
          subdomain,
          action: 'vrpc_queue:erxes-pos-to-pos',
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

export const getChannels = async (
  models: IModels,
  channel: string,
  pos?: IPosDocument,
  excludeTokens?: string[]
) => {
  const channels: string[] = [];
  const allPos = pos ? [pos] : await models.Pos.find().lean();

  for (const p of allPos) {
    if (
      excludeTokens &&
      excludeTokens.length &&
      excludeTokens.includes(p.token)
    ) {
      continue;
    }

    const syncIds = Object.keys(p.syncInfos || {}) || [];

    if (!syncIds.length) {
      continue;
    }

    for (const syncId of syncIds) {
      const syncDate = p.syncInfos[syncId];

      // expired sync 72 hour
      if ((new Date().getTime() - syncDate.getTime()) / (60 * 60 * 1000) > 72) {
        continue;
      }
      channels.push(`${channel}_${syncId}`);
    }
  }
  return channels;
};

export const sendPosclientMessage = async (
  args: ISendMessageArgs & {
    pos?: IPosDocument | undefined;
    excludeTokens?: string[];
  }
) => {
  const { subdomain, action, pos, excludeTokens } = args;
  const models = await generateModels(subdomain);
  const channels = await getChannels(models, action, pos, excludeTokens);
  for (const ch of channels) {
    console.log(ch);
    await sendMessage({
      client,
      serviceDiscovery,
      serviceName: 'posclient',
      ...args,
      action: `${ch}`
    });
  }
};

export default function() {
  return client;
}
