import { IContext } from '../../../messageBroker';
import {
  consumeCategory,
  consumeCustomers,
  consumeInventory,
  consumePrice,
  getConfig,
} from '../../../utils';

const msdynamicSyncMutations = {
  async toSyncMsdProducts(
    _root,
    {
      brandId,
      action,
      products,
    }: { brandId: string; action: string; products: any[] },
    { subdomain }: IContext,
  ) {
    const configs = await getConfig(subdomain, 'DYNAMIC', {});
    const config = configs[brandId || 'noBrand'];

    try {
      switch (action) {
        case 'CREATE': {
          for (const product of products) {
            await consumeInventory(subdomain, config, product, 'create');
          }
          break;
        }
        case 'UPDATE': {
          for (const product of products) {
            await consumeInventory(subdomain, config, product, 'update');
          }
          break;
        }
        case 'DELETE': {
          for (const product of products) {
            await consumeInventory(subdomain, config, product, 'delete');
          }
          break;
        }
        default:
          break;
      }

      return {
        status: 'success',
      };
    } catch (e) {
      console.log(e, 'error');
    }
  },

  async toSyncMsdPrices(
    _root,
    {
      brandId,
      action,
      prices,
    }: { brandId: string; action: string; prices: any[] },
    { subdomain }: IContext,
  ) {
    const configs = await getConfig(subdomain, 'DYNAMIC', {});
    const config = configs[brandId || 'noBrand'];

    try {
      switch (action) {
        case 'CREATE': {
          break;
        }
        case 'UPDATE': {
          for (const price of prices) {
            await consumePrice(subdomain, config, price, 'update');
          }
          break;
        }
        case 'DELETE': {
          break;
        }
        default:
          break;
      }

      return {
        status: 'success',
      };
    } catch (e) {
      console.log(e, 'error');
    }
  },

  async toSyncMsdProductCategories(
    _root,
    {
      brandId,
      action,
      categories,
    }: { brandId: string; action: string; categories: any[] },
    { subdomain }: IContext,
  ) {
    const configs = await getConfig(subdomain, 'DYNAMIC', {});
    const config = configs[brandId || 'noBrand'];

    try {
      switch (action) {
        case 'CREATE': {
          for (const category of categories) {
            await consumeCategory(subdomain, config, category, 'create');
          }
          break;
        }
        case 'UPDATE': {
          for (const category of categories) {
            await consumeCategory(subdomain, config, category, 'update');
          }
          break;
        }
        case 'DELETE': {
          for (const category of categories) {
            await consumeCategory(subdomain, config, category, 'delete');
          }
          break;
        }
        default:
          break;
      }

      return {
        status: 'success',
      };
    } catch (e) {
      console.log(e, 'error');
    }
  },

  async toSyncMsdCustomers(
    _root,
    {
      brandId,
      action,
      customers,
    }: { brandId: string; action: string; customers: any[] },
    { subdomain }: IContext,
  ) {
    const configs = await getConfig(subdomain, 'DYNAMIC', {});
    const config = configs[brandId || 'noBrand'];

    try {
      switch (action) {
        case 'CREATE': {
          for (const customer of customers) {
            await consumeCustomers(subdomain, config, customer, 'create');
          }
          break;
        }
        case 'UPDATE': {
          for (const customer of customers) {
            await consumeCustomers(subdomain, config, customer, 'update');
          }
          break;
        }
        case 'DELETE': {
          for (const customer of customers) {
            await consumeCustomers(subdomain, config, customer, 'delete');
          }
          break;
        }
        default:
          break;
      }

      return {
        status: 'success',
      };
    } catch (e) {
      console.log(e, 'error');
    }
  },
};

export default msdynamicSyncMutations;
