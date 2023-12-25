import { IContext } from '../../../messageBroker';
import {
  consumeCategory,
  consumeCustomers,
  consumeInventory
} from '../../../utils';

const msdynamicSyncMutations = {
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
  },

  async toSyncProductCategories(
    _root,
    { action, categories }: { action: string; categories: any[] },
    { subdomain }: IContext
  ) {
    try {
      switch (action) {
        case 'CREATE': {
          for (const category of categories) {
            await consumeCategory(subdomain, category, 'create');
          }
          break;
        }
        case 'UPDATE': {
          for (const category of categories) {
            await consumeCategory(subdomain, category, 'update');
          }
          break;
        }
        case 'DELETE': {
          for (const category of categories) {
            await consumeCategory(subdomain, category, 'delete');
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
  },

  async toSyncCustomers(
    _root,
    { action, customers }: { action: string; customers: any[] },
    { subdomain }: IContext
  ) {
    try {
      switch (action) {
        case 'CREATE': {
          for (const customer of customers) {
            await consumeCustomers(subdomain, customer, 'create');
          }
          break;
        }
        case 'UPDATE': {
          for (const customer of customers) {
            await consumeCustomers(subdomain, customer, 'update');
          }
          break;
        }
        case 'DELETE': {
          for (const customer of customers) {
            await consumeCustomers(subdomain, customer, 'delete');
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

export default msdynamicSyncMutations;
