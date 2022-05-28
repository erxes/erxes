import * as elasticsearch from 'elasticsearch';
import { debugError } from './debuggers';

export interface IFetchEsArgs {
  subdomain: string;
  action: string;
  index: string;
  body: any;
  _id?: string;
  defaultValue?: any;
  scroll?: string;
  size?: number;
  ignoreError?: boolean;
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
  defaultValue,
  scroll,
  size
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

    // for returning results more than 10000
    if (scroll && size) {
      params.scroll = scroll;
      params.size = size;
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

// Fetch from es with scroll option than can find results more than the default 10000
export const fetchEsWithScroll = async (scrollId: string) => {
  try {
    const response = await client.scroll({ scrollId, scroll: '1m' });

    return response;
  } catch (e) {
    throw new Error(e);
  }
};

export const fetchByQuery = async ({
  subdomain,
  index,
  positiveQuery,
  negativeQuery,
  _source = '_id'
}: {
  subdomain: string;
  index: string;
  _source?: string;
  positiveQuery: any;
  negativeQuery: any;
}) => {
  const response = await fetchEs({
    subdomain,
    action: 'search',
    index,
    body: {
      _source,
      query: {
        bool: {
          must: positiveQuery,
          must_not: negativeQuery
        }
      }
    },
    defaultValue: { hits: { hits: [] } }
  });

  return response.hits.hits
    .map(hit => (_source === '_id' ? hit._id : hit._source[_source]))
    .filter(r => r);
};
