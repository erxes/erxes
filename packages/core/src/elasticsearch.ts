import * as dotenv from 'dotenv';
import * as elasticsearch from 'elasticsearch';
import { debugError } from './debuggers';

// load environment variables
dotenv.config();

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
}: {
  action: string;
  index: string;
  body: any;
  _id?: string;
  defaultValue?: any;
}) => {
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
