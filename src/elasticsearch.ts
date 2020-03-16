import * as dotenv from 'dotenv';
import * as elasticsearch from 'elasticsearch';
import * as mongoUri from 'mongo-uri';
import { debugBase } from './debuggers';

// load environment variables
dotenv.config();

const { NODE_ENV, MONGO_URL, TEST_MONGO_URL, ELASTICSEARCH_URL = 'http://localhost:9200' } = process.env;

export const client = new elasticsearch.Client({
  hosts: [ELASTICSEARCH_URL],
});

export const getMappings = async (index: string) => {
  return client.indices.getMapping({ index });
};

export const getIndexPrefix = () => {
  let mongoUrl = MONGO_URL;

  if (NODE_ENV === 'test') {
    mongoUrl = TEST_MONGO_URL;
  }

  const uriObject = mongoUri.parse(mongoUrl);
  const dbName = uriObject.database;

  return `${dbName}__`;
};

export const fetchElk = async (action, index: string, body: any) => {
  if (NODE_ENV === 'test') {
    return action === 'search' ? { hits: { total: { value: 0 }, hits: [] } } : 0;
  }

  try {
    const response = await client[action]({
      index: `${getIndexPrefix()}${index}`,
      body,
    });

    return response;
  } catch (e) {
    debugBase(`Error during elk query ${e}`);
    throw new Error(e);
  }
};
