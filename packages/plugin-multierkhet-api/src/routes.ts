import { getSubdomain } from '@erxes/api-utils/src/core';
import {
  sendCardsMessage,
  sendContactsMessage,
  sendCoreMessage,
  sendPosMessage,
  sendProductsMessage
} from './messageBroker';

const fetchConformities = async (subdomain, id) => {
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

  const customerIds = conformities
    .map(c => (c.mainType === 'customer' && c.mainTypeId) || (c.relType === 'customer' && c.relTypeId) || '')
    .filter(c => c);
  const companyIds = conformities
    .map(c => (c.mainType === 'company' && c.mainTypeId) || (c.relType === 'company' && c.relTypeId) || '')
    .filter(c => c);

  return { customerIds, companyIds };
};

const fetchContacts = async (subdomain, ids, type) => {
  if (!ids.length) return [];

  const actionMap = {
    customer: 'customers.find',
    company: 'companies.find',
    user: 'users.find'
  };

  const messageSender = type === 'user' ? sendCoreMessage : sendContactsMessage;

  return messageSender({
    subdomain,
    action: actionMap[type],
    data: type === 'user' ? { query: { _id: { $in: ids } } } : { _id: { $in: ids } },
    isRPC: true
  });
};

const fetchProducts = async (subdomain, productIds, limit) => {
  return sendProductsMessage({
    subdomain,
    action: 'find',
    data: {
      query: { _id: { $in: productIds } },
      limit
    }
  });
};

export const getOrderInfo = async (req, res) => {
  const subdomain = getSubdomain(req);
  const { id } = req.query;
  let result = {};

  const deal = await sendCardsMessage({
    subdomain,
    action: 'deals.findOne',
    data: { _id: id },
    isRPC: true
  });

  if (deal && deal._id === id) {
    const { customerIds, companyIds } = await fetchConformities(subdomain, id);

    result = {
      type: 'deal',
      object: deal,
      customers: await fetchContacts(subdomain, customerIds, 'customer'),
      companies: await fetchContacts(subdomain, companyIds, 'company'),
      products: await fetchProducts(subdomain, deal.productsData.map(p => p.productId), deal.productsData.length)
    };

    return res.send(result);
  }

  const order = await sendPosMessage({
    subdomain,
    action: 'orders.findOne',
    data: { _id: id },
    isRPC: true
  });

  if (order && order._id === id) {
    result = {
      type: 'order',
      object: order,
      customers: order.customerType === 'company' ? [] : await fetchContacts(subdomain, [order.customerId], 'customer'),
      companies: order.customerType === 'company' ? await fetchContacts(subdomain, [order.customerId], 'company') : [],
      users: order.customerType === 'user' ? await fetchContacts(subdomain, [order.customerId], 'user') : [],
      products: await fetchProducts(subdomain, order.items.map(p => p.productId), order.items.length)
    };

    return res.send(result);
  }

  return res.send({});
};