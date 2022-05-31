import { IFetchElkArgs } from '@erxes/api-utils/src/types';
import * as elasticsearch from 'elasticsearch';
import { debugError } from './debuggers';

const {
  ELASTICSEARCH_URL = 'http://localhost:9200'
} = process.env;

export const client = new elasticsearch.Client({
  hosts: [ELASTICSEARCH_URL]
});

export const getMappings = async (index: string) => {
  return client.indices.getMapping({ index });
};

export const getIndexPrefix = () => {
  return 'erxes__';
};

export const fetchElk = async ({
  action,
  index,
  body,
  _id,
  defaultValue
}: IFetchElkArgs) => {
  try {
    const params: any = {
      index: `${getIndexPrefix()}${index}`,
      body
    };

    if (action === 'search' && body && !body.size) {
      body.size = 10000;
    }

    if (_id) {
      params.id = _id;
    }

    const response = await client[action](params);

    return response;
  } catch (e) {
    debugError(`Error during elk query ${e.message}`);

    if (typeof defaultValue !== 'undefined') {
      return defaultValue;
    }

    throw new Error(e);
  }
};
