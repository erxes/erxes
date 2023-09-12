import { CUSTOMER_STATUSES } from './common/constants';
import { generateModels } from './connectionResolver';

export const postHandler = async (req, res) => {
  const { action, subdomain } = req.headers || {};

  const { data } = req.body || {};

  if (action === 'customerApproved') {
    const result = await customerRequest(subdomain, data);
    res.send(result);
  }

  if (action === 'doneDeal') {
  }
};

const customerRequest = async (subdomain, data) => {
  const models = await generateModels(subdomain);

  const { triggerType, target } = data;

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
      _id: syncedCustomerIds
    },
    { $set: { status: CUSTOMER_STATUSES.APPROVED } }
  );

  return 'done';
};
