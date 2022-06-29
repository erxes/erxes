import sift from 'sift';
import { IModels } from '../../../connectionResolver';

import { get, set } from '../../../inmemoryStorage';

export const getDocument = async (
  models: IModels,
  subdomain: string,
  type: 'users' | 'brands',
  selector: { [key: string]: any }
) => {
  const list = await getDocumentList(models, subdomain, type, selector);

  if (list.length > 0) {
    return list[0];
  }

  return null;
};

export const getDocumentList = async (
  models: IModels,
  subdomain: string,
  type: 'users' | 'brands',
  selector: { [key: string]: any }
) => {
  const listCache = await get(`erxes_${subdomain}_${type}`);

  let list;

  if (listCache) {
    list = JSON.parse(listCache);
  } else {
    switch (type) {
      case 'users': {
        list = await models.Users.find().lean();
        break;
      }

      case 'brands': {
        list = await models.Brands.find().lean();
        break;
      }
    }

    set(`erxes_${subdomain}_${type}`, JSON.stringify(list));
  }

  return list.filter(sift(selector));
};
