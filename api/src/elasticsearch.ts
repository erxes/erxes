import * as dotenv from 'dotenv';
import * as elasticsearch from 'elasticsearch';
import * as telemetry from 'erxes-telemetry';
import * as mongoUri from 'mongo-uri';
import { debugBase } from './debuggers';

// load environment variables
dotenv.config();

const { NODE_ENV, MONGO_URL, ELASTICSEARCH_URL = 'http://localhost:9200' } = process.env;

export const client = new elasticsearch.Client({
  hosts: [ELASTICSEARCH_URL],
});

export const getMappings = async (index: string) => {
  return client.indices.getMapping({ index });
};

export const getIndexPrefix = () => {
  if (ELASTICSEARCH_URL === 'https://elasticsearch.erxes.io' && NODE_ENV === 'production') {
    return `${telemetry.getMachineId().toString()}__`;
  }

  const uriObject = mongoUri.parse(MONGO_URL);
  const dbName = uriObject.database;

  return `${dbName}__`;
};

export const fetchElk = async (action, index: string, body: any, id?: string, defaultValue?: any) => {
  if (NODE_ENV === 'test') {
    return action === 'search' ? { hits: { total: { value: 0 }, hits: [] } } : 0;
  }

  try {
    const response = await client[action]({
      index: `${getIndexPrefix()}${index}`,
      body,
      id,
    });

    return response;
  } catch (e) {
    if (defaultValue) {
      return defaultValue;
    }

    debugBase(`Error during elk query ${e}`);
    throw new Error(e);
  }
};
