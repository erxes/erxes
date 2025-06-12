import { updateErxesConversation } from './apiClient';

export const createOrUpdateErxesConversation = async (subdomain, payload) => {
  const apiResponse = await updateErxesConversation(subdomain, payload);
  return apiResponse;
};
