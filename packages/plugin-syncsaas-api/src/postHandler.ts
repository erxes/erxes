import { getSubdomain } from '@erxes/api-utils/src/core';
import { debugError } from '@erxes/api-utils/src/debuggers';
import { CUSTOMER_STATUSES } from './common/constants';
import { generateModels } from './connectionResolver';
import { sendCustomerMobileNotification } from './utils';
import { sendCPMessage } from './messageBroker';

const sendErrorMessage = messsage => {
  return { message: messsage };
};

export const postHandler = async (req, res) => {
  const subdomain = getSubdomain(req);
  const { action } = req.headers || {};

  const { data = {}, triggerType = '' } = req.body || {};

  if (!action) {
    res.send(sendErrorMessage('no action type in request params'));
    return;
  }

  if (action === 'customerApproved') {
    res.send(await customerRequest(subdomain, data, triggerType));
    return;
  }

  if (action === 'dealStageChanged') {
    res.send(await dealStageChange(subdomain, data, triggerType));
    return;
  }

  res.send(sendErrorMessage('sendErrorMessage'));
};

const generateIds = value => {
  if (value.includes(', ')) {
    return value.split(', ');
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    return [value];
  }

  return [];
};

const customerRequest = async (subdomain, data, triggerType) => {
  const models = await generateModels(subdomain);

  if (!triggerType || !Object.keys(data).length) {
    return 'no data';
  }

  let syncCustomerIds: any = {};

  if (triggerType.includes('cards')) {
    const { customers } = data;

    syncCustomerIds = generateIds(customers);
  }

  if (triggerType.includes('contacts')) {
    syncCustomerIds = data?._id ? [data._id] : [];
  }

  const customersSyncs = await models.SyncedCustomers.find({
    syncedCustomerId: { $in: syncCustomerIds }
  });

  if (!!customersSyncs?.length) {
    const customerIds = customersSyncs.map(
      customerSync => customerSync.customerId
    );

    const syncs = await models.Sync.find({
      _id: customersSyncs.map(customersSync => customersSync.syncId)
    });

    const syncNames = syncs.map(sync => sync.name).join(',');

    try {
      await sendCPMessage({
        subdomain,
        action: 'sendNotification',
        data: {
          title: `Customer Approved`,
          receivers: customerIds,
          notifType: 'system',
          content: `You approved on ${syncNames}`,
          eventData: customersSyncs.map(({ customerId, syncId }) => {
            const syncDetail = syncs.find(sync => sync._id === syncId);
            return {
              customerId,
              subdomain: syncDetail?.subdomain,
              name: syncDetail?.name
            };
          }),
          isMobile: true
        },
        isRPC: true
      });
      // await sendCustomerMobileNotification({
      //   subdomain,
      //   title: `Customer Approved`,
      //   body: `You approved on ${syncNames}`,
      //   recieverIds: customerIds,
      // data:
      // });
    } catch (error) {
      debugError(
        `Error occurred during send customer notification: ${error.message}`
      );
    }
  }

  await models.SyncedCustomers.updateMany(
    {
      _id: { $in: customersSyncs.map(customersSync => customersSync._id) }
    },
    { $set: { status: CUSTOMER_STATUSES.APPROVED } }
  );

  return { message: 'done' };
};

const dealStageChange = async (subdomain, data, triggerType) => {
  if (!triggerType.includes('cards')) {
    return 'unsupported trigger type';
  }

  const models = await generateModels(subdomain);

  const syncedDeal = await models.SyncedDeals.findOne({ dealId: data?._id });

  if (!syncedDeal) {
    return 'not found deal';
  }
  const sync = await models.Sync.findOne({ _id: syncedDeal.syncId });

  if (!sync) {
    return 'something went wrong';
  }

  const dealDetail = await models.SyncedDeals.dealDetail(sync, data?._id);

  const customerIds = await models.SyncedCustomers.find({
    syncedCustomerId: syncedDeal.syncedCustomerId
  });

  try {
    await sendCPMessage({
      subdomain,
      action: 'sendNotification',
      data: {
        title: `${triggerType.split(':')[1]} changed`,
        receivers: customerIds,
        notifType: 'system',
        content: `${dealDetail?.name} moved to ${dealDetail?.stage?.name} on ${sync.subdomain}`,
        eventData: { appToken: sync?.appToken, subdomain: sync?.subdomain },
        isMobile: true
      }
    });
    return 'done';
  } catch (error) {
    debugError(
      `Error occurred during send customer notification: ${error.message}`
    );
  }
};
