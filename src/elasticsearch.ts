import * as elasticsearch from 'elasticsearch';
import { debugBase } from './debuggers';

const { NODE_ENV, ELASTICSEARCH_URL = 'http://localhost:9200' } = process.env;

export const client = new elasticsearch.Client({
  hosts: [ELASTICSEARCH_URL],
});

export const getMappings = async (index: string) => {
  return client.indices.getMapping({ index });
};

export const fetchElk = async (action, index: string, body: any) => {
  if (NODE_ENV === 'test') {
    return action === 'search' ? { hits: { total: { value: 0 }, hits: [] } } : 0;
  }

  try {
    const response = await client[action]({
      index,
      body,
    });

    return response;
  } catch (e) {
    debugBase(`Error during elk query ${e}`);
    throw new Error(e);
  }
};
