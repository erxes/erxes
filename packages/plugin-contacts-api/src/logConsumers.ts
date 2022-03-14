import { getSchemaLabels } from '@erxes/api-utils/src/logUtils';
import { LOG_MAPPINGS } from './constants';

export default {
  getSchemaLabels: ({ type }) => ({
    status: 'success',
    data: getSchemaLabels(type, LOG_MAPPINGS)
  })
};
