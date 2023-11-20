import { debugError } from './debuggers';
import { sendRPCMessage } from './messageBroker';
import { getInstagramUser } from './utils';
import { IModels } from './connectionResolver';

export const getOrCreateCustomer = async (
  models: IModels,
  pageId: string,
  userId: string,
  facebookPageIds: string[],
  facebookPageTokensMap: { [key: string]: string }
) => {
  let customer = await models.Customers.findOne({ userId });

  if (customer) {
    return customer;
  }

  const integration = await models.Integrations.getIntegration({
    $and: [{ instagramPageId: { $in: pageId } }, { kind: 'instagram' }]
  });

  // create customer
  let instagramUser = {} as {
    name: string;
    profile_pic: string;
    id: string;
  };

  try {
    instagramUser =
      (await getInstagramUser(
        userId,
        facebookPageIds,
        facebookPageTokensMap
      )) || {};
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
    console.log(e);
    throw new Error(
      e.message.includes('duplicate')
        ? 'Concurrent request: customer duplication'
        : e
    );
  }

  // save on api
  try {
    const apiCustomerResponse = await sendRPCMessage({
      action: 'get-create-update-customer',
      payload: JSON.stringify({
        integrationId: integration.erxesApiId,
        firstName: instagramUser.name,
        avatar: instagramUser.profile_pic,
        isUser: true
      })
    });

    customer.erxesApiId = apiCustomerResponse._id;
    await customer.save();
  } catch (e) {
    console.log(e);
    await models.Customers.deleteOne({ _id: customer._id });
    throw new Error(e);
  }
  return customer;
};
