import sift from 'sift';

import { Brands, Users } from './apiCollections';

import { Integrations, MessengerApps } from './models';

import { get, set } from './inmemoryStorage';
import { sendProductRPCMessage, sendTagRPCMessage } from './messageBroker';
import { models } from './connectionResolver';

export const getDocument = async (
  type: 'users' | 'integrations' | 'brands' | 'channels',
  selector: { [key: string]: any }
) => {
  const list = await getDocumentList(type, selector);

  if (list.length > 0) {
    return list[0];
  }

  return null;
};

export const getDocumentList = async (
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
        list = await Users.find().toArray();
        break;
      }

      case 'channels': {
        list = await models.Channels.find().lean();
        break;
      }

      case 'integrations': {
        list = await Integrations.find().lean();
        break;
      }

      case 'brands': {
        list = await Brands.find().toArray();
        break;
      }

      case 'products': {
        list = await sendProductRPCMessage('find', {
          query: {}
        });
        break;
      }
      case 'tags': {
        list = await sendTagRPCMessage('find', {});
        break;
      }
    }

    set(`erxes_${type}`, JSON.stringify(list));
  }

  return list.filter(sift(selector));
};

// doing this until sift dot path support
export const getMessengerApps = async (
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
    parsedValue = await MessengerApps.find().lean();
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
