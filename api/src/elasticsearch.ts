import * as dotenv from 'dotenv';
import * as elasticsearch from 'elasticsearch';
import * as telemetry from 'erxes-telemetry';
import * as mongoUri from 'mongo-uri';
import { debugError } from './debuggers';

// load environment variables
dotenv.config();

const {
  NODE_ENV,
  MONGO_URL,
  TEST_MONGO_URL = 'mongodb://localhost/test',
  ELASTICSEARCH_URL = 'http://localhost:9200'
} = process.env;

export const client = new elasticsearch.Client({
  hosts: [ELASTICSEARCH_URL]
});

export const getMappings = async (index: string) => {
  return client.indices.getMapping({ index });
};

export const getIndexPrefix = () => {
  if (
    ELASTICSEARCH_URL === 'https://elasticsearch.erxes.io' &&
    NODE_ENV === 'production'
  ) {
    return `${telemetry.getMachineId().toString()}__`;
  }

  let uriObject = mongoUri.parse(MONGO_URL);
  if (NODE_ENV === 'test') {
    uriObject = mongoUri.parse(TEST_MONGO_URL);
  }

  const dbName = uriObject.database;

  return `${dbName}__`;
};

interface IElkOptions {
  action: string;
  index: string;
  body: any;
  _id?: string;
  defaultValue?: any;
  scroll?: string;
  size?: number;
}

export const fetchElk = async ({
  action,
  index,
  body,
  _id,
  defaultValue,
  scroll,
  size
}: IElkOptions) => {
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

    // for returning results more than 10000
    if (scroll && size) {
      params.scroll = scroll;
      params.size = size;
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

export const fetchElkScroll = async (scrollId: string) => {
  try {
    const response = await client.scroll({ scrollId, scroll: '1m' });

    return response;
  } catch (e) {
    throw new Error(e);
  }
};
