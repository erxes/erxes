import { sendRPCMessage } from '../messageBroker';
import { IIntegration } from '../models/Integrations';
import { Customers } from './models';

export interface IUser {
  id: string;
  created_timestamp: string;
  name: string;
  screen_name: string;
  protected: boolean;
  verified: boolean;
  followers_count: number;
  friends_count: number;
  statuses_count: number;
  profile_image_url: string;
  profile_image_url_https: string;
}

export const getOrCreateCustomer = async (integration: IIntegration, userId: string, receiver: IUser) => {
  let customer = await Customers.findOne({ userId });

  if (customer) {
    return customer;
  }

  // save on integrations db
  try {
    customer = await Customers.create({
      userId: receiver.id,
      profilePic: receiver.profile_image_url_https,
      name: receiver.name,
      screenName: receiver.screen_name,
    });
  } catch (e) {
    throw new Error(e.message.includes('duplicate') ? 'Concurrent request: customer duplication' : e);
  }

  // save on api
  try {
    const apiCustomerResponse = await sendRPCMessage({
      action: 'get-create-update-customer',
      payload: JSON.stringify({
        integrationId: integration.erxesApiId,
        firstName: receiver.screen_name,
        avatar: receiver.profile_image_url_https,
        isUser: true,
      }),
    });

    customer.erxesApiId = apiCustomerResponse._id;
    await customer.save();
  } catch (e) {
    await Customers.deleteOne({ _id: customer._id });
    throw new Error(e);
  }

  return customer;
};
