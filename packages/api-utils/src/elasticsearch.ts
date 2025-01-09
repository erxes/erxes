import * as elasticsearch from 'elasticsearch';

import { debugError } from './debuggers';
import { getEnv } from './core';
import { getOrganizationIdBySubdomain } from './saas/saas';
import { parse } from 'url';

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
  connectionString?: string;
}

export const doSearch = async ({
  customQuery,
  subdomain,
  index,
  value,
  fields,
}: {
  subdomain: string;
  index: string;
  value: string;
  fields: string[];
  customQuery?: any;
}) => {
  const highlightFields = {};

  fields.forEach((field) => {
    highlightFields[field] = {};
  });

  const match = {
    multi_match: {
      query: value,
      fields,
    },
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
          must: [query],
        },
      },
      size: 10,
      highlight: {
        fields: highlightFields,
      },
    },
    defaultValue: { hits: { hits: [] } },
  });

  const results = fetchResults.hits.hits.map((result) => {
    return {
      source: {
        _id: getRealIdFromElk(result._id),
        ...result._source,
      },
      highlight: result.highlight,
    };
  });

  return results;
};

export const fetchEs = async ({
  subdomain,
  action,
  index,
  body,
  _id,
  defaultValue,
  scroll,
  size,
  ignoreError = false,
  connectionString,
}: IFetchEsArgs) => {
  try {
    const VERSION = getEnv({ name: 'VERSION' });
    let organizationId = '';

    if (VERSION && VERSION === 'saas') {
      organizationId = await getOrganizationIdBySubdomain(subdomain);

      if (body && body.query) {
        if (body.query.bool) {
          if (body.query.bool.must) {
            const extraQuery = {
              term: {
                organizationId,
              },
            };

            if (body.query.bool.must.push) {
              body.query.bool.must.push(extraQuery);
            } else {
              body.query.bool.must = [body.query.bool.must, extraQuery];
            }
          }
        }
      }

      if (body && Object.keys(body).length === 0) {
        body = { query: { match: { organizationId } } };
      }
    }

    const params: any = {
      index: `${getIndexPrefix(connectionString)}${index}`,
      body,
    };

    if (action === 'search' && body && !body.size) {
      body.size = 10000;
    }

    if (_id && organizationId) {
      params.id = `${organizationId}__${_id}`;
    } else if (_id && !organizationId) {
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
    if (!ignoreError) {
      debugError(
        `Error during es query: ${JSON.stringify(body)}: ${e.message}`
      );
    }

    if (typeof defaultValue !== 'undefined') {
      return defaultValue;
    }

    throw new Error(e);
  }
};

const { ELASTICSEARCH_URL = 'http://localhost:9200' } = process.env;

export const client = new elasticsearch.Client({
  hosts: [ELASTICSEARCH_URL],
});

export const getMappings = async (index: string) => {
  return client.indices.getMapping({ index });
};

export function getDbNameFromConnectionString(connectionString) {
  const parsedUrl = parse(connectionString, true);

  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION && VERSION === 'saas') {
    return 'erxes';
  }

  if (parsedUrl.pathname) {
    const dbName = parsedUrl.pathname.substring(1);
    return dbName;
  }

  return null;
}

export const getIndexPrefix = (connectionString?: string) => {
  if (connectionString) {
    const dbName = getDbNameFromConnectionString(connectionString);

    if (dbName !== 'erxes') {
      return `${dbName}__`;
    }
  }

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

export const fetchByQueryWithScroll = async ({
  subdomain,
  index,
  positiveQuery,
  negativeQuery,
  _source = '_id',
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
    scroll: '1m',
    size: 10000,
    body: {
      _source,
      query: {
        bool: {
          must: positiveQuery,
          must_not: negativeQuery,
        },
      },
    },
    defaultValue: { _scroll_id: '', hits: { total: { value: 0 }, hits: [] } },
  });

  const totalCount = response.hits.total.value;
  const scrollId = response._scroll_id;

  let ids = response.hits.hits
    .map((hit) => (_source === '_id' ? hit._id : hit._source[_source]))
    .filter((r) => r);

  if (totalCount < 10000) {
    return ids;
  }

  while (totalCount > 0) {
    const scrollResponse = await fetchEsWithScroll(scrollId);

    if (scrollResponse.hits.hits.length === 0) {
      break;
    }

    ids = ids.concat(scrollResponse.hits.hits.map((hit) => hit._id));
  }

  return ids;
};

export const fetchByQuery = async ({
  subdomain,
  index,
  positiveQuery,
  negativeQuery,
  _source = '_id',
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
          must_not: negativeQuery,
        },
      },
    },
    defaultValue: { hits: { hits: [] } },
  });

  return response.hits.hits
    .map((hit) => (_source === '_id' ? hit._id : hit._source[_source]))
    .filter((r) => r);
};

export const getRealIdFromElk = (_id: string) => {
  const VERSION = getEnv({ name: 'VERSION' });
  if (VERSION && VERSION === 'saas') {
    const arr = _id.split('__');

    if(arr?.length > 1){
      return _id.replace(`${arr[0]}__`,'');
    }
  };

  return _id
};

export const generateElkIds = async (ids: string[], subdomain: string) => {
  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION && VERSION === 'saas') {
    if (ids && ids.length) {
      const organizationId = await getOrganizationIdBySubdomain(subdomain);

      return ids.map((_id) => `${organizationId}__${_id}`);
    }
    return [];
  }

  return ids;
};

export const generateElkId = async (id: string, subdomain: string) => {
  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION && VERSION === 'saas') {
    const organizationId = await getOrganizationIdBySubdomain(subdomain);

    return `${organizationId}__${id}`;
  }
  return id;
};
