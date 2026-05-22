import { sendTRPCMessage } from "erxes-api-shared/utils";
import { orderDeleteToErkhet, getPosPostData, sendErkhetPost } from "./utils";

const getErrorMessage = (error: any) =>
  error?.message || error?.errorMessage || `${error}`;

const setOrderErkhetResponse = async ({
  subdomain,
  orderId,
  message,
}: {
  subdomain: string;
  orderId: string;
  message: string;
}) => {
  await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    module: 'pos',
    action: 'orders.updateOne',
    method: 'mutation',
    input: {
      selector: { _id: orderId },
      modifier: {
        syncErkhetInfo: message,
      },
    },
    defaultValue: {},
  });
};

export const syncPosOrderToErkhet = async ({
  subdomain,
  models,
  order,
  userId,
}: {
  subdomain: string;
  models: any;
  order: any;
  userId?: string;
}) => {
  const posId = order.posId;

  if (!posId) {
    return;
  }

  const config = await models.Configs.getConfigValue(
    'posOrderErkhetConfig',
    posId,
  );

  if (!config?.posId || config.posId !== posId) {
    return;
  }

  const pos = await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    module: 'pos',
    action: 'configs.findOne',
    method: 'query',
    input: { _id: posId },
    defaultValue: null,
  });

  if (!pos) {
    return;
  }

  const syncLog = await models.SyncLogs.syncLogsAdd({
    contentType: 'pos:order',
    createdAt: new Date(),
    createdBy: userId,
    contentId: order._id,
    consumeData: order,
    consumeStr: JSON.stringify(order),
  });

  try {
    let response;

    if (order.status === 'return') {
      response = await orderDeleteToErkhet(subdomain, pos, order, config);
    } else {
      const postData = await getPosPostData(
        subdomain,
        pos,
        order,
        pos.paymentTypes,
        config,
      );

      if (!postData) {
        throw new Error('Erkhet POS order config not found');
      }

      response = await sendErkhetPost(
        models,
        syncLog,
        'get-response-send-order-info',
        postData,
      );
    }

    if (response?.message || response?.error) {
      await setOrderErkhetResponse({
        subdomain,
        orderId: order._id,
        message: JSON.stringify({
          message: response.message,
          error: response.error,
        }),
      });
      return;
    }

    await setOrderErkhetResponse({
      subdomain,
      orderId: order._id,
      message: 'success',
    });
  } catch (e) {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      { $set: { error: getErrorMessage(e) } },
    );
    await setOrderErkhetResponse({
      subdomain,
      orderId: order._id,
      message: getErrorMessage(e),
    });
  }
};
