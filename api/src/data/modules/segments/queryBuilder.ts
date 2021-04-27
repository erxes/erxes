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

export const fetchBySegments = async (
  segment: ISegment,
  action: 'search' | 'count' = 'search',
  options?
): Promise<any> => {
  if (!segment || !segment.conditions) {
    return [];
  }

  const { contentType } = segment;

  let index = getIndexByContentType(contentType);
  const typesMap = getEsTypes(contentType);

  let propertyPositive: any[] = [];
  let propertyNegative: any[] = [];

  if (['customer', 'lead', 'visitor'].includes(contentType)) {
    propertyNegative.push({
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
      propertyPositive.push({
        terms: {
          stageId: stages.map(s => s._id)
        }
      });
    }
  }

  const eventPositive = [];
  const eventNegative = [];

  await generateQueryBySegment({
    segment,
    typesMap,
    propertyPositive,
    propertyNegative,
    eventNegative,
    eventPositive
  });

  let idsByEvents = [];

  if (eventPositive.length > 0 || eventNegative.length > 0) {
    const idField = contentType === 'company' ? 'companyId' : 'customerId';

    const eventsResponse = await fetchElk(
      'search',
      'events',
      {
        _source: idField,
        query: {
          bool: {
            must: eventPositive,
            must_not: eventNegative
          }
        }
      },
      '',
      { hits: { hits: [] } }
    );

    idsByEvents = eventsResponse.hits.hits
      .map(hit => hit._source[idField])
      .filter(_id => _id);

    propertyPositive.push({
      terms: {
        _id: idsByEvents
      }
    });
  }

  if (
    ['company', 'deal', 'task', 'ticket'].includes(contentType) &&
    options &&
    options.associatedCustomers
  ) {
    index = 'customers';

    const itemsResponse = await fetchElk(
      'search',
      getIndexByContentType(segment.contentType),
      {
        query: {
          bool: {
            must: propertyPositive,
            must_not: propertyNegative
          }
        },
        _source: '_id'
      },
      '',
      { hits: { hits: [] } }
    );

    const items = itemsResponse.hits.hits;

    const itemIds = items.map(i => i._id);

    const customerIds = await Conformities.filterConformity({
      mainType: segment.contentType,
      mainTypeIds: itemIds,
      relType: 'customer'
    });

    propertyPositive = [
      {
        terms: {
          _id: customerIds
        }
      }
    ];

    propertyNegative = [];
  }

  if (action === 'count') {
    return {
      positiveList: propertyPositive,
      negativeList: propertyNegative
    };
  }

  const response = await fetchElk('search', index, {
    _source: false,
    query: {
      bool: {
        must: propertyPositive,
        must_not: propertyNegative
      }
    }
  });

  const idsByContentType = response.hits.hits.map(hit => hit._id);

  let ids = idsByContentType.length ? idsByContentType : idsByEvents;

  if (idsByContentType.length > 0 && idsByEvents.length > 0) {
    ids = _.intersection(idsByContentType, idsByEvents);
  }

  return ids;
};

const generateQueryBySegment = async (args: {
  propertyPositive;
  propertyNegative;
  eventPositive;
  eventNegative;
  segment: ISegment;
  typesMap: { [key: string]: any };
}) => {
  const {
    segment,
    typesMap,
    propertyNegative,
    propertyPositive,
    eventNegative,
    eventPositive
  } = args;

  // Fetching parent segment
  const embeddedParentSegment = await Segments.findOne({ _id: segment.subOf });
  const parentSegment = embeddedParentSegment;

  if (parentSegment && segment.subOf !== parentSegment._id) {
    await generateQueryBySegment({ ...args, segment: parentSegment });
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
  }

  for (const condition of propertyConditions) {
    const field = condition.propertyName || '';

    elkConvertConditionToQuery({
      field,
      type: typesMap[field],
      operator: condition.propertyOperator || '',
      value: condition.propertyValue || '',
      positive: propertyPositive,
      negative: propertyNegative
    });
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
      elkConvertConditionToQuery({
        field: `attributes.${filter.name}`,
        operator: filter.operator,
        value: filter.value,
        positive: eventPositive,
        negative: eventNegative
      });
    }
  }
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
  positive;
  negative;
}) {
  const { field, type, operator, value, positive, negative } = args;

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

  if (positiveQuery) {
    positive.push(positiveQuery);
  }

  if (negativeQuery) {
    negative.push(negativeQuery);
  }
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

export const fetchSegment = async (action, segment: ISegment, options?) => {
  const { contentType } = segment;

  let response = await fetchBySegments(segment, action, options);

  if (action === 'search') {
    return response;
  }

  try {
    const { positiveList, negativeList } = await response;

    response = await fetchElk('count', getIndexByContentType(contentType), {
      query: {
        bool: {
          must: positiveList,
          must_not: negativeList
        }
      }
    });

    return response.count;
  } catch (e) {
    return 0;
  }
};
