import * as _ from 'underscore';
import {
  Boards,
  Conformities,
  Pipelines,
  Segments,
  Stages
} from '../../../db/models';
import {
  SEGMENT_DATE_OPERATORS,
  SEGMENT_NUMBER_OPERATORS
} from '../../../db/models/definitions/constants';
import { ICondition, ISegment } from '../../../db/models/definitions/segments';
import { fetchElk } from '../../../elasticsearch';
import { getEsTypes } from '../coc/utils';

type IOptions = {
  associatedCustomers?: boolean;
  returnFields?: string[];
  returnFullDoc?: boolean;
  returnSelector?: boolean;
  returnCount?: boolean;
  defaultMustSelector?: any[];
  pipelineId?: string;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
};

export const isInSegment = async (
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

  const segment = await Segments.getSegment(segmentId);
  const count = await fetchSegment(segment, options);

  return count > 0;
};

export const fetchSegment = async (
  segment: ISegment,
  options: IOptions = {}
): Promise<any> => {
  const { contentType } = segment;

  let index = getIndexByContentType(contentType);
  let selector = { bool: {} };

  await generateQueryBySegment({
    segment,
    selector: selector.bool,
    options,
    isInitialCall: true
  });

  if (
    ['company', 'deal', 'task', 'ticket'].includes(contentType) &&
    options.associatedCustomers
  ) {
    index = 'customers';

    const itemsResponse = await fetchElk({
      action: 'search',
      index: getIndexByContentType(segment.contentType),
      body: {
        query: selector,
        _source: '_id'
      },
      defaultValue: { hits: { hits: [] } }
    });

    const items = itemsResponse.hits.hits;
    const itemIds = items.map(i => i._id);

    const customerIds = await Conformities.filterConformity({
      mainType: segment.contentType,
      mainTypeIds: itemIds,
      relType: 'customer'
    });

    selector = {
      bool: {
        must: [
          {
            terms: {
              _id: customerIds
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
    const countResponse = await fetchElk({
      action: 'count',
      index,
      body: {
        query: selector
      },
      defaultValue: { count: -1 }
    });

    return countResponse.count;
  }

  const { sortField, sortDirection, page, perPage, } = options;
  let pagination = {};
  
  if( page && perPage){
    pagination = {
      from: (page - 1) * perPage,
      size: perPage,
    };
  }
  if(sortField && sortDirection){
    pagination = {
        ...pagination, 
        sort: {
        [sortField]: {
          order: sortDirection ? sortDirection === -1 ? 'desc' : 'asc' : 'desc'
        }
      }
    }
  }

  const response = await fetchElk({
    action: 'search',
    index,
    body: {
      _source: options.returnFields || options.returnFullDoc || false,
      query: selector,
      ...pagination
    },
    defaultValue: { hits: { hits: [] } }
  });

  if (options.returnFullDoc || options.returnFields) {
    return response.hits.hits.map(hit => ({ _id: hit._id, ...hit._source }));
  }

  return response.hits.hits.map(hit => hit._id);
};

export const generateQueryBySegment = async (args: {
  segment: ISegment;
  selector: any;
  options?: IOptions;
  isInitialCall?: boolean;
}) => {
  const { segment, selector, options = {}, isInitialCall } = args;
  const { contentType } = segment;
  const { defaultMustSelector } = options;
  const typesMap = getEsTypes(contentType);

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

  const parentSegment = await Segments.findOne({ _id: segment.subOf });

  if (parentSegment && (!segment._id || segment._id !== parentSegment._id)) {
    selectorPositiveList.push({ bool: {} });

    await generateQueryBySegment({
      ...args,
      selector: selectorPositiveList[selectorPositiveList.length - 1].bool,
      segment: parentSegment,
      isInitialCall: false
    });
  }

  const eventPositive: any = [];
  const eventNegative: any = [];
  const propertiesPositive: any = [];
  const propertiesNegative: any = [];

  if (['customer', 'lead', 'visitor'].includes(contentType)) {
    propertiesNegative.push({
      term: {
        status: 'deleted'
      }
    });
  }

  if (['deal', 'task', 'ticket'].includes(contentType)) {
    const stageIds = await generateConditionStageIds({
      boardId: segment.boardId,
      pipelineId: segment.pipelineId,
      options
    });

    if (stageIds.length > 0) {
      propertiesPositive.push({ terms: { stageId: stageIds } });
    }
  }

  const propertyConditions: ICondition[] = [];
  const eventConditions: ICondition[] = [];

  const conditions = segment.conditions || [];

  for (const condition of conditions) {
    if (condition.type === 'property') {
      if (condition.propertyType !== 'form_submission') {
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
        subSegment = await Segments.getSegment(condition.subSegmentId);
      }

      selectorPositiveList.push({ bool: {} });

      await generateQueryBySegment({
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

      if (isCardTyped(condition.propertyType)) {
        const stageIds = await generateConditionStageIds({
          boardId: condition.boardId,
          pipelineId: condition.pipelineId
        });

        if (stageIds.length > 0) {
          positiveQuery = {
            bool: {
              must: [
                positiveQuery,
                {
                  terms: {
                    stageId: stageIds
                  }
                }
              ]
            }
          };
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
        const ids = await associationPropertyFilter({
          mainType: contentType,
          propertyType: condition.propertyType,
          positiveQuery,
          negativeQuery
        });

        propertiesPositive.push({
          terms: {
            _id: ids
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
  query: any
) => {
  const fieldKey = field.replace(`${kind}.`, '');

  let fieldValue = 'value';

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

  const fixedValue = (value || '').includes('now')
    ? value
    : value.toLocaleLowerCase();

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
  if (operator === 'is') {
    positiveQuery = {
      exists: {
        field
      }
    };
  }

  // is not set
  if (operator === 'ins') {
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
          positiveQuery
        );
      }

      if (negativeQuery) {
        negativeQuery = generateNestedQuery(
          nestedType,
          field,
          operator,
          negativeQuery
        );
      }
    }
  }

  return [positiveQuery, negativeQuery];
}

export const getIndexByContentType = (contentType: string) => {
  let index = 'customers';

  if (contentType === 'company') {
    index = 'companies';
  }

  if (contentType === 'deal') {
    index = 'deals';
  }

  if (contentType === 'task') {
    index = 'tasks';
  }

  if (contentType === 'ticket') {
    index = 'tickets';
  }

  if (contentType === 'conversation') {
    index = 'conversations';
  }

  if (contentType === 'user') {
    index = 'users';
  }

  return index;
};

const fetchByQuery = async ({
  index,
  positiveQuery,
  negativeQuery,
  _source = '_id'
}: {
  index: string;
  _source?: string;
  positiveQuery: any;
  negativeQuery: any;
}) => {
  const response = await fetchElk({
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

  return response.hits.hits.map(hit =>
    _source === '_id' ? hit._id : hit._source[_source]
  );
};

const associationPropertyFilter = async ({
  mainType,
  propertyType,
  positiveQuery,
  negativeQuery
}: {
  mainType: string;
  propertyType: string;
  positiveQuery: any;
  negativeQuery: any;
}) => {
  let associatedTypes: string[] = [];

  if (['customer', 'lead'].includes(mainType)) {
    associatedTypes = ['company', 'deal', 'ticket', 'task'];
  }

  if (mainType === 'company') {
    associatedTypes = ['customer', 'deal', 'ticket', 'task'];
  }

  if (mainType === 'deal') {
    associatedTypes = ['customer', 'company', 'ticket', 'task'];
  }

  if (mainType === 'task') {
    associatedTypes = ['customer', 'company', 'ticket', 'deal'];
  }

  if (mainType === 'ticket') {
    associatedTypes = ['customer', 'company', 'deal', 'task'];
  }

  if (associatedTypes.includes(propertyType)) {
    const mainTypeIds = await fetchByQuery({
      index: getIndexByContentType(propertyType),
      positiveQuery,
      negativeQuery
    });

    return Conformities.filterConformity({
      mainType: propertyType,
      mainTypeIds,
      relType: mainType === 'lead' ? 'customer' : mainType
    });
  }

  if (propertyType === 'form_submission') {
    return fetchByQuery({
      index: 'form_submissions',
      _source: 'customerId',
      positiveQuery,
      negativeQuery
    });
  }
};

const generateConditionStageIds = async ({
  boardId,
  pipelineId,
  options
}: {
  boardId?: string;
  pipelineId?: string;
  options?: IOptions;
}) => {
  let pipelineIds: string[] = [];

  if (options && options.pipelineId) {
    pipelineIds = [options.pipelineId];
  }

  if (boardId && (!options || !options.pipelineId)) {
    const board = await Boards.getBoard(boardId);

    const pipelines = await Pipelines.find(
      {
        _id: {
          $in: pipelineId ? [pipelineId] : board.pipelines || []
        }
      },
      { _id: 1 }
    );

    pipelineIds = pipelines.map(p => p._id);
  }

  const stages = await Stages.find({ pipelineId: pipelineIds }, { _id: 1 });

  return stages.map(s => s._id);
};

const isCardTyped = (type: string) => ['deal', 'task', 'ticket'].includes(type);
