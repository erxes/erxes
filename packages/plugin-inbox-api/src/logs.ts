import { getSchemaLabels } from '@erxes/api-utils/src/logUtils';
import { LOG_MAPPINGS } from './constants';
import { collectConversations } from "./receiveMessage";

export default {
  collectItems: async ({ data }) => ({
    data: await collectConversations(data),
    status: 'success'
  }),
  getSchemaLabels: ({ data: { type } }) => ({
    status: 'success',
    data: getSchemaLabels(type, LOG_MAPPINGS)
  })
};
