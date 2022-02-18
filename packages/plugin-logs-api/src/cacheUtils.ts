import sift from 'sift';

import {
  Brands,
  Channels,
  Integrations,
  Products,
  Tags,
  Users
} from './apiCollections';
import { get, set } from './inmemoryStorage';

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
        list = await Users.find().lean();
        break;
      }

      case 'channels': {
        list = await Channels.find().lean();
        break;
      }

      case 'integrations': {
        list = await Integrations.find().lean();
        break;
      }

      case 'brands': {
        list = await Brands.find().lean();
        break;
      }

      case 'products': {
        list = await Products.find().lean();
        break;
      }
      case 'tags': {
        list = await Tags.find().lean();
        break;
      }
    }

    set(`erxes_${type}`, JSON.stringify(list));
  }

  return list.filter(sift(selector));
};
