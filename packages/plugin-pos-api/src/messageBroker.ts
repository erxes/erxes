import { generateModels, IModels } from './connectionResolver';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { IPosDocument } from './models/definitions/pos';
import { orderToErkhet } from './utils';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('vrpc_queue:erxes-pos-to-api', async ({ subdomain, data }) => {
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
    sendCommonMessage(`vrpc_queue:erxes-pos-from-api_${syncId}`, {
      status: 'ok',
      posToken,
      syncId,
      responseId: response._id,
      orderId: order._id,
      thirdService: true
    });

    if (newOrder.type === 'delivery' && newOrder.branchId) {
      const toPos = await models.Pos.findOne({ branchId: newOrder.branchId });

      // paid order info to offline pos
      // TODO: this message RPC, offline pos has seen by this message check
      if (toPos) {
        await sendPosMessage(
          models,
          client,
          'vrpc_queue:erxes-pos-to-pos',
          { order: { ...newOrder, posToken } },
          toPos
        );
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

  consumeRPCQueue('erxes-pos-to-api', async msg => {
    const { action, data, posToken } = msg;
    const models = await generateModels('subdomain');

    try {
      if (action === 'newCustomer') {
        const customer = await sendContactsMessage({
          subdomain: 'subdomain',
          action: 'customers.createCustomer',
          data,
          isRPC: true
        });

        await sendPosMessage(
          models,
          client,
          'pos:crudData',
          { action: 'create', type: 'customer', object: customer || {} },
          undefined,
          [posToken]
        );

        return { status: 'success', data: customer };
      }
    } catch (e) {
      return { status: 'error', errorMessage: e.message };
    }
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

export const sendCommonMessage = async (channel, message): Promise<any> => {
  return client.sendMessage(channel, message);
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
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

export const sendPosMessage = async (
  models: IModels,
  messageBroker: any,
  channel: string,
  params: any,
  pos?: IPosDocument | undefined,
  excludeTokens?: string[]
) => {
  const channels = await getChannels(models, channel, pos, excludeTokens);
  for (const ch of channels) {
    messageBroker().sendMessage(ch, params);
  }
};

export const sendRPCPosMessage = async (
  models: IModels,
  messageBroker: any,
  channel: string,
  params: any,
  pos?: IPosDocument,
  excludeTokens?: string[]
) => {
  const channels = await getChannels(models, channel, pos, excludeTokens);
  let ch = (channels && channels.length && channels[0]) || '';
  if (!ch) {
    return {};
  }

  return await messageBroker().sendRPCMessage(ch, params);
};

export default function() {
  return client;
}
