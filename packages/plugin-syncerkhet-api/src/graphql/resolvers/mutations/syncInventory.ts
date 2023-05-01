import { IContext } from '../../../connectionResolver';
import { getConfig } from '../../../utils/utils';
import { sendRequest } from '@erxes/api-utils/src/requests';
import { sendProductsMessage } from '../../../messageBroker';
import {
  consumeInventory,
  consumeInventoryCategory
} from '../../../utils/consumeInventory';

const inventoryMutations = {
  async toCheckProducts(_root, _params, { subdomain }: IContext) {
    const config = await getConfig(subdomain, 'ERKHET', {});

    if (!config.apiToken || !config.apiKey || !config.apiSecret) {
      throw new Error('Erkhet config not found.');
    }

    const productsCount = await sendProductsMessage({
      subdomain,
      action: 'count',
      data: { query: { status: { $ne: 'deleted' } } },
      isRPC: true
    });

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        query: { status: { $ne: 'deleted' } },
        limit: productsCount
      },
      isRPC: true
    });

    const productCategories = await sendProductsMessage({
      subdomain,
      action: 'categories.find',
      data: { query: {} },
      isRPC: true,
      defaultValue: []
    });

    const categoryOfId = {};
    for (const cat of productCategories) {
      categoryOfId[cat._id] = cat;
    }

    const uoms = await sendProductsMessage({
      subdomain,
      action: 'uoms.find',
      data: {},
      isRPC: true,
      defaultValue: []
    });

    const uomById = {};
    for (const uom of uoms) {
      uomById[uom._id] = uom;
    }

    const productCodes = products.map(p => p.code) || [];
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

    if (!response && Object.keys(JSON.parse(response)).length === 0) {
      throw new Error('Erkhet data not found.');
    }

    const updateProducts: any = [];
    const createProducts: any = [];
    const deleteProducts: any = [];
    let matchedCount = 0;

    let result = JSON.parse(response).map(r => r.fields);
    const resultCodes = result.map(r => r.code) || [];

    const productByCode = {};
    for (const product of products) {
      productByCode[product.code] = product;

      if (!resultCodes.includes(product.code)) {
        deleteProducts.push(product);
      }
    }

    for (const resProd of result) {
      if (productCodes.includes(resProd.code)) {
        const product = productByCode[resProd.code];
        const uom = uomById[product.uomId];

        if (
          (resProd.name === product.name ||
            resProd.nickname === product.name) &&
          resProd.unit_price === product.unitPrice &&
          resProd.barcodes === (product.barcodes || []).join(',') &&
          (resProd.vat_type || '') === (product.taxType || '') &&
          uom &&
          resProd.measure_unit_code === uom.code &&
          resProd.category_code ===
            (categoryOfId[product.categoryId] || {}).code
        ) {
          matchedCount = matchedCount + 1;
        } else {
          updateProducts.push(resProd);
        }
      } else {
        createProducts.push(resProd);
      }
    }

    return {
      create: {
        count: createProducts.length,
        items: createProducts
      },
      update: {
        count: updateProducts.length,
        items: updateProducts
      },
      delete: {
        count: deleteProducts.length,
        items: deleteProducts
      },
      matched: {
        count: matchedCount
      }
    };
  },

  async toCheckCategories(_root, _params, { subdomain }: IContext) {
    const config = await getConfig(subdomain, 'ERKHET', {});

    if (!config.apiToken || !config.apiKey || !config.apiSecret) {
      throw new Error('Erkhet config not found.');
    }

    const categories = await sendProductsMessage({
      subdomain,
      action: 'categories.find',
      data: {
        query: { status: 'active' },
        sort: { order: 1 }
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
