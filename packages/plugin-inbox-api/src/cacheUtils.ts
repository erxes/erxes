import sift from 'sift';

import { get, set } from './inmemoryStorage';
import { sendProductsMessage, sendTagsMessage } from './messageBroker';
import { ICoreIModels, IModels } from './connectionResolver';

export const getDocument = async (
  models: IModels,
  coreModels: ICoreIModels,
  subdomain: string,
  type: 'users' | 'integrations' | 'brands' | 'channels',
  selector: { [key: string]: any }
) => {
  const list = await getDocumentList(models, coreModels, subdomain, type, selector);

  if (list.length > 0) {
    return list[0];
  }

  return null;
};

export const getDocumentList = async (
  models: IModels,
  coreModels: ICoreIModels,
  subdomain: string,
  type: 'users' | 'integrations' | 'brands' | 'channels' | 'tags' | 'products',
  selector: { [key: string]: any }
) => {
  const listCache = await get(`erxes_${type}`);

  let list;

  if (listCache) {
    list = JSON.parse(listCache);
  } else {
    switch (type) {
      case 'users': {
        list = await coreModels.Users.find().toArray();
        break;
      }

      case 'channels': {
        list = await models.Channels.find().lean();
        break;
      }

      case 'integrations': {
        list = await models.Integrations.find().lean();
        break;
      }

      case 'brands': {
        list = await coreModels.Brands.find().toArray();
        break;
      }

      case 'products': {
        // ! below msg converted
        // list = await sendProductRPCMessage('find', {
        //   query: {}
        // });
        list = await sendProductsMessage({
          subdomain,
          action: 'find',
          data: {
            query: {}
          },
          isRPC: true
        });
        break;
      }
      case 'tags': {
        // ! below msg converted
        // list = await sendTagRPCMessage('find', {});
        list = await sendTagsMessage({
          subdomain,
          action: "find",
          data: {},
          isRPC: true
        })
        break;
      }
    }

    set(`erxes_${type}`, JSON.stringify(list));
  }

  return list.filter(sift(selector));
};

// doing this until sift dot path support
export const getMessengerApps = async (
  models: IModels,
  kind: string,
  integrationId: string,
  findOne = true
) => {
  const key = 'erxes_messenger_apps';
  const cacheValue = await get(key);

  let parsedValue;

  if (cacheValue) {
    parsedValue = JSON.parse(cacheValue);
  } else {
    parsedValue = await models.MessengerApps.find().lean();
    set(key, JSON.stringify(parsedValue));
  }

  const callback = v => {
    const credentials = v.credentials || {};
    return v.kind === kind && credentials.integrationId === integrationId;
  };

  if (findOne) {
    return parsedValue.find(callback);
  }

  return parsedValue.filter(callback);
};
