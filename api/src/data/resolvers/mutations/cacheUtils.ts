import sift from 'sift';
import { Brands, Channels, Integrations, Users } from '../../../db/models';
import { get, set } from '../../../inmemoryStorage';

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
  type: 'users' | 'integrations' | 'brands' | 'channels',
  selector: { [key: string]: any }
) => {
  const listCache = await get(`erxes_${type}`);

  let list;

  if (listCache) {
    list = JSON.parse(listCache);
  } else {
    switch (type) {
      case 'users': {
        list = await Users.find();

        break;
      }

      case 'channels': {
        list = await Channels.find();

        break;
      }

      case 'integrations': {
        list = await Integrations.find();

        break;
      }

      case 'brands': {
        list = await Brands.find();

        break;
      }
    }

    set(`erxes_${type}`, JSON.stringify(list));
  }

  return list.filter(sift(selector));
};
