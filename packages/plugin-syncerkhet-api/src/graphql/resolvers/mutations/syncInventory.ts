import { IContext } from '../../../connectionResolver';
import { getConfig } from '../../../utils/utils';
import { sendRequest } from '@erxes/api-utils/src/requests';
import { sendProductsMessage } from '../../../messageBroker';
import {
  consumeInventory,
  consumeInventoryCategory
} from '../../../utils/consumeInventory';

const inventoryMutations = {
  async toCheckProducts(_root, { subdomain }: IContext) {
    const config = await getConfig(subdomain, 'ERKHET', {});

    if (!config.apiToken || !config.apiKey || !config.apiSecret) {
      throw new Error('Erkhet config not found.');
    }

    const productsCount = await sendProductsMessage({
      subdomain,
      action: 'count',
      data: {},
      isRPC: true
    });

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        limit: productsCount
      },
      isRPC: true
    });

    const productCodes = products.map(p => p.code);

    if (!productCodes) {
      throw new Error('No product codes found.');
    }

    const response = await sendRequest({
      url: process.env.ERKHET_URL + '/get-api/',
      method: 'GET',
      params: {
        kind: 'inventory',
        api_key: config.apiKey,
        api_secret: config.apiSecret,
        token: config.apiToken,
        is_gen_fk: 'true'
      }
    });
    console.log(response);

    if (!response && Object.keys(JSON.parse(response)).length === 0) {
      throw new Error('Erkhet data not found.');
    }

    let result = JSON.parse(response).map(r => r.fields);

    const matchedErkhetData = result.filter(r => {
      if (productCodes.find(p => p === r.code)) {
        return r;
      }
    });
    const otherErkhetData = result.filter(r => !matchedErkhetData.includes(r));

    let otherProducts: any[] = [];
    for (const code of productCodes) {
      if (result.every(r => r.code !== code)) {
        const response = await sendProductsMessage({
          subdomain,
          action: 'findOne',
          data: { code: code },
          isRPC: true
        });
        otherProducts.push(response);
      }
    }

    return {
      create: {
        count: otherErkhetData.length,
        items: otherErkhetData
      },
      update: {
        count: matchedErkhetData.length,
        items: matchedErkhetData
      },
      delete: {
        count: otherProducts.length,
        items: otherProducts
      }
    };
  },

  async toCheckCategories(_root, { subdomain }: IContext) {
    const config = await getConfig(subdomain, 'ERKHET', {});

    if (!config.apiToken || !config.apiKey || !config.apiSecret) {
      throw new Error('Erkhet config not found.');
    }

    const categoriesCount = await sendProductsMessage({
      subdomain,
      action: 'categories.count',
      data: {},
      isRPC: true
    });

    const categories = await sendProductsMessage({
      subdomain,
      action: 'categories.find',
      data: {
        limit: categoriesCount
      },
      isRPC: true
    });

    const categoryCodes = categories.map(c => c.code);

    if (!categoryCodes) {
      throw new Error('No category codes found.');
    }

    const response = await sendRequest({
      url: process.env.ERKHET_URL + '/get-api/',
      method: 'GET',
      params: {
        kind: 'inv_category',
        api_key: config.apiKey,
        api_secret: config.apiSecret,
        token: config.apiToken,
        is_gen_fk: 'true'
      }
    });

    if (!response || Object.keys(JSON.parse(response)).length === 0) {
      throw new Error('Erkhet data not found.');
    }
    let result = JSON.parse(response).map(r => r.fields);

    // for update
    const matchedErkhetData = result.filter(r => {
      if (categoryCodes.find(p => p === r.code)) {
        return r;
      }
    });
    // for create
    const otherErkhetData = result.filter(r => !matchedErkhetData.includes(r));
    // for delete
    let otherCategories: any[] = [];
    for (const code of categoryCodes) {
      if (result.every(r => r.code !== code)) {
        const response = await sendProductsMessage({
          subdomain,
          action: 'categories.findOne',
          data: { code: code },
          isRPC: true
        });
        otherCategories.push(response);
      }
    }
    return {
      create: {
        count: otherErkhetData.length,
        items: otherErkhetData
      },
      update: {
        count: matchedErkhetData.length,
        items: matchedErkhetData
      },
      delete: {
        count: otherCategories.length,
        items: otherCategories
      }
    };
  },

  async toSyncCategories(
    _root,
    { action, categories }: { action: string; categories: any[] },
    { subdomain }: IContext
  ) {
    try {
      switch (action) {
        case 'CREATE': {
          for (const category of categories) {
            await consumeInventoryCategory(
              subdomain,
              category,
              category.code,
              'create'
            );
          }
          break;
        }
        case 'UPDATE': {
          for (const category of categories) {
            await consumeInventoryCategory(
              subdomain,
              category,
              category.code,
              'update'
            );
          }
          break;
        }
        case 'DELETE': {
          for (const category of categories) {
            await consumeInventoryCategory(
              subdomain,
              category,
              category.code,
              'delete'
            );
          }
          break;
        }
        default:
          break;
      }
      return {
        status: 'success'
      };
    } catch (e) {
      throw new Error('Error while syncing categories. ' + e);
    }
  },

  async toSyncProducts(
    _root,
    { action, products }: { action: string; products: any[] },
    { subdomain }: IContext
  ) {
    try {
      switch (action) {
        case 'CREATE': {
          for (const product of products) {
            await consumeInventory(subdomain, product, product.code, 'create');
          }
          break;
        }
        case 'UPDATE': {
          for (const product of products) {
            await consumeInventory(subdomain, product, product.code, 'update');
          }
          break;
        }
        case 'DELETE': {
          for (const product of products) {
            await consumeInventory(subdomain, product, product.code, 'delete');
          }
          break;
        }
        default:
          break;
      }
      return {
        status: 'success'
      };
    } catch (e) {
      throw new Error('Error while syncing products. ' + e);
    }
  }
};

export default inventoryMutations;
