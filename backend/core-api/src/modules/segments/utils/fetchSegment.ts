import {
  fetchEsWithScroll,
  getElasticsearchInfo,
} from 'erxes-api-shared/utils';

import { generateElkIds, getRealIdFromElk } from 'erxes-api-shared/utils';

import { getEsIndexByContentType } from 'erxes-api-shared/core-modules';
import {
  fetchEs,
  getDbNameFromConnectionString,
  getPlugin,
  getPlugins,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IOptions } from '../types';
import { generateQueryBySegment } from './common';

export const fetchSegment = async (
  models: IModels,
  subdomain: string,
  segment,
  options: IOptions = {},
): Promise<any> => {
  const { contentType } = segment;

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

  let index = await getEsIndexByContentType(contentType);
  let selector = { bool: {} };

  await generateQueryBySegment(models, subdomain, {
    segment,
    selector: selector.bool,
    options,
    pluginConfigs,
    isInitialCall: true,
  });
  const { returnAssociated } = options;

  if (returnAssociated && contentType !== returnAssociated.relType) {
    index = await getEsIndexByContentType(returnAssociated.relType);

    const itemsResponse = await fetchEs({
      subdomain,
      action: 'search',
      connectionString: mongoConnectionString,
      index: await getEsIndexByContentType(returnAssociated.mainType),
      body: {
        query: selector,
        _source: '_id',
      },
      defaultValue: { hits: { hits: [] } },
    });

    const items = itemsResponse.hits.hits;
    const itemIds = items.map((i) => getRealIdFromElk(i._id));

    const getType = (type) =>
      type
        .replace('core:', '')
        .replace('tickets:', '')
        .replace('tasks:', '')
        .replace('sales:', '')
        .replace('purchases:', '');

    const associationIds = await models.Conformities.filterConformity({
      mainType: getType(returnAssociated.mainType),
      mainTypeIds: itemIds,
      relType: getType(returnAssociated.relType),
    });

    selector = {
      bool: {
        must: [
          {
            terms: {
              _id: await generateElkIds(associationIds, subdomain),
            },
          },
        ],
      },
    };
  }

  if (options.returnSelector) {
    return selector;
  }

  // count entries
  if (options.returnCount) {
    const countResponse = await fetchEs({
      subdomain,
      action: 'count',
      connectionString: mongoConnectionString,
      index,
      body: {
        query: selector,
      },
      defaultValue: { count: -1 },
    });

    return countResponse?.body?.count;
  }

  const { sortField, sortDirection, page, perPage } = options;

  let pagination = {};

  if (page && perPage) {
    pagination = {
      from: (page - 1) * perPage,
      size: perPage,
    };
  }

  if (sortField && sortDirection) {
    pagination = {
      ...pagination,
      sort: {
        [sortField]: {
          order: sortDirection
            ? sortDirection === -1
              ? 'desc'
              : 'asc'
            : 'desc',
        },
      },
    };
  }

  const fetchOptions: any = {
    subdomain,
    action: 'search',
    connectionString: mongoConnectionString,
    index,
    body: {
      _source: options.returnFields || options.returnFullDoc || false,
      query: selector,
      ...pagination,
    },
    defaultValue: { hits: { hits: [] } },
  };

  if (options.scroll && options.perPage) {
    // keep the search results "scrollable" for 1 minute
    fetchOptions.scroll = '1m';
    fetchOptions.size = perPage;

    const results: any[] = [];
    const resp: any[] = [];

    const initialResponse = await fetchEs(fetchOptions);

    resp.push(initialResponse);

    while (resp.length) {
      const { hits = {} } = resp.shift();

      if (hits.hits) {
        hits.hits.forEach((hit) => {
          results.push(getRealIdFromElk(hit._id));
        });
      }

      /* istanbul ignore next */

      if (hits.total && hits.total.value === results.length) {
        // check to see if we have collected all the documents
        break;
      }

      /* istanbul ignore next */

      if (initialResponse._scroll_id) {
        // get the next response if there are more to fetch
        resp.push(await fetchEsWithScroll(initialResponse._scroll_id));
      }
    }

    return results;
  }

  const response = await fetchEs(fetchOptions);

  if (options.returnFullDoc || options.returnFields) {
    return response.hits.hits.map((hit) => ({
      _id: getRealIdFromElk(hit._id),
      ...hit._source,
    }));
  }

  return response.hits.hits.map((hit) => getRealIdFromElk(hit._id));
};
