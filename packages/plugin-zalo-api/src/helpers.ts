import { generateModels, IModels } from './connectionResolver';
import { getConfig, resetConfigsCache } from './commonUtils';
import { getEnv, getSubdomain } from '@erxes/api-utils/src/core';
import { sendRequest } from '@erxes/api-utils/src';
import { debug } from './configs';
import { sendInboxMessage } from './messageBroker';

export const updateConfigs = async (
  models: IModels,
  configsMap
): Promise<void> => {
  await models.Configs.updateConfigs(configsMap);

  resetConfigsCache();
};

export const zaloCreateIntegration = async (
  models: IModels,
  { accountId, integrationId, data, kind }
) => {
  const account = await models.Accounts.getAccount({ _id: accountId });
  const oa_id = account?.oa_id;

  const integration = await models.Integrations.create({
    kind,
    accountId,
    erxesApiId: integrationId,
    oa_id
  });

  //   const oaTokensMap: { [key: string]: string } = {};

  //   for (const pageId of oa_id) {
  //       try {
  //           const pageAccessToken = await getPageAccessToken(
  //               pageId,
  //               account.token
  //           );

  //           oaTokensMap[pageId] = pageAccessToken;

  //           try {
  //               // await subscribePage(pageId, pageAccessToken);
  //               // debugFacebook(`Successfully subscribed page ${pageId}`);
  //           } catch (e) {
  //               // debugError(
  //               //     `Error ocurred while trying to subscribe page ${e.message ||
  //               //         e}`
  //               // );
  //               throw e;
  //           }
  //       } catch (e) {
  //           // debugError(
  //           //     `Error ocurred while trying to get page access token with ${e.message ||
  //           //         e}`
  //           // );

  //           throw e;
  //       }
  //   }

  // integration.facebookPageTokensMap = facebookPageTokensMap;

  //   await integration.save();

  return { status: 'success' };
};

export const removeIntegration = async (
  models: IModels,
  integrationErxesApiId: string
): Promise<string> => {
  const integration = await models.Integrations.findOne({
    erxesApiId: integrationErxesApiId
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  const { _id, kind, accountId, erxesApiId } = integration;

  const account = await models.Accounts.findOne({ _id: accountId });

  const selector = { integrationId: _id };

  if (kind.includes('zalo')) {
    //   debugFacebook('Removing entries');

    if (!account) {
      throw new Error('Account not found');
    }

    //   for (const pageId of integration.oa_id || []) {
    // let pageTokenResponse;

    // try {
    //   pageTokenResponse = await getPageAccessToken(pageId, account.token);
    // } catch (e) {
    //   debugError(
    //     `Error ocurred while trying to get page access token with ${e.message}`
    //   );
    // }

    // await models.Posts.deleteMany({ recipientId: pageId });
    // await models.Comments.deleteMany({ recipientId: pageId });

    // try {
    //   await unsubscribePage(pageId, pageTokenResponse);
    // } catch (e) {
    //   debugError(
    //     `Error occured while trying to unsubscribe page pageId: ${pageId}`
    //   );
    // }
    //   }

    //   const conversationIds = await models.Conversations.find(selector).distinct(
    //     '_id'
    //   );

    //   await models.Customers.deleteMany({
    //     integrationId: integrationErxesApiId
    //   });

    //   await models.Conversations.deleteMany(selector);
    //   await models.ConversationMessages.deleteMany({
    //     conversationId: { $in: conversationIds }
    //   });

    await models.Integrations.deleteOne({ _id });
  }

  await models.Integrations.deleteOne({ _id });

  return erxesApiId;
};

export const zaloSendRequest = async (
  models,
  subdomain,
  accountId,
  { url, method, params }
) => {
  const account = await models.Accounts.getAccount({ _id: accountId });
  const { access_token, refresh_token } = account;

  let response: any = {};

  try {
    response = (await sendRequest({
      url,
      method: method || 'POST',
      headers: {
        access_token: access_token
      },
      params
    })) || { error: -1 };

    if (response.hasOwnProperty('error') && response?.error == -216) {
      const models = await generateModels(subdomain);
      const ZALO_APP_ID = await getConfig(models, 'ZALO_APP_ID');
      const ZALO_APP_SECRET_KEY = await getConfig(
        models,
        'ZALO_APP_SECRET_KEY'
      );

      const getToken =
        (await sendRequest({
          url: 'https://oauth.zaloapp.com/v4/oa/access_token',
          method: 'POST',
          headers: {
            secret_key: ZALO_APP_SECRET_KEY,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          params: {
            refresh_token,
            app_id: ZALO_APP_ID,
            secret_key: ZALO_APP_SECRET_KEY,
            grant_type: 'refresh_token'
          }
        })) || {};

      const authInfo = JSON.parse(getToken);

      if (authInfo?.hasOwnProperty('error')) {
        return;
      }

      await models.Accounts.updateOne(
        { _id: account._id },
        {
          $set: authInfo
        }
      );

      response =
        (await sendRequest({
          url,
          method: method || 'POST',
          headers: {
            access_token: authInfo?.access_token
          },
          params
        })) || {};
    }

    return response;
  } catch (e) {
    debug.error(`Error during get customer info: ${e.message}`);
  }
};

export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  oa_id: string,
  userId: string
) => {
  const integration = await models.Integrations.getIntegration({
    $and: [{ oa_id: { $in: oa_id } }, { kind: 'zalo' }]
  });

  let customer = await models.Customers.findOne({ userId });

  if (customer) {
    return customer;
  }

  // const account = await models.Accounts.getAccount({ _id: integration.accountId });

  // create customer
  let zaloUser = {} as any;

  try {
    zaloUser =
      (await zaloSendRequest(models, subdomain, integration.accountId, {
        url: `https://openapi.zalo.me/v2.0/oa/getprofile?data=${JSON.stringify({
          user_id: userId
        })}`,
        method: 'GET',
        params: {}
      })) || {};
    // {
    //     "data": {
    //       "avatar": "https://s120-ava-talk.zadn.vn/1/5/6/9/6/120/3684c8b97c7d98b8a04492f85d73df24.jpg",
    //       "avatars": {
    //         "120": "https://s120-ava-talk.zadn.vn/1/5/6/9/6/120/3684c8b97c7d98b8a04492f85d73df24.jpg",
    //         "240": "https://s240-ava-talk.zadn.vn/1/5/6/9/6/240/3684c8b97c7d98b8a04492f85d73df24.jpg"
    //       },
    //       "user_gender": 1,
    //       "user_id": "4413133305314197514",
    //       "user_id_by_app": "5102806314843913120",
    //       "display_name": "Khánh",
    //       "birth_date": 0,
    //       "tags_and_notes_info": {
    //         "notes": [],
    //         "tag_names": []
    //       }
    //     },
    //   }
  } catch (e) {
    debug.error(`Error during get customer info: ${e.message}`);
  }
  // save on integrations db
  try {
    customer = await models.Customers.create({
      userId,
      firstName: zaloUser.data.display_name,
      integrationId: integration.erxesApiId,
      profilePic: zaloUser.data.avatar
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
          firstName: zaloUser.data.display_name,
          avatar: zaloUser.data.avatar,
          isUser: true
        })
      },
      isRPC: true
    });

    debug.error(`apiCustomerResponse: ${apiCustomerResponse}`);

    customer.erxesApiId = apiCustomerResponse._id;
    await customer.save();
  } catch (e) {
    await models.Customers.deleteOne({ _id: customer._id });
    throw new Error(e);
  }

  return customer;
};
