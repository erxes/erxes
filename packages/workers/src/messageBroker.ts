import {
  connectToMessageBroker,
  sendRPCMessage
} from "@erxes/api-utils/src/messageBroker";

export const initBroker = async () => {
  await connectToMessageBroker(setupMessageConsumers);
};

export const setupMessageConsumers = async () => {};

export const fetchSegment = (subdomain, segmentId, options?) =>
  sendRPCMessage("core:fetchSegment", {
    subdomain,
    data: { segmentId, options }
  });

export const removeCompanies = (subdomain, _ids) =>
  sendRPCMessage("core:companies.removeCompanies", {
    subdomain,
    data: { _ids }
  });

export const removeCustomers = (subdomain, _ids) =>
  sendRPCMessage("core:customers.removeCustomers", {
    subdomain,
    data: { customerIds: _ids }
  });

export const removeProducts = (subdomain, _ids) =>
  sendRPCMessage("core:removeProducts", {
    subdomain,
    data: { _ids }
  });

export const removeTickets = (subdomain, _ids) =>
  sendRPCMessage("tickets:tickets.remove", {
    subdomain,
    data: { _ids }
  });

export const removeDeals = (subdomain, _ids) =>
  sendRPCMessage("sales:deals.remove", {
    subdomain,
    data: { _ids }
  });

export const removeTasks = (subdomain, _ids) =>
  sendRPCMessage("tasks:tasks.remove", {
    subdomain,
    data: { _ids }
  });

export const removePurchases = (subdomain, _ids) =>
  sendRPCMessage("purchases:purchases.remove", {
    subdomain,
    data: { _ids }
  });
export const getFileUploadConfigs = async subdomain =>
  sendRPCMessage("core:getFileUploadConfigs", { subdomain });
