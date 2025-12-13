import { SegmentConfigs } from 'erxes-api-shared/core-modules';
import {
  fetchByQueryWithScroll,
  getEsIndexByContentType,
} from 'erxes-api-shared/utils';
import * as _ from 'underscore';
import { goalsSegmentConfigs } from './goalsSegmentConfigs';

export const goalsSegments = {
  contentTypes: goalsSegmentConfigs.contentTypes,

  associationFilter: async ({ data }, { subdomain }) => {
  const { mainType, propertyType, positiveQuery, negativeQuery } = data;

  let ids: string[] = [];

  if (mainType.includes('sales:goal')) {
    ids = await fetchByQueryWithScroll({
      subdomain,
      index: 'goals',
      _source: '_id',
      positiveQuery,
      negativeQuery,
    });
  }

  if (mainType.includes('sales:goal_progress')) {
    ids = await fetchByQueryWithScroll({
      subdomain,
      index: 'goal_progresses',
      _source: '_id',
      positiveQuery,
      negativeQuery,
    });
  }

  if (propertyType.includes('sales:goal')) {
    const goalIds = await fetchByQueryWithScroll({
      subdomain,
      index: await getEsIndexByContentType(propertyType),
      positiveQuery,
      negativeQuery,
    });

    if (mainType.includes('sales:deal')) {
      ids = await fetchByQueryWithScroll({
        subdomain,
        index: 'deals',
        _source: '_id',
        positiveQuery: {
          terms: {
            goalIds,
          },
        },
        negativeQuery: undefined,
      });
    }
  }

  if (
    propertyType.includes('core:contact') ||
    propertyType.includes('core:company')
  ) {
    const entityIds = await fetchByQueryWithScroll({
      subdomain,
      index: await getEsIndexByContentType(propertyType),
      positiveQuery,
      negativeQuery,
    });

    ids = await fetchByQueryWithScroll({
      subdomain,
      index: 'goals',
      _source: '_id',
      positiveQuery: {
        terms: {
          contribution: entityIds,
        },
      },
      negativeQuery: undefined,
    });
  }

  return {
    data: _.uniq(ids),
    status: 'success',
  };
},


  esTypesMap: async (_data, _context) => {
 
    return {
      data: {
        typesMap: {
          properties: {
            name: { type: 'text' },
            entity: { type: 'keyword' },
            contributionType: { type: 'keyword' },
            metric: { type: 'keyword' },
            periodGoal: { type: 'keyword' },
            teamGoalType: { type: 'keyword' },
            stageId: { type: 'keyword' },
            pipelineId: { type: 'keyword' },
            boardId: { type: 'keyword' },
            startDate: { type: 'date' },
            endDate: { type: 'date' },
            createdAt: { type: 'date' },
            contribution: { type: 'keyword' },
            department: { type: 'keyword' },
            unit: { type: 'keyword' },
            branch: { type: 'keyword' },
            segmentIds: { type: 'keyword' },
            productIds: { type: 'keyword' },
            companyIds: { type: 'keyword' },
            tagsIds: { type: 'keyword' },
            segmentCount: { type: 'integer' },
            current: { type: 'float' },
            progress: { type: 'float' },
            target: { type: 'float' },
          }
        }
      },
      status: 'success'
    };
  },

  segmentFilter: async ({ data, subdomain, models }) => {
    const { contentTypeId, conditions } = data;
    let filteredIds: string[] = [];

    if (contentTypeId === 'sales:goal') {

      const mongoQuery: any = {};
      
      conditions.forEach(condition => {
        const { field, operator, value } = condition;
        
        switch (operator) {
          case 'equals':
            mongoQuery[field] = value;
            break;
          case 'contains':
            mongoQuery[field] = { $regex: value, $options: 'i' };
            break;
          case 'greaterThan':
            mongoQuery[field] = { $gt: value };
            break;
          case 'lessThan':
            mongoQuery[field] = { $lt: value };
            break;
          case 'in':
            mongoQuery[field] = { $in: Array.isArray(value) ? value : [value] };
            break;
          default:
            break;
        }
      });

      const goals = await models.Goals.find(mongoQuery).select('_id').lean();
      filteredIds = goals.map(goal => goal._id);
    }

    return { data: filteredIds, status: 'success' };
  },
} as SegmentConfigs;