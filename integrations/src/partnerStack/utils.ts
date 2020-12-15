import * as request from 'request-promise';
import { sendRPCMessage } from '../messageBroker';
import { Integrations } from '../models';
import { getConfig } from '../utils';
import { Customers } from './partner';

const API_URL = 'https://api.partnerstack.com';

export const createWebhook = async integrationId => {
  let integration = await Integrations.findOne({
    $and: [{ erxesApiId: integrationId }, { kind: 'partnerStack' }]
  });

  if (integration) {
    throw new Error('Integration has already been created');
  }

  const webhookUrl = await getConfig('PARTNER_STACK_WEBHOOK_CALLBACK_URL');

  if (!webhookUrl) {
    throw new Error('Webhook url is not configured');
  }

  const password = await getConfig('PARTNER_STACK_SECRET_KEY');

  if (!password) {
    throw new Error('Secret Key is not configured');
  }

  const username = await getConfig('PARTNER_STACK_KEY');

  if (!username) {
    throw new Error('Public Key is not configured');
  }

  const auth =
    'Basic ' + Buffer.from(username + ':' + password).toString('base64');

  const options = {
    uri: `${API_URL}/v1/webhooks`,
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: auth
    },
    body: {
      event: 'partnership_created',
      target_url: webhookUrl
    },
    json: true
  };

  try {
    const { rdata } = await request(options);
    const { key } = rdata;

    integration = await Integrations.create({
      kind: 'partnerStack',
      erxesApiId: integrationId,
      partnerStackKey: key
    });
  } catch (e) {
    await Integrations.deleteOne({ _id: integration.id });
    throw new Error(e.message);
  }
};
export const createCustomer = async email => {
  let customer = await Customers.findOne({ email });

  if (customer) {
    return customer;
  }

  const password = await getConfig('PARTNER_STACK_SECRET_KEY');

  if (!password) {
    throw new Error('Secret Key is not configured');
  }

  const username = await getConfig('PARTNER_STACK_KEY');

  if (!username) {
    throw new Error('Public Key is not configured');
  }

  const auth =
    'Basic ' + Buffer.from(username + ':' + password).toString('base64');

  const options = {
    uri: `${API_URL}/v1/partnerships/${email}`,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: auth
    },
    json: true
  };

  const integration = await Integrations.findOne({
    kind: 'partnerStack'
  });

  try {
    const { rdata } = await request(options);

    customer = await Customers.create({
      email: rdata.email,
      firstName: rdata.first_name,
      lastName: rdata.last_name,
      phone: rdata.phone_number || '',
      partnerId: rdata.key,
      partnerKey: rdata.partner_key,
      groupId: rdata.group.id,
      groupName: rdata.group.name,
      joinedAt: new Date(rdata.joined_at),
      integrationId: integration._id
    });

    // save on api
    try {
      const apiCustomerResponse = await sendRPCMessage({
        action: 'get-create-update-customer',
        payload: JSON.stringify({
          integrationId: integration.erxesApiId,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phones: [customer.phone],
          primaryPhone: customer.phone,
          emails: [customer.email],
          primaryEmail: customer.email,
          isUser: true
        })
      });

      customer.erxesApiId = apiCustomerResponse._id;

      await customer.save();
    } catch (e) {
      await Customers.deleteOne({ _id: customer._id });
      throw e;
    }
  } catch (e) {
    throw new Error(e.message);
  }
};
