import { getSubdomain } from '@erxes/api-utils/src/core';
import {
  sendCardsMessage,
  sendContactsMessage,
  sendCoreMessage,
  sendPosMessage,
  sendProductsMessage
} from './messageBroker';

export const getOrderInfo = async (req, res) => {
  const subdomain = getSubdomain(req);
  const result: any = {};

  const { id } = req.query;

  const deal = await sendCardsMessage({
    subdomain,
    action: 'deals.findOne',
    data: { _id: id },
    isRPC: true
  });

  if (deal && deal._id === id) {
    const conformities = await sendCoreMessage({
      subdomain,
      action: 'conformities.savedConformity',
      data: {
        mainType: 'deal',
        mainTypeId: id,
        relTypes: ['customer', 'company']
      },
      isRPC: true
    });

    result.type = 'deal';
    result.object = deal;

    const customerIds = conformities
      .map(
        c =>
          (c.mainType === 'customer' && c.mainTypeId) ||
          (c.relType === 'customer' && c.relTypeId) ||
          ''
      )
      .filter(c => c);
    const companyIds = conformities
      .map(
        c =>
          (c.mainType === 'company' && c.mainTypeId) ||
          (c.relType === 'company' && c.relTypeId) ||
          ''
      )
      .filter(c => c);
    if (customerIds.length) {
      const customers = await sendContactsMessage({
        subdomain,
        action: 'customers.find',
        data: { _id: { $in: customerIds } },
        isRPC: true
      });
      if (customers && customers.length) {
        result.customers = customers;
      }
    }
    if (companyIds.length) {
      const companies = await sendContactsMessage({
        subdomain,
        action: 'companies.find',
        data: { _id: { $in: companyIds } },
        isRPC: true
      });
      if (companies && companies.length) {
        result.companies = companies;
      }
    }
    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        query: { _id: { $in: deal.productsData.map(p => p.productId) } },
        limit: deal.productsData.length
      }
    });
    result.products = products;

    return res.send(result);
  }

  const order = await sendPosMessage({
    subdomain,
    action: 'orders.findOne',
    data: { _id: id },
    isRPC: true
  });

  if (order && order._id === id) {
    result.type = 'order';
    result.object = order;
    if (order.customerId) {
      if (order.customerType === 'company') {
        const companies = await sendContactsMessage({
          subdomain,
          action: 'companies.find',
          data: { _id: { $in: [order.customerId] } },
          isRPC: true
        });
        if (companies && companies.length) {
          result.companies = companies;
        }
      } else if (order.customerType === 'user') {
        const users = await sendCoreMessage({
          subdomain,
          action: 'users.find',
          data: { query: { _id: order.customerId } },
          isRPC: true
        });
        if (users && users.length) {
          result.users = users;
        }
      } else {
        const customers = await sendContactsMessage({
          subdomain,
          action: 'customers.find',
          data: { _id: { $in: [order.customerId] } },
          isRPC: true
        });
        if (customers && customers.length) {
          result.customers = customers;
        }
      }
    }

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        query: { _id: { $in: order.items.map(p => p.productId) } },
        limit: order.items.length
      }
    });
    result.products = products;

    return res.send(result);
  }

  return res.send({});
};
