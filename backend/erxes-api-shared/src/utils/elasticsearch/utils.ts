import { Client } from '@elastic/elasticsearch';
import { parse } from 'url';
import { getSaasOrganizationIdBySubdomain } from '../saas';
import { getPlugin, getPlugins } from '../service-discovery';
import { getEnv } from '../utils';
import { IFetchEsArgs } from './types';

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
};

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

    return await elasticMethodMap[action](params);
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
    defaultValue: {
      _scroll_id: '',
      body: { hits: { total: { value: 0 }, hits: [] } },
    },
  });

  const totalCount = response.body?.hits?.total?.value || 0;
  const scrollId = response._scroll_id;

  let ids = response.body.hits.hits
    .map((hit: any) => (_source === '_id' ? hit._id : hit._source[_source]))
    .filter((r: any) => r);

  if (totalCount < 10000) {
    return ids;
  }

  while (totalCount > 0) {
    const scrollResponse = (await fetchEsWithScroll(scrollId)) as any;

    if (scrollResponse.body.hits.hits.length === 0) {
      break;
    }

    ids = ids.concat(
      scrollResponse.body.hits.hits.map((hit: any) =>
        _source === '_id' ? hit._id : hit._source[_source],
      ),
    );
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

export async function getEsIndexTotalCount(contentType: string) {
  const { mongoConnectionString } = await getPluginSegmentConfig(contentType);
  const esIndex = await getEsIndexByContentType(contentType);
  const index = `${getIndexPrefix(mongoConnectionString)}${esIndex}`;
  const response = await client.count({ index });
  const totalDocs = response.body.count;
  return totalDocs;
}

export const getPluginSegmentConfig = async (contentType: string) => {
  const pluginNames = await getPlugins();
  const pluginConfigs: any = [];
  let mongoConnectionString = '';
  for (const pluginName of pluginNames) {
    const plugin = await getPlugin(pluginName);
    const segmentMeta = (plugin.config.meta || {}).segments;
    if (
      contentType.includes(`${pluginName}:`) &&
      getDbNameFromConnectionString(
        plugin?.config?.dbConnectionString || '',
      ) !== 'erxes'
    ) {
      mongoConnectionString = plugin?.config?.dbConnectionString || '';
    }

    if (segmentMeta) {
      pluginConfigs.push(segmentMeta);
    }
  }
  return { pluginConfigs, mongoConnectionString };
};

export const getEsIndexByContentType = async (contentType: string) => {
  const [pluginName, _moduleName, type] = contentType
    .replace(/\./g, ':')
    .split(':');

  const plugin = await getPlugin(pluginName);

  const segmentMeta = (plugin.config.meta || {}).segments;

  if (segmentMeta) {
    const { contentTypes } = segmentMeta;
    for (const ct of contentTypes) {
      if (ct.type === type && ct.esIndex) {
        return ct.esIndex;
      }
    }
  }

  return '';
};
