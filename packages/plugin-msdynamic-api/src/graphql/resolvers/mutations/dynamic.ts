import { sendRequest } from '@erxes/api-utils/src';
import {
  IContext,
  sendContactsMessage,
  sendProductsMessage
} from '../../../messageBroker';
import { consumeCustomers, consumeInventory, getConfig } from '../../../utils';

const msdynamicMutations = {
  async toCheckProducts(_root, _args, { subdomain }: IContext) {
    const config = await getConfig(subdomain, 'DYNAMIC', {});

    const updateProducts: any = [];
    const createProducts: any = [];
    const deleteProducts: any = [];
    let matchedCount = 0;

    if (!config.itemApi || !config.username || !config.password) {
      throw new Error('MS Dynamic config not found.');
    }

    const { itemApi, username, password } = config;

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
        url: itemApi,
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
  },

  async toCheckCustomers(_root, _args, { subdomain }: IContext) {
    const config = await getConfig(subdomain, 'DYNAMIC', {});

    const createCustomers: any = [];
    const updateCustomers: any = [];
    const deleteCustomers: any = [];
    let matchedCount = 0;

    if (!config.customerApi || !config.username || !config.password) {
      throw new Error('MS Dynamic config not found.');
    }

    const { customerApi, username, password } = config;

    try {
      const customers = await sendContactsMessage({
        subdomain,
        action: 'customers.findActiveCustomers',
        data: {},
        isRPC: true,
        defaultValue: {}
      });

      const customerNames = customers.map(c => c.firstName) || [];

      const response = await sendRequest({
        url: customerApi,
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`
          ).toString('base64')}`
        }
      });

      const resultNames = response.value.map(r => r.Name) || [];

      const customerByName = {};

      for (const customer of customers) {
        customerByName[customer.firstName] = customer;

        for (const rname of resultNames) {
          if (rname === customer.firstName) {
            deleteCustomers.push(customer);
          }
        }
      }

      for (const resCustomer of response.value) {
        for (const cname of customerNames) {
          if (cname === resCustomer.Name) {
            const customer = customerByName[resCustomer.Name];

            if (resCustomer?.Name === customer.firstName) {
              matchedCount = matchedCount + 1;
            } else {
              updateCustomers.push(resCustomer);
            }
          } else {
            createCustomers.push(resCustomer);
          }
        }
      }
    } catch (e) {
      console.log(e, 'error');
    }

    return {
      create: {
        count: createCustomers.length,
        items: createCustomers
      },
      update: {
        count: updateCustomers.length,
        items: updateCustomers
      },
      delete: {
        count: deleteCustomers.length,
        items: deleteCustomers
      },
      matched: {
        count: matchedCount
      }
    };
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

export default msdynamicMutations;
