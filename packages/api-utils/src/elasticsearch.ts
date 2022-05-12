import * as elasticsearch from 'elasticsearch';
import { debugError } from './debuggers';
export interface IFetchEsArgs {
  subdomain: string;
  action: string;
  index: string;
  body: any;
  _id?: string;
  defaultValue?: any;
}

export const doSearch = async ({
  customQuery,
  subdomain,
  index,
  value,
  fields
}: {
  subdomain: string;
  index: string;
  value: string;
  fields: string[];
  customQuery?: any;
}) => {
  const highlightFields = {};

  fields.forEach(field => {
    highlightFields[field] = {};
  });

  const match = {
    multi_match: {
      query: value,
      fields
    }
  };

  let query: any = match;

  if (customQuery) {
    query = customQuery;
  }

  const fetchResults = await fetchEs({
    subdomain,
    action: 'search',
    index,
    body: {
      query: {
        bool: {
          must: [query]
        }
      },
      size: 10,
      highlight: {
        fields: highlightFields
      }
    },
    defaultValue: { hits: { hits: [] } }
  });

  const results = fetchResults.hits.hits.map(result => {
    return {
      source: {
        _id: result._id,
        ...result._source
      },
      highlight: result.highlight
    };
  });

  return results;
};

export const fetchEs = async ({
  action,
  index,
  body,
  _id,
  defaultValue
}: IFetchEsArgs) => {
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
    debugError(`Error during es query ${e.message}`);

    if (typeof defaultValue !== 'undefined') {
      return defaultValue;
    }

    throw new Error(e);
  }
};

const { ELASTICSEARCH_URL = 'http://localhost:9200' } = process.env;

export const client = new elasticsearch.Client({
  hosts: [ELASTICSEARCH_URL]
});

export const getMappings = async (index: string) => {
  return client.indices.getMapping({ index });
};

export const getIndexPrefix = () => {
  return 'erxes__';
};
