import { sendCardsMessage, sendCoreMessage, sendLogsMessage } from '../../messageBroker';
import { buildMatchFilter, getDetails, generateGroupIds, getStageIds } from '../utils';
import {
  ACTION_PIPELINES,
  ACTION_PIPELINE_TYPE,
  DATE_RANGE_TYPES,
  DEVIATION_PIPELINES,
  DEVIATION_PIPELINE_TYPE,
  MONTH_NAMES,
} from '../constants';
import { IModels } from '../../connectionResolver';

const chartTemplates = [
  {
    templateType: 'deviationByClosedStages',
    serviceType: 'deviation',
    name: 'Deviation by closed stages',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const matchfilter = await buildMatchFilter(
        filter,
        subdomain,
        DEVIATION_PIPELINE_TYPE,
        true
      );

      const stageIds = await getStageIds(subdomain, DEVIATION_PIPELINE_TYPE, true);

      const tickets = await sendCardsMessage({
        subdomain,
        action: 'tickets.find',
        data: {
          stageId: { $in: stageIds },
          ...matchfilter
        },
        isRPC: true,
        defaultValue: null,
      });

      const getTotalUsers = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: {
            isActive: true,
            "customFieldsData.field": "L0lMXRfJLLoTMwcbcOnwc",
            "customFieldsData.value": "yes"
          }
        },
        isRPC: true,
        defaultValue: [],
      });

      const operatorIds = getTotalUsers.map(user => user._id)

      const countByStage = {};
      const countByOperator = {};

      (tickets || []).forEach(({ stageId, assignedUserIds }) => {
        const operatorCount = assignedUserIds.filter(userId => operatorIds.includes(userId)).length;

        countByStage[stageId] = (countByStage[stageId] || 0) + 1;
        countByOperator[stageId] = (countByOperator[stageId] || 0) + operatorCount;
      });

      const stagesMap = await getDetails({
        subdomain,
        params: { getStageIds: Object.keys(countByStage) },
      });

      const data = Object.entries(countByStage).map(([stageId, count]) => ({
        pipeline: stagesMap[stageId].pipelineId,
        stage: stagesMap[stageId].title,
        count,
        operators: countByOperator[stageId] || 0,
      }));

      return data

    },
    filterTypes: [
      {
        fieldName: 'branchIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'branches',
        fieldLabel: 'Select branches',
      },
      {
        fieldName: 'createdUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select created users',
      },
      {
        fieldName: 'closedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select closed users',
      },
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'pipelineIds',
        fieldType: 'select',
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${DEVIATION_PIPELINE_TYPE}"}`,
        multi: true,
        isAll: true,
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'pipelineLabelIds',
        fieldType: 'select',
        fieldQuery: 'pipelineLabels',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'Select label',
      },
      {
        fieldName: 'assetIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'assets',
        fieldLabel: 'Select Assets',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
      },
    ]
  },
  {
    templateType: 'deviationByDefaultBranch',
    serviceType: 'deviation',
    name: 'Deviation by default branch',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { branchIds } = filter;

      const matchfilter = await buildMatchFilter(
        filter,
        subdomain,
        DEVIATION_PIPELINE_TYPE,
      );

      const groupIds = await generateGroupIds(branchIds, 'branch', subdomain)
      const stageIds = await getStageIds(subdomain, DEVIATION_PIPELINE_TYPE);

      const tickets = await sendCardsMessage({
        subdomain,
        action: 'tickets.find',
        data: {
          stageId: { $in: stageIds },
          ...matchfilter,
        },
        isRPC: true,
        defaultValue: null,
      });

      let ticketCountByBranch = {}

      ticketCountByBranch = (tickets || []).reduce((acc, ticket) => {
        let ticketBranchIds = ticket.branchIds || [];

        ticketBranchIds.forEach((branchId) => {
          acc[branchId] = (acc[branchId] || 0) + 1;
        });

        return acc;
      }, {});

      if (groupIds.length > 0) {
        ticketCountByBranch = (groupIds || []).reduce((totalCount, obj) => {
          Object.entries(obj).forEach(([key, value]) => {
            totalCount[key] = value.reduce((total, id) => total + (ticketCountByBranch[id] || 0), totalCount[key] || 0);
          });
          return totalCount;
        }, {});
      }

      const getBranchTickets = Object.values(ticketCountByBranch);
      const getBranchIds = Object.keys(ticketCountByBranch);

      const branchesMap = await getDetails({
        subdomain,
        params: { getBranchIds },
      });

      const data = getBranchTickets;
      const labels = getBranchIds.map(
        (branchId) => branchesMap[branchId]?.title,
      );

      const title = 'Deviation by default branch';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'branchIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'branches',
        fieldLabel: 'Select branches',
      },
      {
        fieldName: 'createdUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select created users',
      },
      {
        fieldName: 'closedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select closed users',
      },
      {
        fieldName: 'pipelineIds',
        fieldType: 'select',
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${DEVIATION_PIPELINE_TYPE}"}`,
        multi: true,
        isAll: true,
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageIds',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',

        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'pipelineLabelIds',
        fieldType: 'select',
        fieldQuery: 'pipelineLabels',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'Select label',
      },
      {
        fieldName: 'assetIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'assets',
        fieldLabel: 'Select Assets',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
      },
    ],
  },

  {
    templateType: 'totalDeviation',
    serviceType: 'deviation',
    name: 'Total Deviation',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineIds } = filter;

      const matchfilter = await buildMatchFilter(
        { ...filter, pipelineIds: [] },
        subdomain,
        DEVIATION_PIPELINE_TYPE,
      );

      const board = await sendCardsMessage({
        subdomain,
        action: 'boards.findOne',
        data: {
          type: DEVIATION_PIPELINE_TYPE,
          name: 'Deviation',
        },
        isRPC: true,
        defaultValue: {},
      });

      let queryData: any = {
        type: DEVIATION_PIPELINE_TYPE,
        boardId: board?._id,
        name: { $in: DEVIATION_PIPELINES },
      };

      if (pipelineIds) {
        queryData._id = { $in: pipelineIds };
      }

      const pipelines = await sendCardsMessage({
        subdomain,
        action: 'pipelines.find',
        data: queryData,
        isRPC: true,
        defaultValue: [],
      });

      const ticketCountByPipeline = await (pipelines || []).reduce(
        async (accPromise, pipeline) => {
          const acc = await accPromise;
          const stages = await sendCardsMessage({
            subdomain,
            action: 'stages.find',
            data: {
              type: DEVIATION_PIPELINE_TYPE,
              pipelineId: pipeline._id,
            },
            isRPC: true,
            defaultValue: [],
          });

          const stageIds = stages.map((stage) => stage._id);

          const tickets = await sendCardsMessage({
            subdomain,
            action: 'tickets.find',
            data: {
              stageId: { $in: stageIds },
              status: "active",
              ...matchfilter,
            },
            isRPC: true,
            defaultValue: [],
          });

          if (tickets && tickets.length) {
            acc[pipeline.name] = tickets.length;
          }
          return acc;
        },
        {},
      );

      const getTotalTickets = Object.values(ticketCountByPipeline);
      const getTotalIds = Object.keys(ticketCountByPipeline);

      const data = getTotalTickets;
      const labels = getTotalIds;

      const title = 'Total deviation';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'branchIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'branches',
        fieldLabel: 'Select branches',
      },
      {
        fieldName: 'createdUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select created users',
      },
      {
        fieldName: 'closedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select closed users',
      },
      {
        fieldName: 'pipelineIds',
        fieldType: 'select',
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${DEVIATION_PIPELINE_TYPE}"}`,
        multi: true,
        isAll: true,
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageIds',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'pipelineLabelIds',
        fieldType: 'select',
        fieldQuery: 'pipelineLabels',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'select label',
      },
      {
        fieldName: 'assetIds',
        fieldType: 'select',
        fieldQuery: 'assets',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        multi: true,
        fieldLabel: 'Select Assets',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
      },
    ],
  },
  {
    templateType: 'deviationByDefaultDepartment',
    serviceType: 'deviation',
    name: 'Deviation by default department',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { departmentIds } = filter;

      const matchfilter = await buildMatchFilter(
        filter,
        subdomain,
        DEVIATION_PIPELINE_TYPE,
      );

      const groupIds = await generateGroupIds(departmentIds, 'department', subdomain)
      const stageIds = await getStageIds(subdomain, DEVIATION_PIPELINE_TYPE);

      const tickets = await sendCardsMessage({
        subdomain,
        action: 'tickets.find',
        data: {
          stageId: { $in: stageIds },
          ...matchfilter,
        },
        isRPC: true,
        defaultValue: null,
      });

      let ticketCountByDepartment = {}

      ticketCountByDepartment = (tickets || []).reduce((acc, ticket) => {
        let ticketDepartmentIds = ticket.departmentIds || [];

        ticketDepartmentIds.forEach((departmentId) => {
          acc[departmentId] = (acc[departmentId] || 0) + 1;
        });

        return acc;
      }, {});

      if (groupIds.length > 0) {
        ticketCountByDepartment = (groupIds || []).reduce((totalCount, obj) => {
          Object.entries(obj).forEach(([key, value]) => {
            totalCount[key] = value.reduce((total, id) => total + (ticketCountByDepartment[id] || 0), totalCount[key] || 0);
          });
          return totalCount;
        }, {});
      }

      const getDepartmentTickets = Object.values(ticketCountByDepartment);
      const getDepartmentIds = Object.keys(ticketCountByDepartment);

      const departmentsMap = await getDetails({
        subdomain,
        params: { getDepartmentIds },
      });

      const data = getDepartmentTickets;
      const labels = getDepartmentIds.map(
        (departmentId) => departmentsMap[departmentId]?.title,
      );

      const title = 'Deviation by default department';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'departmentIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'departments',
        fieldLabel: 'Select departments',
      },
      {
        fieldName: 'createdUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select created users',
      },
      {
        fieldName: 'closedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select closed users',
      },

      {
        fieldName: 'pipelineIds',
        fieldType: 'select',
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${DEVIATION_PIPELINE_TYPE}"}`,
        multi: true,
        isAll: true,
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageIds',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'pipelineLabelIds',
        fieldType: 'select',
        fieldQuery: 'pipelineLabels',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'select label',
      },
      {
        fieldName: 'assetIds',
        fieldType: 'select',
        fieldQuery: 'assets',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        multi: true,
        fieldLabel: 'Select Assets',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
      },
    ],
  },
  {
    templateType: 'deviationByEachMonth',
    serviceType: 'deviation',
    name: 'Deviation by each month',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const ticketCountsByMonth = {
        January: 0,
        February: 0,
        March: 0,
        April: 0,
        May: 0,
        June: 0,
        July: 0,
        August: 0,
        September: 0,
        October: 0,
        November: 0,
        December: 0,
      };

      const matchfilter = await buildMatchFilter(
        filter,
        subdomain,
        DEVIATION_PIPELINE_TYPE,
      );

      const stageIds = await getStageIds(subdomain, DEVIATION_PIPELINE_TYPE);

      const tickets = await sendCardsMessage({
        subdomain,
        action: 'tickets.find',
        data: {
          stageId: { $in: stageIds },
          ...matchfilter,
        },
        isRPC: true,
        defaultValue: null,
      });

      (tickets || []).forEach((ticket) => {
        const createdAt = new Date(ticket.createdAt);

        const month = MONTH_NAMES[createdAt.getMonth()];
        ticketCountsByMonth[month]++;
      });

      const data = Object.values(ticketCountsByMonth);
      const labels = Object.keys(ticketCountsByMonth);

      const title = 'Deviation by each month';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'branchIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'branches',
        fieldLabel: 'Select branches',
      },
      {
        fieldName: 'departmentIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'departments',
        fieldLabel: 'Select departments',
      },
      {
        fieldName: 'createdUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select created users',
      },
      {
        fieldName: 'closedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select closed users',
      },

      {
        fieldName: 'pipelineIds',
        fieldType: 'select',
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${DEVIATION_PIPELINE_TYPE}"}`,
        multi: true,
        isAll: true,
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageIds',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'pipelineLabelIds',
        fieldType: 'select',
        fieldQuery: 'pipelineLabels',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'select label',
      },
      {
        fieldName: 'assetIds',
        fieldType: 'select',
        fieldQuery: 'assets',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        multi: true,
        fieldLabel: 'Select Assets',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
      },
    ],
  },
  {
    templateType: 'openedDeviationByUsers',
    serviceType: 'deviation',
    name: 'Opened deviation by users',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const matchfilter = await buildMatchFilter(
        filter,
        subdomain,
        DEVIATION_PIPELINE_TYPE,
      );

      const stageIds = await getStageIds(subdomain, DEVIATION_PIPELINE_TYPE);

      const tickets = await sendCardsMessage({
        subdomain,
        action: 'tickets.find',
        data: {
          stageId: { $in: stageIds },
          ...matchfilter,
        },
        isRPC: true,
        defaultValue: null,
      });

      const ticketCountsByUserId = (tickets || []).reduce((acc, ticket) => {
        const { userId } = ticket;
        acc[userId] = acc[userId] ? acc[userId] + 1 : 1;
        return acc;
      }, {});

      const getUserTickets = Object.values(ticketCountsByUserId);
      const getUserIds = Object.keys(ticketCountsByUserId);

      const usersMap = await getDetails({ subdomain, params: { getUserIds } });

      const data = getUserTickets;
      const labels = getUserIds.map((userId) => usersMap[userId]?.fullName);

      const title = 'Opened deviation by users';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'branchIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'branches',
        fieldLabel: 'Select branches',
      },

      {
        fieldName: 'departmentIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'departments',
        fieldLabel: 'Select departments',
      },
      {
        fieldName: 'createdUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select created users',
      },
      {
        fieldName: 'closedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select closed users',
      },

      {
        fieldName: 'pipelineIds',
        fieldType: 'select',
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${DEVIATION_PIPELINE_TYPE}"}`,
        multi: true,
        isAll: true,
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageIds',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'pipelineLabelIds',
        fieldType: 'select',
        fieldQuery: 'pipelineLabels',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'select label',
      },
      {
        fieldName: 'assetIds',
        fieldType: 'select',
        fieldQuery: 'assets',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        multi: true,
        fieldLabel: 'Select Assets',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
      },
    ],
  },
  {
    templateType: 'deviationByLabels',
    serviceType: 'deviation',
    name: 'Deviation by labels',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineLabelIds } = filter;

      const matchfilter = await buildMatchFilter(
        filter,
        subdomain,
        DEVIATION_PIPELINE_TYPE,
      );
      const stageIds = await getStageIds(subdomain, DEVIATION_PIPELINE_TYPE);

      const tickets = await sendCardsMessage({
        subdomain,
        action: 'tickets.find',
        data: {
          stageId: { $in: stageIds },
          ...matchfilter,
        },
        isRPC: true,
        defaultValue: null,
      });

      const ticketCountsByLabels = (tickets || []).reduce((acc, ticket) => {
        let ticketLabelIds = ticket.labelIds || [];

        if (pipelineLabelIds && pipelineLabelIds.length) {
          ticketLabelIds = ticketLabelIds.filter((id) =>
            pipelineLabelIds.includes(id),
          );
        }

        ticketLabelIds.forEach((labelId) => {
          acc[labelId] = (acc[labelId] || 0) + 1;
        });
        return acc;
      }, {});

      const getLabelTickets = Object.values(ticketCountsByLabels);
      const getLabelIds = Object.keys(ticketCountsByLabels);

      const labelsMap = await getDetails({
        subdomain,
        params: { getLabelIds },
      });

      const data = getLabelTickets;
      const labels = getLabelIds.map((labelId) => labelsMap[labelId]?.title);

      const title = 'Deviation by labels';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'branchIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'branches',
        fieldLabel: 'Select branches',
      },
      {
        fieldName: 'departmentIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'departments',
        fieldLabel: 'Select departments',
      },
      {
        fieldName: 'createdUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select created users',
      },
      {
        fieldName: 'closedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select closed users',
      },

      {
        fieldName: 'pipelineIds',
        fieldType: 'select',
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${DEVIATION_PIPELINE_TYPE}"}`,
        multi: true,
        isAll: true,
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageIds',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'pipelineLabelIds',
        fieldType: 'select',
        fieldQuery: 'pipelineLabels',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'select label',
      },
      {
        fieldName: 'assetIds',
        fieldType: 'select',
        fieldQuery: 'assets',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        multi: true,
        fieldLabel: 'Select Assets',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
      },
    ],
  },
  {
    templateType: 'deviationByAssets',
    serviceType: 'deviation',
    name: 'Deviation by assets',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const matchfilter = await buildMatchFilter(
        filter,
        subdomain,
        DEVIATION_PIPELINE_TYPE,
      );
      const stageIds = await getStageIds(subdomain, DEVIATION_PIPELINE_TYPE);

      const tickets = await sendCardsMessage({
        subdomain,
        action: 'tickets.find',
        data: {
          stageId: { $in: stageIds },
          ...matchfilter,
        },
        isRPC: true,
        defaultValue: null,
      });

      const assetsMap = {};
      const ticketCountByAssets = (tickets || []).reduce((acc, ticket) => {
        (ticket.customFieldsData || []).forEach((field) => {
          if (field.hasOwnProperty('extraValue')) {
            const extraValue = field.extraValue;
            const value = field.value && field.value;
            acc[value] = (acc[value] || 0) + 1;
            assetsMap[value] = extraValue;
          }
        });
        return acc;
      }, {});

      const getAseetTickets = Object.values(ticketCountByAssets);
      const getAssetIds = Object.keys(ticketCountByAssets);

      const data = getAseetTickets;
      const labels = getAssetIds.map((assetId) => assetsMap[assetId]);

      const title = 'Deviation by assets';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'branchIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'branches',
        fieldLabel: 'Select branches',
      },
      {
        fieldName: 'departmentIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'departments',
        fieldLabel: 'Select departments',
      },
      {
        fieldName: 'createdUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select created users',
      },
      {
        fieldName: 'closedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select closed users',
      },

      {
        fieldName: 'pipelineIds',
        fieldType: 'select',
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${DEVIATION_PIPELINE_TYPE}"}`,
        multi: true,
        isAll: true,
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageIds',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'pipelineLabelIds',
        fieldType: 'select',
        fieldQuery: 'pipelineLabels',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'select label',
      },
      {
        fieldName: 'assetIds',
        fieldType: 'select',
        fieldQuery: 'assets',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        multi: true,
        fieldLabel: 'Select Assets',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
      },
    ],
  },
  {
    templateType: 'actionByDefaultDepartment',
    serviceType: 'action',
    name: 'Action by default department',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { departmentIds } = filter;

      const matchfilter = await buildMatchFilter(
        filter,
        subdomain,
        ACTION_PIPELINE_TYPE,
      );

      const groupIds = await generateGroupIds(departmentIds, 'department', subdomain)
      const stageIds = await getStageIds(subdomain, ACTION_PIPELINE_TYPE);

      const tasks = await sendCardsMessage({
        subdomain,
        action: 'tasks.find',
        data: {
          stageId: { $in: stageIds },
          ...matchfilter,
        },
        isRPC: true,
        defaultValue: null,
      });

      let taskCountByDepartment = {}

      taskCountByDepartment = (tasks || []).reduce((acc, task) => {
        let taskDepartmentIds = task.departmentIds || [];

        taskDepartmentIds.forEach((departmentId) => {
          acc[departmentId] = (acc[departmentId] || 0) + 1;
        });
        return acc;
      }, {});

      if (groupIds.length > 0) {
        taskCountByDepartment = (groupIds || []).reduce((totalCount, obj) => {
          Object.entries(obj).forEach(([key, value]) => {
            totalCount[key] = value.reduce((total, id) => total + (taskCountByDepartment[id] || 0), totalCount[key] || 0);
          });
          return totalCount;
        }, {});
      }

      const getDepartmentTasks = Object.values(taskCountByDepartment);
      const getDepartmentIds = Object.keys(taskCountByDepartment);

      const departmentsMap = await getDetails({
        subdomain,
        params: { getDepartmentIds },
      });

      const data = getDepartmentTasks;
      const labels = getDepartmentIds.map(
        (departmentId) => departmentsMap[departmentId]?.title,
      );

      const title = 'Action by default department';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'departmentIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'departments',
        fieldLabel: 'Select departments',
      },
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'closedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select closed users',
      },

      {
        fieldName: 'pipelineIds',
        fieldType: 'select',
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${ACTION_PIPELINE_TYPE}"}`,
        multi: true,
        isAll: true,
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageIds',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'assetIds',
        fieldType: 'select',
        fieldQuery: 'assets',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        multi: true,
        fieldLabel: 'Select Assets',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
      },
    ],
  },
  {
    templateType: 'totalAction',
    serviceType: 'action',
    name: 'Total Action',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineIds } = filter;

      const matchfilter = await buildMatchFilter(
        { ...filter, pipelineIds: [] },
        subdomain,
        ACTION_PIPELINE_TYPE,
      );

      const board = await sendCardsMessage({
        subdomain,
        action: 'boards.findOne',
        data: {
          type: ACTION_PIPELINE_TYPE,
          name: 'Action',
        },
        isRPC: true,
        defaultValue: {},
      });

      let queryData: any = {
        type: ACTION_PIPELINE_TYPE,
        boardId: board?._id,
        name: { $in: ACTION_PIPELINES },
      };

      if (pipelineIds) {
        queryData._id = { $in: pipelineIds };
      }

      const pipelines = await sendCardsMessage({
        subdomain,
        action: 'pipelines.find',
        data: queryData,
        isRPC: true,
        defaultValue: [],
      });

      const taskCountByPipeline = await (pipelines || []).reduce(
        async (accPromise, pipeline) => {
          const acc = await accPromise;
          const stages = await sendCardsMessage({
            subdomain,
            action: 'stages.find',
            data: {
              type: ACTION_PIPELINE_TYPE,
              pipelineId: pipeline._id,
            },
            isRPC: true,
            defaultValue: [],
          });

          const stageIds = stages.map((stage) => stage._id);

          const tasks = await sendCardsMessage({
            subdomain,
            action: 'tasks.find',
            data: {
              stageId: { $in: stageIds },
              ...matchfilter,
            },
            isRPC: true,
            defaultValue: [],
          });

          if (tasks && tasks.length) {
            acc[pipeline.name] = tasks.length;
          }
          return acc;
        },
        {},
      );

      const getTotalTickets = Object.values(taskCountByPipeline);
      const getTotalIds = Object.keys(taskCountByPipeline);

      const data = getTotalTickets;
      const labels = getTotalIds;

      const title = 'Total Action';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'branchIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'branches',
        fieldLabel: 'Select branches',
      },
      {
        fieldName: 'departmentIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'departments',
        fieldLabel: 'Select departments',
      },
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'closedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select closed users',
      },
      {
        fieldName: 'pipelineIds',
        fieldType: 'select',
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${ACTION_PIPELINE_TYPE}"}`,
        multi: true,
        isAll: true,
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageIds',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'assetIds',
        fieldType: 'select',
        fieldQuery: 'assets',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        multi: true,
        fieldLabel: 'Select Assets',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
      },
    ],
  },
  {
    templateType: 'actionByEachMonth',
    serviceType: 'action',
    name: 'Action by each month',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const matchfilter = await buildMatchFilter(
        filter,
        subdomain,
        ACTION_PIPELINE_TYPE,
      );

      const stageIds = await getStageIds(subdomain, ACTION_PIPELINE_TYPE);

      const tasks = await sendCardsMessage({
        subdomain,
        action: 'tasks.find',
        data: {
          stageId: { $in: stageIds },
          ...matchfilter,
        },
        isRPC: true,
        defaultValue: null,
      });

      const taskCountsByMonth = {
        January: 0,
        February: 0,
        March: 0,
        April: 0,
        May: 0,
        June: 0,
        July: 0,
        August: 0,
        September: 0,
        October: 0,
        November: 0,
        December: 0,
      };

      (tasks || []).forEach((task) => {
        const createdAt = new Date(task.createdAt);

        const month = MONTH_NAMES[createdAt.getMonth()];
        taskCountsByMonth[month]++;
      });

      const data = Object.values(taskCountsByMonth);
      const labels = Object.keys(taskCountsByMonth);

      const title = 'Action by each month';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'branchIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'branches',
        fieldLabel: 'Select branches',
      },
      {
        fieldName: 'departmentIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'departments',
        fieldLabel: 'Select departments',
      },
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'closedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select closed users',
      },

      {
        fieldName: 'pipelineIds',
        fieldType: 'select',
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${ACTION_PIPELINE_TYPE}"}`,
        multi: true,
        isAll: true,
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageIds',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'assetIds',
        fieldType: 'select',
        fieldQuery: 'assets',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        multi: true,
        fieldLabel: 'Select Assets',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
      },
    ],
  },
  {
    templateType: 'closedActionByUsers',
    serviceType: 'action',
    name: 'Closed action by users',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const matchfilter = await buildMatchFilter(
        filter,
        subdomain,
        ACTION_PIPELINE_TYPE,
      );

      const stageIds = await getStageIds(subdomain, ACTION_PIPELINE_TYPE, true);

      const tasks = await sendCardsMessage({
        subdomain,
        action: 'tasks.find',
        data: {
          stageId: { $in: stageIds },
          ...matchfilter,
        },
        isRPC: true,
        defaultValue: null,
      });

      const closedStageTaskIds = tasks.map((task) => task._id);

      const logs = await sendLogsMessage({
        subdomain,
        action: 'activityLogs.findMany',
        data: {
          query: {
            contentType: 'cards:task',
            contentId: { $in: closedStageTaskIds },
            'content.destinationStageId': { $in: stageIds },
            action: 'moved',
          },
        },
        isRPC: true,
        defaultValue: [],
      });

      const taskCountByClosedUserId = logs.reduce((acc, log) => {
        const { createdBy, contentId } = log;
        if (!acc[createdBy]) {
          acc[createdBy] = new Set();
        }
        acc[createdBy].add(contentId);
        return acc;
      }, {});

      for (const user in taskCountByClosedUserId) {
        taskCountByClosedUserId[user] = taskCountByClosedUserId[user].size;
      }

      const getUserTasks = Object.values(taskCountByClosedUserId);
      const getUserIds = Object.keys(taskCountByClosedUserId);

      const usersMap = await getDetails({ subdomain, params: { getUserIds } });

      const data = getUserTasks;
      const labels = getUserIds.map((userId) => usersMap[userId]?.fullName);

      const title = 'Closed action by users';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'branchIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'branches',
        fieldLabel: 'Select branches',
      },
      {
        fieldName: 'departmentIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'departments',
        fieldLabel: 'Select departments',
      },
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'closedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select closed users',
      },

      {
        fieldName: 'pipelineIds',
        fieldType: 'select',
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${ACTION_PIPELINE_TYPE}"}`,
        multi: true,
        isAll: true,
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageIds',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'assetIds',
        fieldType: 'select',
        fieldQuery: 'assets',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        multi: true,
        fieldLabel: 'Select Assets',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
      },
    ],
  },
  {
    templateType: 'actionByLabels',
    serviceType: 'action',
    name: 'Action by labels',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineLabelIds } = filter;

      const matchfilter = await buildMatchFilter(
        filter,
        subdomain,
        ACTION_PIPELINE_TYPE,
      );

      const stageIds = await getStageIds(subdomain, ACTION_PIPELINE_TYPE);

      const tasks = await sendCardsMessage({
        subdomain,
        action: 'tasks.find',
        data: {
          stageId: { $in: stageIds },
          ...matchfilter,
        },
        isRPC: true,
        defaultValue: null,
      });

      const taskCountsByLabels = (tasks || []).reduce((acc, task) => {
        let taskLabelIds = task.labelIds || [];

        if (pipelineLabelIds && pipelineLabelIds.length) {
          taskLabelIds = taskLabelIds.filter((id) =>
            pipelineLabelIds.includes(id),
          );
        }

        taskLabelIds.forEach((labelId) => {
          acc[labelId] = (acc[labelId] || 0) + 1;
        });
        return acc;
      }, {});

      const getLabelTasks = Object.values(taskCountsByLabels);
      const getLabelIds = Object.keys(taskCountsByLabels);

      const labelsMap = await getDetails({
        subdomain,
        params: { getLabelIds },
      });

      const data = getLabelTasks;
      const labels = getLabelIds.map((labelId) => labelsMap[labelId]?.title);

      const title = 'Action by labels';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'branchIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'branches',
        fieldLabel: 'Select branches',
      },
      {
        fieldName: 'departmentIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'departments',
        fieldLabel: 'Select departments',
      },
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'closedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select closed users',
      },

      {
        fieldName: 'pipelineIds',
        fieldType: 'select',
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${ACTION_PIPELINE_TYPE}"}`,
        multi: true,
        isAll: true,
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageIds',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'pipelineLabelIds',
        fieldType: 'select',
        fieldQuery: 'pipelineLabels',
        multi: true,
        isAll: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'select label',
      },
      {
        fieldName: 'assetIds',
        fieldType: 'select',
        fieldQuery: 'assets',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        multi: true,
        fieldLabel: 'Select Assets',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
      },
    ],
  },
];

export default chartTemplates;
