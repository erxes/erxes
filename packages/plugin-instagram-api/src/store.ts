import { debugError } from './debuggers';
import { sendInboxMessage, sendRPCMessage } from './messageBroker';
import { getInstagramUser } from './utils';
import { IModels } from './connectionResolver';
export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  pageId: string,
  userId: string,
  facebookPageIds: string[] | undefined,
  facebookPageTokensMap?: { [key: string]: string }
) => {
  let customer = await models.Customers.findOne({ userId });
  if (customer) {
    return customer;
  }

  const integration = await models.Integrations.getIntegration({
    $and: [
      { instagramPageIds: { $in: pageId } },
      { kind: 'instagram-messenger' }
    ]
  });

  // create customer
  let instagramUser = {} as {
    name: string;
    profile_pic: string;
    id: string;
  };

  try {
    instagramUser = await getInstagramUser(
      userId,
      facebookPageIds || [],
      facebookPageTokensMap
    );
  } catch (e) {
    debugError(`Error during get customer info: ${e.message}`);
  }
  // save on integrations db
  try {
    customer = await models.Customers.create({
      userId,
      firstName: instagramUser.name,
      integrationId: integration.erxesApiId,
      profilePic: instagramUser.profile_pic
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
          integrationId: integration.erxesApiId,
          firstName: instagramUser.name,
          avatar: instagramUser.profile_pic,
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
