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
  returnSelector?: boolean;
  returnCount?: boolean;
  defaultMustSelector?: any[];
  pipelineId?: string;
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
  if (!segment || !segment.conditions) {
    return [];
  }

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
      }
    });

    return countResponse.count;
  }

  const response = await fetchElk({
    action: 'search',
    index,
    body: {
      _source: options.returnFields || false,
      query: selector
    },
    defaultValue: { hits: { hits: [] } }
  });

  if (options.returnFields) {
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
  const typesMap = getEsTypes(contentType);

  const must =
    isInitialCall && options.defaultMustSelector
      ? options.defaultMustSelector.map(s => ({ ...s }))
      : [];

  if (segment.conditionsConjunction === 'and') {
    selector.must = must;
    selector.must_not = [];
  } else {
    selector.should = [
      {
        bool: {
          must: []
        }
      },
      {
        bool: {
          must_not: []
        }
      }
    ];
  }

  const selectorPositiveList = selector.must || selector.should[0].bool.must;
  const selectorNegativeList =
    selector.must_not || selector.should[1].bool.must_not;

  const embeddedParentSegment = await Segments.findOne({ _id: segment.subOf });
  const parentSegment = embeddedParentSegment;

  if (parentSegment && (!segment._id || segment._id !== parentSegment._id)) {
    await generateQueryBySegment({
      ...args,
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
    let pipelineIds: string[] = [];

    if (options && options.pipelineId) {
      pipelineIds = [options.pipelineId];
    }

    if (segment.boardId) {
      const board = await Boards.getBoard(segment.boardId);

      const pipelines = await Pipelines.find(
        {
          _id: {
            $in: segment.pipelineId
              ? [segment.pipelineId]
              : board.pipelines || []
          }
        },
        { _id: 1 }
      );

      pipelineIds = pipelines.map(p => p._id);
    }

    const stages = await Stages.find({ pipelineId: pipelineIds }, { _id: 1 });

    if (stages.length > 0) {
      propertiesPositive.push({
        terms: {
          stageId: stages.map(s => s._id)
        }
      });
    }
  }

  const propertyConditions: ICondition[] = [];
  const eventConditions: ICondition[] = [];

  for (const condition of segment.conditions) {
    if (condition.type === 'property') {
      propertyConditions.push(condition);
    }

    if (condition.type === 'event') {
      eventConditions.push(condition);
    }

    if (condition.type === 'subSegment' && condition.subSegmentId) {
      const subSegment = await Segments.getSegment(condition.subSegmentId);

      selectorPositiveList.push({ bool: {} });

      await generateQueryBySegment({
        ...args,
        segment: subSegment,
        selector: selectorPositiveList[selectorPositiveList.length - 1].bool,
        isInitialCall: false
      });
    }
  }

  for (const condition of propertyConditions) {
    const field = condition.propertyName;

    if (field) {
      const [positiveQuery, negativeQuery] = elkConvertConditionToQuery({
        field,
        type: typesMap[field],
        operator: condition.propertyOperator || '',
        value: condition.propertyValue || ''
      });

      if (positiveQuery) {
        propertiesPositive.push(positiveQuery);
      }

      if (negativeQuery) {
        propertiesNegative.push(negativeQuery);
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

    if (!eventOccurence || !eventOccurenceValue) {
      continue;
    }

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

    let idsByEvents = [];

    if (eventPositive.length > 0 || eventNegative.length > 0) {
      const idField =
        segment.contentType === 'company' ? 'companyId' : 'customerId';

      const eventsResponse = await fetchElk({
        action: 'search',
        index: 'events',
        body: {
          _source: idField,
          query: {
            bool: {
              must: eventPositive,
              must_not: eventNegative
            }
          }
        },
        defaultValue: { hits: { hits: [] } }
      });

      idsByEvents = eventsResponse.hits.hits
        .map(hit => hit._source[idField])
        .filter(_id => _id);

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

const generateNestedQuery = (
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

function elkConvertConditionToQuery(args: {
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

const getIndexByContentType = (contentType: string) => {
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

  return index;
};
