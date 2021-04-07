import sift from 'sift';
import { Brands, Channels, Integrations, Users } from '../../../db/models';
import { get, removeKey, set } from '../../../inmemoryStorage';

export const caches = {
  generateKey(key: string) {
    return `erxes_${key}`;
  },

  async get({ key, callback }: { key: string; callback?: any }) {
    key = this.generateKey(key);

    let object = JSON.parse((await get(key)) || '{}') || {};

    if (Object.keys(object).length === 0) {
      object = await callback();

      set(key, JSON.stringify(object));

      return object;
    }

    return object;
  },

  async update(key: string, data: object) {
    const storageKey = this.generateKey(key);

    const value = await get(storageKey);

    if (!value) {
      return;
    }

    set(this.generateKey(key), JSON.stringify(data));
  },

  remove(key: string) {
    removeKey(this.generateKey(key));
  }
};

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

export const getIntegrationByBrand = async ({
  brandId,
  type,
  selector,
  formId,
  callback
}: {
  brandId: string;
  formId?: string;
  type: string;
  selector?: { [key: string]: string | number | boolean };
  callback?: () => Promise<void>;
}) => {
  const integration = await caches.get({
    key: 'integration_' + type + '_' + brandId + (formId ? `_${formId}` : ''),
    callback: callback
      ? callback
      : async () => {
          return Integrations.findOne(selector);
        }
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  if (integration && !integration.isActive) {
    throw new Error(`Integration "${integration.name}" is not active`);
  }

  return integration;
};
