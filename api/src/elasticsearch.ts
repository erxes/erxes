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

  const uriObject = mongoUri.parse(MONGO_URL);
  const dbName = uriObject.database;

  return `${dbName}__`;
};

export const fetchElk = async (
  action,
  index: string,
  body: any,
  id?: string,
  defaultValue?: any
) => {
  if (NODE_ENV === 'test') {
    return action === 'search'
      ? { hits: { total: { value: 0 }, hits: [] } }
      : 0;
  }

  try {
    const params: { index: string; body: any; id?: string } = {
      index: `${getIndexPrefix()}${index}`,
      body
    };

    if (action === 'search' && body && !body.size) {
      body.size = 10000;
    }

    if (id) {
      params.id = id;
    }

    const response = await client[action](params);

    return response;
  } catch (e) {
    debugError(`Error during elk query ${e.message}`);

    if (typeof defaultValue !== undefined) {
      return defaultValue;
    }

    throw new Error(e);
  }
};
