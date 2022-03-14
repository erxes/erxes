import { getSchemaLabels } from '@erxes/api-utils/src/logUtils';
import { LOG_MAPPINGS } from './constants';

export default {
  getSchemaLabels: ({ data: { type } }) => ({
    status: 'success',
    data: getSchemaLabels(type, LOG_MAPPINGS)
  })
};
