import { sendRequest } from '@erxes/api-utils/src';
import { IContext, sendProductsMessage } from '../../../messageBroker';
import { consumeInventory, getConfig } from '../../../utils';

const msdynamicMutations = {
  /**
   * Creates a new msdynamic
   */
  async msdynamicAddConfigs(_root, doc, { models }: IContext) {
    return await models.Msdynamics.createMsdynamicConfig(doc);
  },
  /**
   * Edits a new msdynamic
   */
  async msdynamicEditConfigs(_root, doc, { models, user }: IContext) {
    return await models.Msdynamics.updateMsdynamicConfig(doc, user);
  },

  async toCheckProducts(_root, _args, { models, subdomain }: IContext) {
    const config = await getConfig(subdomain, 'DYNAMIC', {});

    const updateProducts: any = [];
    const createProducts: any = [];
    const deleteProducts: any = [];
    let matchedCount = 0;

    if (!config.endpoint || !config.username || !config.password) {
      throw new Error('MS Dynamic config not found.');
    }

    const { endpoint, username, password } = config;

    try {
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

      const productCodes = products.map(p => p.code) || [];

      const response = await sendRequest({
        url: endpoint,
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`
          ).toString('base64')}`
        }
      });

      const resultCodes =
        response.value.map(r => r.No.replace(/\s/g, '')) || [];

      const productByCode = {};
      for (const product of products) {
        productByCode[product.code] = product;

        if (!resultCodes.includes(product.code)) {
          deleteProducts.push(product);
        }
      }

      for (const resProd of response.value) {
        if (productCodes.includes(resProd.No.replace(/\s/g, ''))) {
          const product = productByCode[resProd.No.replace(/\s/g, '')];

          if (
            resProd?.Description === product.name &&
            resProd?.Unit_Price === product.unitPrice &&
            resProd?.Base_Unit_of_Measure === product.uom
          ) {
            matchedCount = matchedCount + 1;
          } else {
            updateProducts.push(resProd);
          }
        } else {
          createProducts.push(resProd);
        }
      }
    } catch (e) {
      console.log(e, 'error');
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

  async toSyncProducts(
    _root,
    { action, products }: { action: string; products: any[] },
    { subdomain }: IContext
  ) {
    try {
      switch (action) {
        case 'CREATE': {
          for (const product of products) {
            await consumeInventory(subdomain, product, 'create');
          }
          break;
        }
        case 'UPDATE': {
          for (const product of products) {
            await consumeInventory(subdomain, product, 'update');
          }
          break;
        }
        case 'DELETE': {
          for (const product of products) {
            await consumeInventory(subdomain, product, 'delete');
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
      console.log(e, 'error');
    }
  }
};

export default msdynamicMutations;
