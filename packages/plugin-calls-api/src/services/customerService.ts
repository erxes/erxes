import { getOrCreateErxesCustomer } from './apiClient';

const DUPLICATE_KEY_ERROR_CODE = 11000;

export const findOrCreateCustomer = async (
  models,
  subdomain,
  primaryPhone,
  inboxIntegrationId,
) => {
  let customer = await models.Customers.findOne({
    primaryPhone,
    status: 'completed',
  });
  if (customer) {
    return customer;
  }

  try {
    customer = await models.Customers.create({
      inboxIntegrationId,
      primaryPhone,
      status: 'pending',
    });
  } catch (e) {
    if (e.code === DUPLICATE_KEY_ERROR_CODE) {
      return await models.Customers.findOne({ primaryPhone });
    }
    throw e;
  }

  try {
    const apiCustomer = await getOrCreateErxesCustomer(
      subdomain,
      inboxIntegrationId,
      primaryPhone,
    );

    customer.erxesApiId = apiCustomer._id;
    customer.status = 'completed';
    await customer.save();

    return customer;
  } catch (apiError) {
    await models.Customers.deleteOne({ _id: customer._id });
    throw new Error(
      `Failed to create customer in Erxes API: ${apiError.message}`,
    );
  }
};
