import { debugError } from './debuggers';
import { sendInboxMessage } from './messageBroker';
import { getInstagramUser } from './utils';
import { IModels } from './connectionResolver';
import { wabaUserDetail } from './utils';
import { IIntegrationDocument } from './models/Integrations';
import { ICustomerDocument } from './models/definitions/customers';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';
import { INTEGRATION_KINDS } from './constants';

export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  userId: string,
  kind: string,
  userInfo: any,
  integration: IIntegrationDocument
) => {
  const waId = userInfo[0]?.wa_id;
  const name = userInfo[0]?.profile?.name;
  const integrationId = integration.erxesApiId; // Ensure integration is defined
  let customer = await models.Customers.findOne({ userId });
  if (customer) {
    return customer;
  }

  try {
    customer = await models.Customers.create({
      userId,
      phoneNumber: waId, // Using the extracted WhatsApp ID
      firstName: name,
      integrationId
    });
  } catch (e) {
    throw new Error(
      e.message.includes('duplicate')
        ? 'Concurrent request: customer duplication'
        : e
    );
  }
  // save on api
  try {
    const apiCustomerResponse = await sendInboxMessage({
      subdomain,
      action: 'integrations.receive',
      data: {
        action: 'get-create-update-customer',
        payload: JSON.stringify({
          integrationId: integrationId,
          primaryPhone: waId,
          isUser: true
        })
      },
      isRPC: true
    });

    customer.erxesApiId = apiCustomerResponse._id;
    await customer.save();
  } catch (e) {
    await models.Customers.deleteOne({ _id: customer._id });
    throw new Error(e);
  }
  return customer;
};

export const customerCreated = async (
  userId: string,
  firstName: string,
  integrationId: any,
  profilePic: any,
  subdomain: any,
  models: IModels,
  customer: any,
  integration: any
) => {
  try {
    customer = await models.Customers.create({
      userId,
      firstName: firstName,
      integrationId: integrationId,
      profilePic: profilePic
    });
  } catch (e) {
    throw new Error(
      e.message.includes('duplicate')
        ? 'Concurrent request: customer duplication'
        : e.message
    );
  }
  try {
    const apiCustomerResponse = await sendInboxMessage({
      subdomain,
      action: 'integrations.receive',
      data: {
        action: 'get-create-update-customer',
        payload: JSON.stringify({
          integrationId: integration.erxesApiId,
          firstName: firstName,
          avatar: profilePic,
          isUser: true
        })
      },
      isRPC: true
    });
    customer.erxesApiId = apiCustomerResponse._id;
    await customer.save();
  } catch (e) {
    // Delete the customer if saving to the API fails
    await models.Customers.deleteOne({ _id: customer._id });
    throw new Error(e.message);
  }
};
