import { parse } from 'url';
import { getSaasOrganizationIdBySubdomain } from '../saas';
import { getEnv } from '../utils';
import { IFetchEsArgs } from './types';
import { Client } from '@elastic/elasticsearch';

const { ELASTICSEARCH_URL = 'http://localhost:9200' } = process.env;

export const client = new Client({
  node: ELASTICSEARCH_URL,
});

export const isElasticsearchUp = async () => {
  try {
    const status = await fetch(ELASTICSEARCH_URL).then((res) => res.status);
    return status === 200;
  } catch (err) {
    console.warn('Elasticsearch is not running:', err.message);
    return false;
  }
};

export const getElasticsearchInfo = async () => {
  return await client.info();
};

export const getRealIdFromElk = (_id: string) => {
  const VERSION = getEnv({ name: 'VERSION' });
  if (VERSION && VERSION === 'saas') {
    const arr = _id.split('__');

    if (arr?.length > 1) {
      return _id.replace(`${arr[0]}__`, '');
    }
  }

  return _id;
};

export const generateElkId = async (id: string, subdomain: string) => {
  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION && VERSION === 'saas') {
    const organizationId = await getSaasOrganizationIdBySubdomain(subdomain);

    return `${organizationId}__${id}`;
  }
  return id;
};

export const generateElkIds = async (ids: string[], subdomain: string) => {
  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION && VERSION === 'saas') {
    if (ids && ids.length) {
      const organizationId = await getSaasOrganizationIdBySubdomain(subdomain);

      return ids.map((_id) => `${organizationId}__${_id}`);
    }
    return [];
  }

  return ids;
};

export function getDbNameFromConnectionString(connectionString: string) {
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

const elasticMethodMap = {
  search: (params: any) => client.search(params),
  count: (params: any) => client.count(params),
} as const;

export const fetchEsWithScroll = async (scrollId: string) => {
  try {
    const response = await client.scroll({ scroll_id: scrollId, scroll: '1m' });

    return response;
  } catch (e) {
    console.error('Error fetching Elasticsearch with scroll', { error: e });
    throw e;
  }
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
      organizationId = await getSaasOrganizationIdBySubdomain(subdomain);

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

    const isUp = await isElasticsearchUp();

    if (!isUp) {
      throw new Error('Elasticsearch is not running');
    }

    const response = await elasticMethodMap[action](params);

    return response;
  } catch (e) {
    if (!ignoreError) {
      console.log(
        `Error during es query: ${JSON.stringify(body)}: ${e.message}`,
      );
    }

    if (typeof defaultValue !== 'undefined') {
      return defaultValue;
    }

    throw e;
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
    .map((hit: any) => (_source === '_id' ? hit._id : hit._source[_source]))
    .filter((r: any) => r);

  if (totalCount < 10000) {
    return ids;
  }

  while (totalCount > 0) {
    const scrollResponse = await fetchEsWithScroll(scrollId);

    if (scrollResponse.body.hits.hits.length === 0) {
      break;
    }

    ids = ids.concat(scrollResponse.body.hits.hits.map((hit: any) => hit._id));
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
    .map((hit: any) => (_source === '_id' ? hit._id : hit._source[_source]))
    .filter((r: any) => r);
};

export async function getTotalDocCount() {
  const response = await client.indices.stats({ metric: 'docs' });

  const totalDocs = response.body._all.primaries.docs.count;

  return totalDocs;
}
