import { IModels } from '../../connectionResolver';
import {
  CALLPRO_DIMENSION,
  CALLPRO_ENDED_BY,
  CALLPRO_MEASURE,
  CALLPRO_STATE_LABELS,
  CALLPRO_TYPE,
  CALLPRO_STATUS,
  CUSTOM_DATE_FREQUENCY_TYPES,
  DATERANGE_TYPES,
} from '../constants';
import { buildData, buildMatchFilter, buildPipeline, formatFrequency } from '../utils';

const FILTER_TYPES = {
  dimension: {
    fieldName: 'dimension',
    fieldType: 'select',
    multi: true,
    fieldOptions: CALLPRO_DIMENSION,
    fieldDefaultValue: ['teamMember'],
    fieldLabel: 'Select dimension',
  },
  measure: {
    fieldName: 'measure',
    fieldType: 'select',
    multi: true,
    fieldOptions: CALLPRO_MEASURE,
    fieldDefaultValue: ['count'],
    fieldLabel: 'Select measure',
  },
  userIds: {
    fieldName: 'userIds',
    fieldType: 'select',
    multi: true,
    fieldQuery: 'users',
    fieldLabel: 'Select users',
  },
  type: {
    fieldName: 'type',
    fieldType: 'select',
    multi: false,
    fieldOptions: CALLPRO_TYPE,
    fieldLabel: 'Select call type',
  },
  status: {
    fieldName: 'status',
    fieldType: 'select',
    multi: false,
    fieldOptions: CALLPRO_STATUS,
    fieldLabel: 'Select call status',
  },
  endedBy: {
    fieldName: 'endedBy',
    fieldType: 'select',
    multi: false,
    fieldOptions: CALLPRO_ENDED_BY,
    fieldLabel: 'Select ended by',
  },
  dateRange: {
    fieldName: 'dateRange',
    fieldType: 'select',
    multi: false,
    fieldQuery: 'date',
    fieldOptions: DATERANGE_TYPES,
    fieldLabel: 'Select date range',
    fieldDefaultValue: 'all',
  },
  frequencyType: {
    fieldName: 'frequencyType',
    fieldType: 'select',
    multi: false,
    logics: [
      {
        logicFieldName: 'dimension',
        logicFieldVariable: 'frequency',
      },
    ],
    fieldOptions: CUSTOM_DATE_FREQUENCY_TYPES,
    fieldLabel: 'Select frequency type',
    fieldDefaultValue: '%m',
  },
  frequencyTypeSimple: {
    fieldName: 'frequencyType',
    fieldType: 'select',
    multi: false,
    fieldOptions: CUSTOM_DATE_FREQUENCY_TYPES,
    fieldLabel: 'Select frequency type',
    fieldDefaultValue: '%m',
  },
};

