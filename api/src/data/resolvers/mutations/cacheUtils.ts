import { Brands, Integrations } from '../../../db/models';
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

export const getBrand = async (code: string) => {
  const brand = await caches.get({
    key: `brand_${code}`,
    callback: async () => {
      return Brands.findOne({ code });
    }
  });

  return brand;
};

export const getIntegration = async ({
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
