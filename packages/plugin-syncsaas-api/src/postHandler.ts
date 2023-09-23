import { getSubdomain } from '@erxes/api-utils/src/core';
import { debugError } from '@erxes/api-utils/src/debuggers';
import { CUSTOMER_STATUSES } from './common/constants';
import { generateModels } from './connectionResolver';
import { sendCustomerMobileNotification } from './utils';

const sendErrorMessage = messsage => {
  return { message: messsage };
};

export const postHandler = async (req, res) => {
  const subdomain = getSubdomain(req);
  const { action } = req.headers || {};

  const { data } = req.body || {};

  if (!action) {
    res.send(sendErrorMessage('no action type in request params'));
    return;
  }

  if (action === 'customerApproved') {
    res.send(await customerRequest(subdomain, data));
    return;
  }

  if (action === 'dealStageChanged') {
    res.send(await dealDone(subdomain, data));
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

const customerRequest = async (subdomain, data) => {
  const models = await generateModels(subdomain);

  const { triggerType = '', target = {} } = data || {};

  if (!triggerType || !Object.keys(target).length) {
    return 'no data';
  }

  let syncCustomerIds: any = {};

  if (triggerType.includes('cards')) {
    const { customers } = target;

    syncCustomerIds = generateIds(customers);
  }

  if (triggerType.includes('contacts')) {
    syncCustomerIds = target?._id ? [target._id] : [];
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
      await sendCustomerMobileNotification({
        subdomain,
        title: `Customer Approved`,
        body: `You approved on ${syncNames}`,
        recieverIds: customerIds,
        data: customersSyncs.map(({ customerId, syncId }) => {
          const syncDetail = syncs.find(sync => sync._id === syncId);
          return {
            customerId,
            subdomain: syncDetail?.subdomain,
            name: syncDetail?.name
          };
        })
      });
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

const dealDone = async (subdomain, data) => {
  const { triggerType, target } = data;

  if (!triggerType.includes('cards')) {
    return 'unsupported trigger type';
  }

  const models = await generateModels(subdomain);

  const syncedDeal = await models.SyncedDeals.findOne({ dealId: target?._id });

  if (!syncedDeal) {
    return 'not found deal';
  }
  const sync = await models.Sync.findOne({ _id: syncedDeal.syncId });

  if (!sync) {
    return 'something went wrong';
  }

  const dealDetail = await models.SyncedDeals.dealDetail(sync, target?._id);

  const customerIds = await models.SyncedCustomers.find({
    syncedCustomerId: syncedDeal.syncedCustomerId
  });

  try {
    await sendCustomerMobileNotification({
      subdomain,
      title: `Deal`,
      body: `${dealDetail?.name} moved to ${dealDetail?.stage?.name} on ${sync.subdomain}`,
      recieverIds: customerIds,
      data: { appToken: sync?.appToken, subdomain: sync?.subdomain }
    });
    return 'done';
  } catch (error) {
    debugError(
      `Error occurred during send customer notification: ${error.message}`
    );
  }
};
