import * as _ from 'underscore';
import {
  fetchByQuery,
  fetchEs,
  fetchEsWithScroll
} from '@erxes/api-utils/src/elasticsearch';
import {
  SEGMENT_DATE_OPERATORS,
  SEGMENT_NUMBER_OPERATORS
} from '../../../constants';
import { ICondition, ISegment } from '../../../models/definitions/segments';
import { serviceDiscovery } from '../../../configs';
import { IModels } from '../../../connectionResolver';
import { sendCoreMessage, sendMessage } from '../../../messageBroker';

type IOptions = {
  returnAssociated?: { mainType: string; relType: string };
  returnFields?: string[];
  returnFullDoc?: boolean;
  returnSelector?: boolean;
  returnCount?: boolean;
  defaultMustSelector?: any[];
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
  scroll?: boolean;
};

export const isInSegment = async (
  models: IModels,
  subdomain: string,
  segmentId: string,
  idToCheck: string,
  options: IOptions = {}
): Promise<boolean> => {
  options.returnCount = true;
  options.defaultMustSelector = [
    {
      match: {
        _id: idToCheck
      }
    }
  ];

  const segment = await models.Segments.getSegment(segmentId);
  const count = await fetchSegment(models, subdomain, segment, options);

  return count > 0;
};

export const fetchSegment = async (
  models: IModels,
  subdomain: string,
  segment,
  options: IOptions = {}
): Promise<any> => {
  const { contentType } = segment;

  const serviceNames = await serviceDiscovery.getServices();
  const serviceConfigs: any = [];

  for (const serviceName of serviceNames) {
    const service = await serviceDiscovery.getService(serviceName, true);
    const segmentMeta = (service.config.meta || {}).segments;

    if (segmentMeta) {
      serviceConfigs.push(segmentMeta);
    }
  }

  let index = await getIndexByContentType(serviceConfigs, contentType);
  let selector = { bool: {} };

  await generateQueryBySegment(models, subdomain, {
    segment,
    selector: selector.bool,
    options,
    serviceConfigs,
    isInitialCall: true
  });

  const { returnAssociated } = options;

  if (returnAssociated && contentType !== returnAssociated.relType) {
    index = await getIndexByContentType(
      serviceConfigs,
      returnAssociated.relType
    );

    const itemsResponse = await fetchEs({
      subdomain,
      action: 'search',
      index: await getIndexByContentType(
        serviceConfigs,
        returnAssociated.mainType
      ),
      body: {
        query: selector,
        _source: '_id'
      },
      defaultValue: { hits: { hits: [] } }
    });

    const items = itemsResponse.hits.hits;
    const itemIds = items.map(i => i._id);

    const getType = type => type.replace('contacts:', '').replace('cards:', '');

    const associationIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.filterConformity',
      data: {
        mainType: getType(returnAssociated.mainType),
        mainTypeIds: itemIds,
        relType: getType(returnAssociated.relType)
      },
      isRPC: true
    });

    selector = {
      bool: {
        must: [
          {
            terms: {
              _id: _.uniq(associationIds)
            }
          }
        ]
      }
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
      index,
      body: {
        query: selector
      },
      defaultValue: { count: -1 }
    });

    return countResponse.count;
  }

  const { sortField, sortDirection, page, perPage } = options;

  let pagination = {};

  if (page && perPage) {
    pagination = {
      from: (page - 1) * perPage,
      size: perPage
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
            : 'desc'
        }
      }
    };
  }

  const fetchOptions: any = {
    subdomain,
    action: 'search',
    index,
    body: {
      _source: options.returnFields || options.returnFullDoc || false,
      query: selector,
      ...pagination
    },
    defaultValue: { hits: { hits: [] } }
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
        hits.hits.forEach(hit => {
          results.push(hit._id);
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
    return response.hits.hits.map(hit => ({ _id: hit._id, ...hit._source }));
  }

  return response.hits.hits.map(hit => hit._id);
};

export const generateQueryBySegment = async (
  models: IModels,
  subdomain: string,
  args: {
    segment: ISegment;
    selector: any;
    serviceConfigs: any;
    options?: IOptions;
    isInitialCall?: boolean;
  }
) => {
  const {
    segment,
    selector,
    serviceConfigs,
    options = {},
    isInitialCall
  } = args;

  const { contentType } = segment;
  const [serviceName, collectionType] = contentType.split(':');
  const { defaultMustSelector } = options;

  const defaultSelector =
    isInitialCall && defaultMustSelector
      ? defaultMustSelector.map(s => ({ ...s }))
      : [];

  const cj = segment.conditionsConjunction || 'and';

  if (cj === 'and') {
    selector.must = defaultSelector;
    selector.must_not = [];
  } else {
    selector.must = [
      {
        bool: {
          should: [],
          must_not: []
        }
      },
      ...defaultSelector
    ];
  }

  const selectorPositiveList =
    cj === 'and' ? selector.must : selector.must[0].bool.should;

  const selectorNegativeList =
    cj === 'and' ? selector.must_not : selector.must[0].bool.must_not;

  const parentSegment = await models.Segments.findOne({ _id: segment.subOf });

  if (parentSegment && (!segment._id || segment._id !== parentSegment._id)) {
    selectorPositiveList.push({ bool: {} });

    await generateQueryBySegment(models, subdomain, {
      ...args,
      selector: selectorPositiveList[selectorPositiveList.length - 1].bool,
      segment: parentSegment,
      isInitialCall: false
    });
  }

  let typesMap = {};

  const eventPositive: any = [];
  const eventNegative: any = [];
  const propertiesPositive: any = [];
  const propertiesNegative: any = [];

  for (const serviceConfig of serviceConfigs) {
    const {
      contentTypes,
      esTypesMapAvailable,
      initialSelectorAvailable
    } = serviceConfig;

    if (contentTypes && contentTypes.includes(collectionType)) {
      if (esTypesMapAvailable) {
        const response = await sendMessage({
          subdomain,
          serviceName,
          isRPC: true,
          action: 'segments.esTypesMap',
          data: { collectionType }
        });

        typesMap = response.typesMap;
      }

      if (initialSelectorAvailable) {
        const { negative, positive } = await sendMessage({
          subdomain,
          serviceName,
          isRPC: true,
          action: 'segments.initialSelector',
          data: { segment, options }
        });

        if (negative) {
          propertiesNegative.push(negative);
        }

        if (positive) {
          propertiesPositive.push(positive);
        }
      }
    }
  }

  const propertyConditions: ICondition[] = [];
  const eventConditions: ICondition[] = [];

  const conditions = segment.conditions || [];

  for (const condition of conditions) {
    if (condition.type === 'property') {
      if (condition.propertyType !== 'forms:form_submission') {
        propertyConditions.push(condition);
      } else {
        const formFieldCondition = { ...condition };

        formFieldCondition.propertyName = 'formFieldId';
        formFieldCondition.propertyValue = condition.propertyName;

        if (
          condition.propertyOperator &&
          ['is', 'ins'].indexOf(condition.propertyOperator) <= 0
        ) {
          formFieldCondition.propertyOperator = 'e';
          condition.propertyName = 'value';
          propertyConditions.push(condition);
        }

        propertyConditions.push(formFieldCondition);
      }
    }

    if (condition.type === 'event') {
      eventConditions.push(condition);
    }

    if (
      condition.type === 'subSegment' &&
      (condition.subSegmentId || condition.subSegmentForPreview)
    ) {
      let subSegment = condition.subSegmentForPreview;

      if (condition.subSegmentId) {
        subSegment = await models.Segments.getSegment(condition.subSegmentId);
      }

      selectorPositiveList.push({ bool: {} });

      await generateQueryBySegment(models, subdomain, {
        ...args,
        segment: subSegment || ({} as ISegment),
        selector: selectorPositiveList[selectorPositiveList.length - 1].bool,
        isInitialCall: false
      });
    }
  }

  for (const condition of propertyConditions) {
    const field = condition.propertyName;

    if (field && condition.propertyType) {
      let [positiveQuery, negativeQuery] = elkConvertConditionToQuery({
        field,
        type: typesMap[field],
        operator: condition.propertyOperator || '',
        value: condition.propertyValue || ''
      });

      negativeQuery = negativeQuery;

      for (const serviceConfig of serviceConfigs) {
        const {
          contentTypes,
          propertyConditionExtenderAvailable
        } = serviceConfig;

        const [
          propertyServiceName,
          propertyContentType
        ] = condition.propertyType.split(':');

        if (
          contentTypes &&
          propertyConditionExtenderAvailable &&
          contentTypes.includes(propertyContentType)
        ) {
          const { positive } = await sendMessage({
            subdomain,
            serviceName: propertyServiceName,
            isRPC: true,
            action: 'segments.propertyConditionExtender',
            data: { condition }
          });

          if (positive) {
            positiveQuery = {
              bool: {
                must: [positiveQuery, positive]
              }
            };
          }
        }
      }

      if (contentType === condition.propertyType) {
        if (positiveQuery) {
          propertiesPositive.push(positiveQuery);
        }

        if (negativeQuery) {
          propertiesNegative.push(negativeQuery);
        }
      } else {
        const ids = await associationPropertyFilter(subdomain, {
          serviceName,
          mainType: contentType,
          propertyType: condition.propertyType,
          positiveQuery,
          negativeQuery
        });

        propertiesPositive.push({
          terms: {
            _id: ids.map(id => id)
          }
        });
      }
    }
  }

  for (const condition of eventConditions) {
    const {
      eventOccurence,
      eventName,
      eventOccurenceValue,
      eventAttributeFilters = []
    } = condition;

    eventPositive.push({
      term: {
        name: eventName
      }
    });

    if (eventOccurence === 'exactly') {
      eventPositive.push({
        term: {
          count: eventOccurenceValue
        }
      });
    }

    if (eventOccurence === 'atleast') {
      eventPositive.push({
        range: {
          count: {
            gte: eventOccurenceValue
          }
        }
      });
    }

    if (eventOccurence === 'atmost') {
      eventPositive.push({
        range: {
          count: {
            lte: eventOccurenceValue
          }
        }
      });
    }

    for (const filter of eventAttributeFilters) {
      const [positiveQuery, negativeQuery] = elkConvertConditionToQuery({
        field: `attributes.${filter.name}`,
        operator: filter.operator,
        value: filter.value
      });

      if (positiveQuery) {
        eventPositive.push(positiveQuery);
      }

      if (negativeQuery) {
        eventNegative.push(negativeQuery);
      }
    }

    if (eventPositive.length > 0 || eventNegative.length > 0) {
      const idsByEvents = await fetchByQuery({
        subdomain,
        index: 'events',
        _source: contentType === 'company' ? 'companyId' : 'customerId',
        positiveQuery: eventPositive,
        negativeQuery: eventNegative
      });

      propertiesPositive.push({
        terms: {
          _id: idsByEvents
        }
      });
    }
  }

  selectorPositiveList.push(...propertiesPositive);
  selectorNegativeList.push(...propertiesNegative);
};

export const generateNestedQuery = (
  kind: string,
  field: string,
  operator: string,
  query: any,
  fixedValue: any
) => {
  const fieldKey = field.replace(`${kind}.`, '');

  let fieldValue = 'value';

  if (typeof fixedValue === 'string') {
    fieldValue = 'stringValue';
  }

  if (SEGMENT_NUMBER_OPERATORS.includes(operator)) {
    fieldValue = 'numberValue';
  }

  if (SEGMENT_DATE_OPERATORS.includes(operator)) {
    fieldValue = 'dateValue';
  }

  let updatedQuery = query;

  updatedQuery = JSON.stringify(updatedQuery).replace(
    `${kind}.${fieldKey}`,
    `${kind}.${fieldValue}`
  );
  updatedQuery = JSON.parse(updatedQuery);

  return {
    nested: {
      path: kind,
      query: {
        bool: {
          must: [
            {
              term: {
                [`${kind}.field`]: fieldKey
              }
            },
            updatedQuery
          ]
        }
      }
    }
  };
};

export function elkConvertConditionToQuery(args: {
  field: string;
  type?: any;
  operator: string;
  value: string;
}) {
  const { field, type, operator, value } = args;

  let fixedValue: any = (value || '').includes('now')
    ? value
    : value.toLocaleLowerCase();

  if (['dateigt', 'dateilt', 'drlt', 'drgt'].includes(operator || '')) {
    fixedValue = new Date(value);
  }

  let positiveQuery;
  let negativeQuery;

  // equal
  if (['e', 'numbere'].includes(operator)) {
    if (['keyword', 'email'].includes(type) || operator === 'numbere') {
      positiveQuery = {
        term: { [field]: value }
      };
    } else {
      positiveQuery = {
        match_phrase: { [field]: value }
      };
    }
  }

  // does not equal
  if (['dne', 'numberdne'].includes(operator)) {
    if (['keyword', 'email'].includes(type) || operator === 'numberdne') {
      negativeQuery = {
        term: { [field]: value }
      };
    } else {
      negativeQuery = {
        match_phrase: { [field]: value }
      };
    }
  }

  // contains
  if (operator === 'c') {
    positiveQuery = {
      wildcard: {
        [field]: `*${fixedValue}*`
      }
    };
  }

  // does not contains
  if (operator === 'dnc') {
    negativeQuery = {
      wildcard: {
        [field]: `*${fixedValue}*`
      }
    };
  }

  // greater than equal
  if (['igt', 'numberigt', 'dateigt'].includes(operator)) {
    positiveQuery = {
      range: {
        [field]: {
          gte: fixedValue
        }
      }
    };
  }

  // less then equal
  if (['ilt', 'numberilt', 'dateilt'].includes(operator)) {
    positiveQuery = {
      range: {
        [field]: {
          lte: fixedValue
        }
      }
    };
  }

  // is true
  if (operator === 'it') {
    positiveQuery = {
      term: {
        [field]: true
      }
    };
  }

  // is false
  if (operator === 'if') {
    positiveQuery = {
      term: {
        [field]: false
      }
    };
  }

  // is set
  if (['is', 'dateis'].includes(operator)) {
    positiveQuery = {
      exists: {
        field
      }
    };
  }

  // is not set
  if (['ins', 'dateins'].includes(operator)) {
    negativeQuery = {
      exists: {
        field
      }
    };
  }

  if (['woam', 'wobm', 'woad', 'wobd'].includes(operator)) {
    let gte = '';
    let lte = '';

    // will occur after on following n-th minute
    if (operator === 'woam') {
      gte = `now-${fixedValue}m/m`;
      lte = `now-${fixedValue}m/m`;
    }

    // will occur before on following n-th minute
    if (operator === 'wobm') {
      gte = `now+${fixedValue}m/m`;
      lte = `now+${fixedValue}m/m`;
    }

    // will occur after on following n-th day
    if (operator === 'woad') {
      gte = `now-${fixedValue}d/d`;
      lte = `now-${fixedValue}d/d`;
    }

    // will occur before on following n-th day
    if (operator === 'wobd') {
      gte = `now+${fixedValue}d/d`;
      lte = `now+${fixedValue}d/d`;
    }

    positiveQuery = { range: { [field]: { gte, lte } } };
  }

  // date relative less than
  if (operator === 'drlt') {
    positiveQuery = { range: { [field]: { lte: fixedValue } } };
  }

  // date relative greater than
  if (operator === 'drgt') {
    positiveQuery = { range: { [field]: { gte: fixedValue } } };
  }

  for (const nestedType of ['customFieldsData', 'trackedData', 'attributes']) {
    if (field.includes(nestedType)) {
      if (positiveQuery) {
        positiveQuery = generateNestedQuery(
          nestedType,
          field,
          operator,
          positiveQuery,
          fixedValue
        );
      }

      if (negativeQuery) {
        negativeQuery = generateNestedQuery(
          nestedType,
          field,
          operator,
          negativeQuery,
          fixedValue
        );
      }
    }
  }

  return [positiveQuery, negativeQuery];
}

const getIndexByContentType = async (
  serviceConfigs: any,
  contentType: string
) => {
  let index = '';

  for (const serviceConfig of serviceConfigs) {
    const { indexesTypeContentType } = serviceConfig;

    if (indexesTypeContentType && indexesTypeContentType[contentType]) {
      index = indexesTypeContentType[contentType];
      break;
    }
  }

  return index;
};

const associationPropertyFilter = async (
  subdomain: string,
  {
    serviceName,
    mainType,
    propertyType,
    positiveQuery,
    negativeQuery
  }: {
    serviceName: string;
    mainType: string;
    propertyType: string;
    positiveQuery: any;
    negativeQuery: any;
  }
) => {
  const service = await serviceDiscovery.getService(serviceName, true);
  const segmentMeta = (service.config.meta || {}).segments;

  if (segmentMeta && segmentMeta.associationFilterAvailable) {
    const response = await sendMessage({
      subdomain,
      serviceName,
      isRPC: true,
      action: 'segments.associationFilter',
      data: {
        mainType,
        propertyType,
        positiveQuery,
        negativeQuery
      }
    });

    return response;
  }

  return [];
};
