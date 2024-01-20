import {
  init as initBrokerCore,
  sendRPCMessage,
} from '@erxes/api-utils/src/messageBroker';

export const initBroker = async () => {
  await initBrokerCore();
};

export const fetchSegment = (subdomain, segmentId, options?) =>
  sendRPCMessage('segments:fetchSegment', {
    subdomain,
    data: { segmentId, options },
  });

export const removeCompanies = (subdomain, _ids) =>
  sendRPCMessage('contacts:companies.removeCompanies', {
    subdomain,
    data: { _ids },
  });

export const removeCustomers = (subdomain, _ids) =>
  sendRPCMessage('contacts:customers.removeCustomers', {
    subdomain,
    data: { customerIds: _ids },
  });

export const removeProducts = (subdomain, _ids) =>
  sendRPCMessage('products:removeProducts', {
    subdomain,
    data: { _ids },
  });

export const removeTickets = (subdomain, _ids) =>
  sendRPCMessage('cards:tickets.remove', {
    subdomain,
    data: { _ids },
  });

export const removeDeals = (subdomain, _ids) =>
  sendRPCMessage('cards:deals.remove', {
    subdomain,
    data: { _ids },
  });

export const removeTasks = (subdomain, _ids) =>
  sendRPCMessage('cards:tasks.remove', {
    subdomain,
    data: { _ids },
  });

export const removePurchases = (subdomain, _ids) =>
  sendRPCMessage('cards:purchases.remove', {
    subdomain,
    data: { _ids },
  });
export const getFileUploadConfigs = async (subdomain) =>
  sendRPCMessage('core:getFileUploadConfigs', { subdomain });