const chartTemplates = [
  {
    templateType: 'callProCount',
    serviceType: 'callPro',
    name: 'Call-Pro Count',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
    getChartResult: async (
      models: IModels,
      filter: any,
      chartType: string,
      _subdomain: string,
    ) => {
      const { dimension, measure, frequencyType = '%m' } = filter;

      const matchFilter = buildMatchFilter(filter);
      const pipeline = buildPipeline(filter, matchFilter);

      const results = await models.CallProConversations.aggregate(pipeline);

      return {
        title: 'Call-Pro Count',
        ...buildData({ chartType, data: results, measure, dimension, frequencyType }),
      };
    },
    filterTypes: [
      FILTER_TYPES.dimension,
      FILTER_TYPES.measure,
      FILTER_TYPES.userIds,
      FILTER_TYPES.type,
      FILTER_TYPES.status,
      FILTER_TYPES.endedBy,
      FILTER_TYPES.dateRange,
      FILTER_TYPES.frequencyType,
    ],
  },
  {
    templateType: 'callProCountByRep',
    serviceType: 'callPro',
    name: 'Call-Pro Count by Rep',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
    getChartResult: async (
      models: IModels,
      filter: any,
      _chartType: string,
      _subdomain: string,
    ) => {
      const matchFilter = buildMatchFilter(filter);

      const pipeline = [
        { $match: { createdBy: { $ne: null }, ...matchFilter } },
        {
          $group: {
            _id: { operatorId: '$createdBy' },
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'users',
            let: { fieldId: '$_id.operatorId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$fieldId'] } } },
            ],
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $project: { _id: 0, user: '$user', count: 1 } },
      ];

      const results = await models.CallProConversations.aggregate(pipeline);

      const countByRep = (results || []).reduce((acc: Record<string, number>, { user, count }) => {
        acc[user?.details?.fullName || user?.details?.firstName || user?.email] = count;
        return acc;
      }, {});

      return {
        title: 'Call-Pro Count By Rep',
        data: Object.values(countByRep),
        labels: Object.keys(countByRep),
      };
    },
    filterTypes: [
      FILTER_TYPES.userIds,
      FILTER_TYPES.type,
      FILTER_TYPES.status,
      FILTER_TYPES.endedBy,
      FILTER_TYPES.dateRange,
    ],
  },
  {
    templateType: 'callProCountByType',
    serviceType: 'callPro',
    name: 'Call-Pro Count by Type',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
    getChartResult: async (
      models: IModels,
      filter: any,
      _chartType: string,
      _subdomain: string,
    ) => {
      const matchFilter = buildMatchFilter(filter);

      const pipeline = [
        { $match: { callType: { $in: ['INCOMING', 'OUTGOING'] }, ...matchFilter } },
        {
          $group: {
            _id: { type: '$callType' },
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, type: '$_id.type', count: 1 } },
      ];

      const results = await models.CallProConversations.aggregate(pipeline);

      const countByType = (results || []).reduce((acc: Record<string, number>, { type, count }) => {
        acc[CALLPRO_STATE_LABELS[type] || type] = count;
        return acc;
      }, {});

      return {
        title: 'Call-Pro Count By Type',
        data: Object.values(countByType),
        labels: Object.keys(countByType),
      };
    },
    filterTypes: [
      FILTER_TYPES.userIds,
      FILTER_TYPES.type,
      FILTER_TYPES.status,
      FILTER_TYPES.endedBy,
      FILTER_TYPES.dateRange,
    ],
  },
  {
    templateType: 'callProCountByQueue',
    serviceType: 'callPro',
    name: 'Call-Pro Count by Queue',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
    getChartResult: async (
      models: IModels,
      filter: any,
      _chartType: string,
      _subdomain: string,
    ) => {
      const matchFilter = buildMatchFilter(filter);

      const pipeline = [
        { $match: { queueName: { $ne: null }, ...matchFilter } },
        {
          $group: {
            _id: { queue: '$queueName' },
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, queue: '$_id.queue', count: 1 } },
      ];

      const results = await models.CallProConversations.aggregate(pipeline);

      const countByQueue = (results || []).reduce((acc: Record<string, number>, { queue, count }) => {
        acc[queue] = count;
        return acc;
      }, {});

      return {
        title: 'Call-Pro Count By Queue',
        data: Object.values(countByQueue),
        labels: Object.keys(countByQueue),
      };
    },
    filterTypes: [
      FILTER_TYPES.userIds,
      FILTER_TYPES.type,
      FILTER_TYPES.status,
      FILTER_TYPES.endedBy,
      FILTER_TYPES.dateRange,
    ],
  },
  {
    templateType: 'callProCountByEndedBy',
    serviceType: 'callPro',
    name: 'Call-Pro Count Ended By',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
    getChartResult: async (
      models: IModels,
      filter: any,
      _chartType: string,
      _subdomain: string,
    ) => {
      const matchFilter = buildMatchFilter(filter);

      const pipeline = [
        { $match: { endedBy: { $ne: null }, ...matchFilter } },
        {
          $group: {
            _id: { endedBy: '$endedBy' },
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, endedBy: '$_id.endedBy', count: 1 } },
      ];

      const results = await models.CallProConversations.aggregate(pipeline);

      const endedByLabels: Record<string, string> = { remote: 'Customer', local: 'Operator' };

      const countByEndedBy = (results || []).reduce((acc: Record<string, number>, { endedBy, count }) => {
        acc[endedByLabels[endedBy] || endedBy] = count;
        return acc;
      }, {});

      return {
        title: 'Call-Pro Count Ended By',
        data: Object.values(countByEndedBy),
        labels: Object.keys(countByEndedBy),
      };
    },
    filterTypes: [
      FILTER_TYPES.userIds,
      FILTER_TYPES.type,
      FILTER_TYPES.status,
      FILTER_TYPES.endedBy,
      FILTER_TYPES.dateRange,
    ],
  },
  {
    templateType: 'callProCountByStatus',
    serviceType: 'callPro',
    name: 'Call-Pro Count By Status',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
    getChartResult: async (
      models: IModels,
      filter: any,
      _chartType: string,
      _subdomain: string,
    ) => {
      const matchFilter = buildMatchFilter(filter);

      const pipeline = [
        { $match: { callStatus: { $in: ['ANSWERED', 'NO Anwer'] }, ...matchFilter } },
        {
          $group: {
            _id: { status: '$callStatus' },
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, status: '$_id.status', count: 1 } },
      ];

      const results = await models.CallProConversations.aggregate(pipeline);

      const countByStatus = (results || []).reduce((acc: Record<string, number>, { status, count }) => {
        acc[CALLPRO_STATE_LABELS[status] || status] = count;
        return acc;
      }, {});

      return {
        title: 'Call-Pro Count By Status',
        data: Object.values(countByStatus),
        labels: Object.keys(countByStatus),
      };
    },
    filterTypes: [
      FILTER_TYPES.userIds,
      FILTER_TYPES.type,
      FILTER_TYPES.status,
      FILTER_TYPES.endedBy,
      FILTER_TYPES.dateRange,
    ],
  },
  {
    templateType: 'callProCountByFrequency',
    serviceType: 'callPro',
    name: 'Call-Pro Count By Frequency',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'table'],
    getChartResult: async (
      models: IModels,
      filter: any,
      _chartType: string,
      _subdomain: string,
    ) => {
      const { frequencyType = '%m' } = filter;
      const matchFilter = buildMatchFilter(filter);

      const pipeline: any[] = [
        { $match: matchFilter },
        {
          $group: {
            _id: {
              frequency: {
                $dateToString: {
                  format: frequencyType,
                  date: { $toDate: '$_id' },
                },
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.frequency': 1 } },
        { $project: { _id: 0, frequency: '$_id.frequency', count: 1 } },
      ];

      const results = await models.CallProConversations.aggregate(pipeline);

      const countByFrequency = (results || []).reduce((acc: Record<string, number>, { frequency, count }) => {
        acc[formatFrequency(frequencyType, frequency)] = count;
        return acc;
      }, {});

      return {
        title: 'Call-Pro Count By Frequency',
        data: Object.values(countByFrequency),
        labels: Object.keys(countByFrequency),
      };
    },
    filterTypes: [
      FILTER_TYPES.userIds,
      FILTER_TYPES.type,
      FILTER_TYPES.status,
      FILTER_TYPES.endedBy,
      FILTER_TYPES.dateRange,
      FILTER_TYPES.frequencyTypeSimple,
    ],
  },
];

export default chartTemplates;
