import { getSubdomain } from '@erxes/api-utils/src/core';
import { CUSTOMER_STATUSES } from './common/constants';
import { generateModels } from './connectionResolver';
import { sendCoreMessage } from './messageBroker';

export const postHandler = async (req, res) => {
  const subdomain = getSubdomain(req);
  const { action } = req.params || {};

  const { data } = req.body || {};

  if (action === 'customerApproved') {
    const result = await customerRequest(subdomain, data);
    res.send(result);
  }

  if (action === 'doneDeal') {
    res.send(await dealDone(subdomain, data));
  }
};

const customerRequest = async (subdomain, data) => {
  const models = await generateModels(subdomain);

  const { triggerType = '', target = {} } = data || {};

  if (!triggerType || !Object.keys(target).length) {
    return 'no data';
  }

  let syncedCustomerId: any = '';

  if (triggerType.includes('cards')) {
    const { customers } = target;

    syncedCustomerId = { $in: customers };
  }

  if (triggerType.includes('contacts')) {
    syncedCustomerId = target?._id;
  }

  const syncedCustomerIds = await models.SyncedCustomers.find({
    syncedCustomerId
  }).distinct('_id');

  await models.SyncedCustomers.updateMany(
    {
      _id: { $in: syncedCustomerIds }
    },
    { $set: { status: CUSTOMER_STATUSES.APPROVED } }
  );

  return 'done';
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

  sendCoreMessage({
    subdomain: 'os',
    action: 'sendMobileNotification',
    data: {
      title: `Deal`,
      body: `${dealDetail?.name} moved to ${dealDetail?.stage?.name} on ${sync.subdomain}`,
      receivers: customerIds,
      data: { appToken: sync?.appToken, subdomain: sync?.subdomain }
    }
  });
};
