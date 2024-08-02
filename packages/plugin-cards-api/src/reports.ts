import * as dayjs from 'dayjs';

import { IModels, generateModels } from './connectionResolver';
import {
  sendCoreMessage,
  sendFormsMessage,
  sendTagsMessage,
} from './messageBroker';

const checkFilterParam = (param: any) => {
  return param && param.length;
};
const NOW = new Date();
const returnDateRange = (dateRange: string, startDate: Date, endDate: Date) => {
  const startOfToday = new Date(NOW.setHours(0, 0, 0, 0));
  const endOfToday = new Date(NOW.setHours(23, 59, 59, 999));
  const startOfYesterday = new Date(
    dayjs(NOW).add(-1, 'day').toDate().setHours(0, 0, 0, 0),
  );

  let $gte;
  let $lte;
  switch (dateRange) {
    case 'today':
      $gte = startOfToday;
      $lte = endOfToday;
      break;
    case 'yesterday':
      $gte = startOfYesterday;
      $lte = startOfToday;
    case 'thisWeek':
      $gte = dayjs(NOW).startOf('week').toDate();
      $lte = dayjs(NOW).endOf('week').toDate();
      break;

    case 'lastWeek':
      $gte = dayjs(NOW).add(-1, 'week').startOf('week').toDate();
      $lte = dayjs(NOW).add(-1, 'week').endOf('week').toDate();
      break;
    case 'lastMonth':
      $gte = dayjs(NOW).add(-1, 'month').startOf('month').toDate();
      $lte = dayjs(NOW).add(-1, 'month').endOf('month').toDate();
      break;
    case 'thisMonth':
      $gte = dayjs(NOW).startOf('month').toDate();
      $lte = dayjs(NOW).endOf('month').toDate();
      break;
    case 'thisYear':
      $gte = dayjs(NOW).startOf('year').toDate();
      $lte = dayjs(NOW).endOf('year').toDate();
      break;
    case 'lastYear':
      $gte = dayjs(NOW).add(-1, 'year').startOf('year').toDate();
      $lte = dayjs(NOW).add(-1, 'year').endOf('year').toDate();
      break;
    case 'customDate':
      $gte = startDate;
      $lte = endDate;
      break;
    // all
    default:
      break;
  }

  if ($gte && $lte) {
    return { $gte, $lte };
  }

  return {};
};

const DATE_RANGE_TYPES = [
  { label: 'All time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'thisWeek' },
  { label: 'Last Week', value: 'lastWeek' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Year', value: 'thisYear' },
  { label: 'Last Year', value: 'lastYear' },
  { label: 'Custom Date', value: 'customDate' },
];

const returnStage = (resolve: string | string[]) => {
  ('');
  // Handle the case when resolve is an array
  const firstResolve = Array.isArray(resolve) ? resolve[0] : resolve;

  switch (firstResolve) {
    case '10':
      return '10%';
    case '20':
      return '30%';
    case '30':
      return '30%';
    case '40':
      return '40%';
    case '50':
      return '50%';
    case '60':
      return '60%';
    case '70':
      return '70%';
    case '80':
      return '80%';
    case '90':
      return '90%';
    case 'Won':
      return 'Won';
    case 'Lost':
      return 'Lost';
    case 'Done':
      return 'Done';
    case 'Resolved':
      return 'Resolved';
    default:
      return {};
  }
};

const PROBABILITY_DEAL = [
  { label: '10%', value: '10' },
  { label: '20%', value: '20' },
  { label: '30%', value: '30' },
  { label: '40%', value: '40' },
  { label: '50%', value: '50' },
  { label: '60%', value: '60' },
  { label: '70%', value: '70' },
  { label: '80%', value: '80' },
  { label: '90%', value: '90' },
  { label: 'Won', value: 'Won' },
  { label: 'Lost', value: 'Lost' },
];
const PROBABILITY_TASK = [
  { label: '10%', value: '10' },
  { label: '20%', value: '20' },
  { label: '30%', value: '30' },
  { label: '40%', value: '40' },
  { label: '50%', value: '50' },
  { label: '60%', value: '60' },
  { label: '70%', value: '70' },
  { label: '80%', value: '80' },
  { label: '90%', value: '90' },
  { label: 'Done', value: 'Done' },
];
const PROBABILITY_TICKET = [
  { label: '10%', value: '10' },
  { label: '20%', value: '20' },
  { label: '30%', value: '30' },
  { label: '40%', value: '40' },
  { label: '50%', value: '50' },
  { label: '60%', value: '60' },
  { label: '70%', value: '70' },
  { label: '80%', value: '80' },
  { label: '90%', value: '90' },
  { label: 'Resolved', value: 'Resolved' },
];

const ATTACHMENT_TYPES = [
  { label: 'Has attachment', value: true },
  { label: 'Has no attachment', value: false }
];

const PRIORITY = [
  { label: 'Critical', value: 'Critical' },
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' },
];
const PIPELINE_TYPE_TICKET = 'ticket';
const PIPELINE_TYPE_DEAL = 'deal';
const PIPELINE_TYPE_TASK = 'task';

const CUSTOM_PROPERTIES_DEAL = 'cards:deal';
const CUSTOM_PROPERTIES_TICKET = 'cards:ticket';
const CUSTOM_PROPERTIES_TASK = 'cards:task';

const reportTemplates = [
  {
    serviceType: 'deal',
    title: 'Deals chart',
    serviceName: 'cards',
    description: 'Deal conversation charts',
    charts: [
      'DealCountTags',
      'DealCountLabel',
      'DealCustomProperties',
      'DealAverageTimeSpentInEachStage',
      'DealAmountAverageByRep',
      'DealLeaderBoardAmountClosedByRep',
      'DealsByLastModifiedDate',
      'DealsClosedLostAllTimeByRep',
      'DealsOpenByCurrentStage',
      'DealsClosedWonAllTimeByRep',
      'DealRevenueByStage',
      'DealsSales',
      'DealCountInEachPipeline',
      'DealCountInEachStage',
      'DealCountByCompanies',
      'ClosedRevenueByMonthWithDealTotalAndClosedRevenueBreakdown',
    ],
    img: 'https://sciter.com/wp-content/uploads/2022/08/chart-js.png',
  },
  {
    serviceType: 'task',
    title: 'Tasks chart',
    serviceName: 'cards',
    description: 'Cards conversation charts',
    charts: [
      'TaskAverageTimeToCloseByReps',
      'TaskAverageTimeToCloseByLabel',
      'TaskAverageTimeToCloseByTags',
      'TaskCustomProperties',
      'TaskClosedTotalsByReps',
      'TaskClosedTotalsByLabel',
      'TaskClosedTotalsByTags',
      'TasksIncompleteTotalsByReps',
      'TasksIncompleteTotalsByLabel',
      'TasksIncompleteTotalsByTags',
      'AllTasksIncompleteByDueDate',
      'TasksIncompleteAssignedToTheTeamByDueDate',
      'TasksIncompleteAssignedToMeByDueDate',
      'TaskCountInEachPipeline',
      'TaskCountInEachStage',
      'TaskCountByCompanies',
    ],
    img: 'https://cdn.mos.cms.futurecdn.net/S5bicwPe8vbP9nt3iwAwwi.jpg',
  },
  {
    serviceType: 'ticket',
    title: 'Tickets chart',
    serviceName: 'cards',
    description: 'Tickets conversation charts',
    charts: [
      'TicketCustomProperties',
      'TicketAverageTimeToCloseOverTime',
      'TicketClosedTotalsByRep',
      'TicketTotalsByStatus',
      'TicketTotalsByLabelPriorityTag',
      'TicketTotalsOverTime',
      'TicketAverageTimeToCloseByRep',
      'TicketAverageTimeToClose',
      'TicketTotalsBySource',
      'TicketsCardCountAssignedUser',
      'TicketsStageDateRange',
      'TicketCountInEachPipeline',
      'TicketCountInEachStage',
      'TicketCountByCompanies',
    ],
    img: 'https://sciter.com/wp-content/uploads/2022/08/chart-js.png',
  },
];

const chartTemplates = [
  {
    templateType: 'DealCountTags',
    name: 'Deals Count Tags',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType, tagIds } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );
      const title: string = 'Deal count tags';

      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const deals = await models?.Deals.find({
        ...query,
      }).lean();
      if (deals) {
        const tagsCount = deals.map((result) => result.tagIds);
        let flattenedTagIds = tagsCount.flat();
        let tagId = tagIds || flattenedTagIds; // Assigns tagIds if it exists, otherwise uses flattenedTagIds
        // Use the flattenedTagIds to query tag information
        const tagInfo = await sendTagsMessage({
          subdomain,
          action: 'find',
          data: {
            _id: { $in: tagId || [] }, // Use flattenedTagIds here
          },
          isRPC: true,
          defaultValue: [],
        });

        const tagData = {};

        tagId.forEach((tagId) => {
          if (!tagData[tagId]) {
            tagData[tagId] = {
              _id: tagId,
              count: 0,
              name: null,
              type: null,
            };
          }
          tagData[tagId].count++;
        });

        for (let tag of tagInfo) {
          let tagId = tagIds || tag._id;

          if (tagData[tagId]) {
            tagData[tagId].name = tag.name;
            tagData[tagId].type = tag.type;
          }
        }

        const groupedTagData: { count: number; name: string }[] =
          Object.values(tagData);

        // Create an array of objects with count and label
        const dataWithLabels = groupedTagData.filter(tag => tag.name !== null).map((tag) => ({
          count: tag.count,
          label: tag.name,
        }));

        dataWithLabels.sort((a, b) => a.count - b.count);

        const data: number[] = dataWithLabels.map((item) => item.count);
        const labels: string[] = dataWithLabels.map((item) => item.label);

        const datasets = {
          title,
          data,
          labels,
        };
        return datasets;
      } else {
        const datasets = {
          title,
          data: [],
          labels: [],
        };
        return datasets;
      }
    },

    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
      {
        fieldName: 'tagIds',
        fieldType: 'select',
        fieldQuery: 'tags',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${CUSTOM_PROPERTIES_DEAL}", "perPage": 1000}`,
        multi: true,
        fieldLabel: 'Select tags',
      },
    ],
  },

  {
    templateType: 'DealCountLabel',
    name: 'Deal Count Label',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );

      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const title = 'Deal Count Label';
      const deals = await models?.Deals.find({
        ...query,
      }).lean();

      if (deals) {
        const labelIds = deals.map((item) => item.labelIds).flat();

        const labels = await models?.PipelineLabels.find({
          _id: {
            $in: labelIds,
          },
        }).lean();

        if (labels) {
          const labelData: Record<
            string,
            { _id: string; count: number; name: string }
          > = {};

          // Count occurrences of labels
          deals.forEach((deal) => {
            (deal.labelIds || []).forEach((labelId) => {
              if (!labelData[labelId]) {
                labelData[labelId] = {
                  _id: labelId,
                  count: 0,
                  name: '',
                };
              }
              labelData[labelId].count++;
            });
          });

          // Update label names
          labels.forEach((label) => {
            const labelId = label._id;
            if (labelData[labelId]) {
              labelData[labelId].name = label.name;
            }
          });

          // Convert labelData to an array and sort based on count
          const groupedLabelData: any[] = Object.values(labelData);

          groupedLabelData.sort((a, b) => a.count - b.count);

          const counts: number[] = groupedLabelData.map((label) => label.count);
          const labelNames: string[] = groupedLabelData.map(
            (label) => label.name,
          );

          const datasets = {
            title,
            data: counts,
            labels: labelNames,
          };

          return datasets;
        }
      }
    },

    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PIPELINE_TYPE_DEAL,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
      {
        fieldName: 'pipelineLabels',
        fieldType: 'select',
        fieldQuery: 'pipelineLabels',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'select label',
      },
    ],
  },

  {
    templateType: 'DealCustomProperties',
    name: 'Deal Custom Properties',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );
      const customFieldsDataFilter = filter.fieldsGroups;

      const title: string = 'Deal Custom Properties';
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const deals = await models?.Deals.find({
        ...query,
      }).lean();

      if (deals) {
        const idCounts = {};
        deals.forEach((dealItem) => {
          (dealItem.customFieldsData || []).forEach((fieldData) => {
            if (fieldData.value && Array.isArray(fieldData.value)) {
              fieldData.value.forEach((obj) => {
                const id = Object.keys(obj)[0];
                idCounts[id] = (idCounts[id] || 0) + 1;
              });
            }
          });
        });

        const fields = Object.keys(idCounts).map((id) => ({
          _id: id,
          count: idCounts[id],
        }));
        const customProperty = fields.map((result) => result._id);

        let customField;
        if (customFieldsDataFilter) {
          customField = customFieldsDataFilter;
        } else {
          customField = customProperty;
        }

        const fieldsGroups = await sendFormsMessage({
          subdomain,
          action: 'fields.find',
          data: {
            query: {
              _id: {
                $in: customField,
              },
            },
          },
          isRPC: true,
        });

        let result = fieldsGroups.map((field) => {
          let correspondingData = fields.find((item) => item._id === field._id);
          if (correspondingData) {
            return {
              _id: correspondingData._id,
              label: field.text,
              count: correspondingData.count,
            };
          }

          return null; // Handle if no corresponding data is found
        });

        result.sort((a, b) => a.count - b.count);

        const data: number[] = result.map((item) => item.count);
        const labels: string[] = result.map((item) => item.label);

        const datasets = {
          title,
          data,
          labels,
        };
        return datasets;
      } else {
        const datasets = {
          title,
          data: [],
          labels: [],
        };
        return datasets;
      }
    },
    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: 'Select a board',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
      {
        fieldName: 'contentType',
        fieldType: 'select',
        fieldQuery: 'fieldsGetTypes',
        fieldValueVariable: 'contentType',
        fieldLabelVariable: 'description',
        multi: false,
        fieldLabel: 'Select properties type ',
      },
      {
        fieldName: 'fieldsGroups',
        fieldType: 'groups',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: 'fields',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'contentType',
            logicFieldVariable: 'contentType',
          },
        ],
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },
  {
    templateType: 'DealRevenueByStage',
    name: 'Deal Revenue By Stage',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        stageId,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const deals = await models?.Deals.find({
        ...query,
      });

      if (deals) {
        const dealAmount = await amountProductData(deals);

        const stageIds = dealAmount.map((item) => item.stageId);

        const stageName = await models?.Stages.find({
          _id: { $in: stageIds },
        });

        const stageNames = stageName
          ?.map((result) => {
            const item = dealAmount.find((item) => item.stageId === result._id);
            if (item) {
              const totalAmount = Number(item.totalAmount);
              return {
                name: result.name,
                totalAmount: totalAmount,
              };
            }
            return null; // Handle if stage ID is not found in transformedResult
          })
          .filter(
            (item): item is { name: string; totalAmount: number } => !!item,
          );
        stageNames.sort((a, b) => a.totalAmount - b.totalAmount);
        if (stageNames) {
          const data: number[] = stageNames.map((item) => item.totalAmount); // Data is numbers now

          const labels: string[] = stageNames.map((item) => item.name); // Labels are strings

          const finalObject = {
            title: 'Deal Revenue By Stage',
            data: data,
            labels: labels,
          };

          return finalObject;
        } else {
          throw new Error('namesWithAverage is undefined');
        }
      }
    },

    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
      {
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },
  {
    templateType: 'ClosedRevenueByMonthWithDealTotalAndClosedRevenueBreakdown',
    name: 'Closed revenue by month with deal total and closed revenue breakdown',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const totalDeals = await models?.Deals.find(query).sort({
        closedDate: -1,
      });

      const monthNames: string[] = [];
      const monthlyDealsCount: number[] = [];
      if (totalDeals) {
        const now = new Date(); // Get the current date
        const startOfYear = new Date(now.getFullYear(), 0, 1); // Get the start of the year
        const endOfYear = new Date(now.getFullYear(), 12, 31); // Get the start of the year
        const endRange = dayjs(
          new Date(totalDeals.at(-1)?.createdAt || endOfYear),
        );

        let startRange = dayjs(startOfYear);
        while (startRange < endRange) {
          monthNames.push(startRange.format('MMMM'));

          const getStartOfNextMonth = startRange.add(1, 'month').toDate();
          const getDealsCountOfMonth = totalDeals.filter(
            (deal) =>
              new Date(deal.createdAt || '').getTime() >=
                startRange.toDate().getTime() &&
              new Date(deal.createdAt || '').getTime() <
                getStartOfNextMonth.getTime(),
          );
          monthlyDealsCount.push(getDealsCountOfMonth.length);
          startRange = startRange.add(1, 'month');
        }
      }
      const title =
        'Closed revenue by month with deal total and closed revenue breakdown';
      const datasets = { title, data: monthlyDealsCount, labels: monthNames };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: 'Select  board',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },

  {
    templateType: 'DealAmountAverageByRep',
    name: 'Deal amount average by rep',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const selectedUserIds = filter.assignedUserIds || [];
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const deals = await models?.Deals.find(query);

      const dealCounts = calculateAverageDealAmountByRep(
        deals,
        selectedUserIds,
      );
      const getTotalAssignedUserIds = await Promise.all(
        dealCounts.map(async (result) => {
          return await sendCoreMessage({
            subdomain,
            action: 'users.find',
            data: {
              query: {
                _id: {
                  $in: result.userId,
                },
              },
            },
            isRPC: true,
            defaultValue: [],
          });
        }),
      );
      const assignedUsersMap: Record<
        string,
        { fullName: string; amount: string }
      > = {};

      for (let i = 0; i < getTotalAssignedUserIds.length; i++) {
        const assignedUsers = getTotalAssignedUserIds[i];
        for (const assignedUser of assignedUsers) {
          const fullName = assignedUser.details?.fullName || assignedUser.email;
          assignedUsersMap[assignedUser._id] = {
            fullName: fullName,
            amount: dealCounts[i].amount || '0',
          };
        }
      }

      // Convert assignedUsersMap to an array of key-value pairs
      const assignedUsersArray: [
        string,
        { fullName: string; amount: string },
      ][] = Object.entries(assignedUsersMap);

      // Sort the array based on the amount values
      assignedUsersArray.sort(
        (a, b) => parseFloat(a[1].amount) - parseFloat(b[1].amount),
      );

      // Reconstruct the sorted object
      const sortedAssignedUsersMap: Record<
        string,
        { fullName: string; amount: string }
      > = {};
      for (const [userId, userInfo] of assignedUsersArray) {
        sortedAssignedUsersMap[userId] = userInfo;
      }

      // Extract sorted data and labels
      const sortedData = Object.values(sortedAssignedUsersMap).map(
        (t: any) => t.amount,
      );
      const sortedLabels = Object.values(sortedAssignedUsersMap).map(
        (t: any) => t.fullName,
      );

      const title = 'Deal amount average by rep';
      const datasets = { title, data: sortedData, labels: sortedLabels };
      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: 'Select  board',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },

  {
    templateType: 'DealLeaderBoardAmountClosedByRep',
    name: 'Deal leader board - amount closed by rep',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const selectedUserIds = filter.assignedUserIds || [];
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const deals = await models?.Deals.find(query);

      const dealCounts = calculateAverageDealAmountByRep(
        deals,
        selectedUserIds,
      );
      const getTotalAssignedUserIds = await Promise.all(
        dealCounts.map(async (result) => {
          return await sendCoreMessage({
            subdomain,
            action: 'users.find',
            data: {
              query: {
                _id: {
                  $in: result.userId,
                },
              },
            },
            isRPC: true,
            defaultValue: [],
          });
        }),
      );
      const assignedUsersMap: Record<
        string,
        { fullName: string; amount: string }
      > = {};

      for (let i = 0; i < getTotalAssignedUserIds.length; i++) {
        const assignedUsers = getTotalAssignedUserIds[i];
        for (const assignedUser of assignedUsers) {
          assignedUsersMap[assignedUser._id] = {
            fullName: assignedUser.details?.fullName,
            amount: dealCounts[i].amount, // Match the amount with the correct index
          };
        }
      }
      const assignedUsersArray: [
        string,
        { fullName: string; amount: string },
      ][] = Object.entries(assignedUsersMap);

      // Sort the array based on the amount values
      assignedUsersArray.sort(
        (a, b) => parseFloat(a[1].amount) - parseFloat(b[1].amount),
      );

      // Reconstruct the sorted object
      const sortedAssignedUsersMap: Record<
        string,
        { fullName: string; amount: string }
      > = {};
      for (const [userId, userInfo] of assignedUsersArray) {
        sortedAssignedUsersMap[userId] = userInfo;
      }

      // Extract sorted data and labels
      const sortedData = Object.values(sortedAssignedUsersMap).map(
        (t: any) => t.amount,
      );
      const sortedLabels = Object.values(sortedAssignedUsersMap).map(
        (t: any) => t.fullName,
      );

      const title = 'Deal amount average by rep';
      const datasets = { title, data: sortedData, labels: sortedLabels };
      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },

  {
    templateType: 'DealsByLastModifiedDate',
    name: 'Deals by last modified date',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const totalDeals = await models?.Deals.find(query)
        .sort({
          modifiedAt: -1,
        })
        .limit(1000);
      const dealsCount = totalDeals?.map((deal) => {
        return {
          dealName: deal.name,
          dealStage: deal.stageId,
          currentStatus: deal.status,
          lastModifiedDate: deal.modifiedAt,
          stageChangedDate: deal.stageChangedDate,
        };
      });

      const sortedData = dealsCount?.sort((a, b) => {
        const dateA = new Date(a.lastModifiedDate ?? 0);
        const dateB = new Date(b.lastModifiedDate ?? 0);
        return dateB.getTime() - dateA.getTime();
      });

      const data = sortedData?.map((deal: any) => {
        const dateWithTime = new Date(deal.lastModifiedDate);
        const dateOnly = dateWithTime.toISOString().substring(0, 10); // Extract YYYY-MM-DD
        return dateOnly;
      });

      const labels = sortedData?.map((deal: any) => deal.dealName);
      const label = 'Deals count by modified month';

      const datasets = {
        title: label,
        data,
        labels,
      };
      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },

  {
    templateType: 'DealsClosedLostAllTimeByRep',
    name: 'Deals closed lost all time by rep',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const selectedUserIds = filter.assignedUserIds || [];
      const matchedFilter = await filterData(filter, subdomain);
      const { pipelineId, boardId, stageId, stageType } = filter;
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        stageId,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      let dealCounts = await models?.Deals.find({
        ...query,
      }).lean();

      if (dealCounts) {
        const data = await Promise.all(
          dealCounts.map(async (item) => {
            const getTotalRespondedUsers = await sendCoreMessage({
              subdomain,
              action: 'users.find',
              data: {
                query: {
                  _id:
                    selectedUserIds.length > 0
                      ? { $in: selectedUserIds }
                      : { $in: item.assignedUserIds },
                },
              },
              isRPC: true,
              defaultValue: [],
            });

            const processedUsers = await Promise.all(
              getTotalRespondedUsers.map(async (user) => {
                const fullName = user.details?.fullName || user.email;
                const counts = await models?.Deals.countDocuments({
                  status: 'active',
                  assignedUserIds: user._id,
                });
                return {
                  FullName: fullName,
                  _id: user._id,
                  count: counts || 0,
                };
              }),
            );

            // Flatten the array of arrays and remove duplicates based on _id
            const uniqueData = processedUsers.reduce((acc, val) => {
              acc[val._id] = val;
              return acc;
            }, {});

            return Object.values(uniqueData);
          }),
        );

        const filteredData = data.filter((arr) => arr.length > 0);
        const uniqueUserEntries = Array.from(
          new Set(filteredData.map((entry) => JSON.stringify(entry))),
          (str) => JSON.parse(str),
        );

        const summedResultArray =
          await sumCountsByUserIdName(uniqueUserEntries);
        const filteredResult =
          selectedUserIds.length > 0
            ? summedResultArray.filter((user) =>
                selectedUserIds.includes(user._id),
              )
            : summedResultArray;

        filteredResult.sort((a, b) => a.count - b.count);

        // Extract sorted data and labels
        const setData = filteredResult.map((item: any) => item.count);
        const setLabels = filteredResult.map((item: any) => item.fullName);

        const title = 'Deals closed lost all time by rep';
        const datasets = { title, data: setData, labels: setLabels };
        return datasets;
      } else {
        throw new Error('No dealCounts found');
      }
    },
    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },
  {
    templateType: 'DealAverageTimeSpentInEachStage',
    name: 'Deal Average Time Spent In Each Stage',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        stageId,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const deals = await models?.Deals.find({
        ...query,
      });

      if (deals) {
        const totalStageTime: { [key: string]: number } = {};
        const stageCount: { [key: string]: number } = {};
        deals.forEach((deal) => {
          const createdAtTime = deal.createdAt
            ? new Date(deal.createdAt).getTime()
            : undefined;
          const stageChangedTime = deal.stageChangedDate
            ? new Date(deal.stageChangedDate).getTime()
            : undefined;

          if (createdAtTime !== undefined && stageChangedTime !== undefined) {
            const timeSpent = stageChangedTime - createdAtTime;

            if (!totalStageTime[deal.stageId]) {
              totalStageTime[deal.stageId] = 0;
              stageCount[deal.stageId] = 0;
            }

            totalStageTime[deal.stageId] += timeSpent;
            stageCount[deal.stageId]++;
          }
        });

        const averageTimeSpent: { [key: string]: number } = {};
        for (const stageId in totalStageTime) {
          if (totalStageTime.hasOwnProperty(stageId)) {
            averageTimeSpent[stageId] =
              totalStageTime[stageId] / stageCount[stageId];
          }
        }

        const transformedResult = Object.entries(averageTimeSpent).map(
          ([stageId, average]) => ({
            _id: stageId,
            average: average.toString(),
          }),
        );

        const stageIds = transformedResult.map((item) => item._id);
        const stageName = await models?.Stages.find({
          _id: { $in: stageIds },
        });

        const namesWithAverage = stageName
          ?.map((result) => {
            const item = transformedResult.find(
              (item) => item._id === result._id,
            );
            if (item) {
              const averageHours = Number(item.average) / 3600000; // Convert average from milliseconds to hours
              return {
                name: result.name,
                averageHours: averageHours,
              };
            }
            return null; // Handle if stage ID is not found in transformedResult
          })
          .filter(
            (item): item is { name: string; averageHours: number } => !!item,
          );

        if (namesWithAverage) {
          const data: number[] = namesWithAverage.map(
            (item) => item.averageHours,
          ); // No need for parseFloat
          const labels: string[] = namesWithAverage.map((item) => item.name); // Labels are strings

          const finalObject = {
            title: 'Deal Average Time Spent In Each Stage',
            data: data,
            labels: labels,
          };
          return finalObject;
        } else {
          throw new Error('namesWithAverage is undefined');
        }
      }
    },
    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
      {
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },
  {
    templateType: 'DealsOpenByCurrentStage',
    name: 'Deals open by current stage',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const {
        pipelineId,
        boardId,
        stageId,
        stageType,
        dateRange,
        startDate,
        endDate,
      } = filter;
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        stageId,
        PIPELINE_TYPE_DEAL,
        models,
      );
      const matchfilter = {};
      const title = 'Deals open by current stage';
      if (dateRange) {
        const dateFilter = returnDateRange(
          filter.dateRange,
          startDate,
          endDate,
        );
        if (Object.keys(dateFilter).length) {
          matchfilter['createdAt'] = dateFilter;
        }
      }
      const stageCount = await models?.Stages.find({
        ...matchfilter,
        _id: { $in: filterPipelineId },
      });
      if (stageCount) {
        const groupedData: { [key: string]: string[] } = stageCount.reduce(
          (acc, curr) => {
            if (!acc[curr.pipelineId]) {
              acc[curr.pipelineId] = [];
            }
            acc[curr.pipelineId].push(curr.name);
            return acc;
          },
          {},
        );
        const datasets = {
          title: title,
          data: Object.entries(groupedData).map(([_, value]) => value.length),
          labels: Object.entries(groupedData).map(([_, value]) =>
            value.join(', '),
          ),
        };
        return datasets;
      } else {
        const datasets = { title, data: [], labels: [] };
        return datasets;
      }
    },
    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
      {
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },

  {
    templateType: 'DealsClosedWonAllTimeByRep',
    name: 'Deals closed won all time by rep',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const selectedUserIds = filter.assignedUserIds || [];
      const matchedFilter = await filterData(filter, subdomain);
      const { pipelineId, boardId, stageId, stageType } = filter;
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      let dealCounts = await models?.Deals.find({
        ...query,
      }).lean();

      if (dealCounts) {
        const data = await Promise.all(
          dealCounts.map(async (item) => {
            const getTotalRespondedUsers = await sendCoreMessage({
              subdomain,
              action: 'users.find',
              data: {
                query: {
                  _id:
                    selectedUserIds.length > 0
                      ? { $in: selectedUserIds }
                      : { $in: item.assignedUserIds },
                },
              },
              isRPC: true,
              defaultValue: [],
            });

            const processedUsers = await Promise.all(
              getTotalRespondedUsers.map(async (user) => {
                const fullName = user.details?.fullName || user.email;
                const counts = await models?.Deals.countDocuments({
                  status: 'active',
                  assignedUserIds: user._id,
                });
                return {
                  FullName: fullName,
                  _id: user._id,
                  count: counts || 0,
                };
              }),
            );

            // Flatten the array of arrays and remove duplicates based on _id
            const uniqueData = processedUsers.reduce((acc, val) => {
              acc[val._id] = val;
              return acc;
            }, {});

            return Object.values(uniqueData);
          }),
        );

        const filteredData = data.filter((arr) => arr.length > 0);
        const uniqueUserEntries = Array.from(
          new Set(filteredData.map((entry) => JSON.stringify(entry))),
          (str) => JSON.parse(str),
        );

        const summedResultArray =
          await sumCountsByUserIdName(uniqueUserEntries);
        const filteredResult =
          selectedUserIds.length > 0
            ? summedResultArray.filter((user) =>
                selectedUserIds.includes(user._id),
              )
            : summedResultArray;

        filteredResult.sort((a, b) => a.count - b.count);

        // Extract sorted data and labels
        const setData = filteredResult.map((item: any) => item.count);
        const setLabels = filteredResult.map((item: any) => item.fullName);

        const title = 'Deals closed won all time by rep';
        const datasets = { title, data: setData, labels: setLabels };
        return datasets;
      } else {
        throw new Error('No dealCounts found');
      }
    },
    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },
  {
    templateType: 'DealsSales',
    name: 'Deals sales',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const filerData = await filterData(filter, subdomain);
      const data = await pipelineFilterData(
        filerData,
        pipelineId,
        boardId,
        stageType,
        models,
      );
      return data;
    },
    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_DEAL,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },

  //Task Reports
  {
    templateType: 'TicketCustomProperties',
    name: 'Ticket Custom Properties',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain)

      if (boardId || pipelineId || stageId) {
        const stageIds = await getStageIds(filter, PIPELINE_TYPE_TICKET, models)
        matchedFilter['stageId'] = { $in: stageIds }
      }

      const pipeline = [
        {
          $unwind: "$customFieldsData",
        },
        {
          $match: {
            ...matchedFilter
          },
        },
        {
          $lookup: {
            from: "form_fields",
            localField: "customFieldsData.field",
            foreignField: "_id",
            as: "field",
          },
        },
        {
          $unwind: "$field",
        },
        {
          $group: {
            _id: "$customFieldsData.field",
            field: { $first: "$field.text" },
            fieldType: { $first: "$field.type" },
            fieldOptions: { $first: "$field.options" },
            selectedOptions: { $push: "$customFieldsData.value" },
            count: { $sum: 1 },
          },
        },
      ]

      const tickets = await models.Tickets.aggregate(pipeline)

      const ticketsCountByPropertiesField = (tickets || []).reduce((acc, {
        field,
        fieldType,
        fieldOptions,
        selectedOptions,
        count
      }) => {

        if (!fieldOptions.length) {
          acc[field] = count
          return acc
        }

        selectedOptions.map(selectedOption => {
          if (fieldType === 'multiSelect') {
            const optionArray = selectedOption.split(',');
            optionArray.forEach(opt => {
              if (fieldOptions.includes(opt)) {
                acc[opt.trim()] = (acc[opt.trim()] || 0) + 1;
              }
            });
          } else if (Array.isArray(selectedOption)) {
            selectedOption.flatMap(option => {
              if (fieldOptions.includes(option)) {
                acc[option] = (acc[option] || 0) + 1
              }
            })
          } else if (fieldOptions.includes(selectedOption)) {
            acc[selectedOption] = (acc[selectedOption] || 0) + 1
          }
        })

        return acc
      }, {})

      const data = Object.values(ticketsCountByPropertiesField);
      const labels = Object.keys(ticketsCountByPropertiesField);
      const title = 'Ticket Custom Properties';

      return { title, data, labels };

    },
    filterTypes: [
      {
        fieldName: 'attachment',
        fieldType: 'select',
        fieldOptions: ATTACHMENT_TYPES,
        fieldLabel: 'Select attachment',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'companyIds',
        fieldType: 'select',
        fieldQuery: 'companies',
        multi: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'primaryName',
        fieldQueryVariables: `{"conformityMainType": "${PIPELINE_TYPE_TICKET}", "conformityRelType": "company"}`,
        fieldLabel: 'Select companies',
      },
      {
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        fieldLabel: 'Select a board',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TICKET,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
      {
        fieldName: 'groupIds',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TICKET}"}`,
        multi: true,
        fieldLabel: 'Select field group',
      },
      {
        fieldName: 'fieldIds',
        fieldType: 'select',
        fieldQuery: 'fields',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'text',
        fieldParentVariable: 'groupId',
        fieldParentQuery: "fieldsGroups",
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TICKET}", "isVisible": true}`,
        logics: [
          {
            logicFieldName: 'groupIds',
            logicFieldVariable: 'groupIds',
            logicFieldExtraVariable: `{"contentType": "${CUSTOM_PROPERTIES_TICKET}"}`,
          },
        ],
        multi: true,
        fieldLabel: 'Select field',
      },
    ],
  },

  {
    templateType: 'TaskCustomProperties',
    name: 'Task Custom Properties',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );
      const customFieldsDataFilter = filter.fieldsGroups;

      const title: string = 'Task Custom Properties';
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const task = await models?.Tasks.find({
        ...query,
      }).lean();

      if (task) {
        const idCounts = {};
        task.forEach((ticketItem) => {
          (ticketItem.customFieldsData || []).forEach((fieldData) => {
            if (fieldData.value && Array.isArray(fieldData.value)) {
              fieldData.value.forEach((obj) => {
                const id = Object.keys(obj)[0];
                idCounts[id] = (idCounts[id] || 0) + 1;
              });
            }
          });
        });

        const fields = Object.keys(idCounts).map((id) => ({
          _id: id,
          count: idCounts[id],
        }));
        const customProperty = fields.map((result) => result._id);

        let customField;
        if (customFieldsDataFilter) {
          customField = customFieldsDataFilter;
        } else {
          customField = customProperty;
        }

        const fieldsGroups = await sendFormsMessage({
          subdomain,
          action: 'fields.find',
          data: {
            query: {
              _id: {
                $in: customField,
              },
            },
          },
          isRPC: true,
        });

        let result = fieldsGroups.map((field) => {
          let correspondingData = fields.find((item) => item._id === field._id);
          if (correspondingData) {
            return {
              _id: correspondingData._id,
              label: field.text,
              count: correspondingData.count,
            };
          }

          return null; // Handle if no corresponding data is found
        });

        result.sort((a, b) => a.count - b.count);

        const data: number[] = result.map((item) => item.count);
        const labels: string[] = result.map((item) => item.label);

        const datasets = {
          title,
          data,
          labels,
        };
        return datasets;
      } else {
        const datasets = {
          title,
          data: [],
          labels: [],
        };
        return datasets;
      }
    },
    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        fieldLabel: 'Select a board',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TASK,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
      {
        fieldName: 'contentType',
        fieldType: 'select',
        fieldQuery: 'fieldsGetTypes',
        fieldValueVariable: 'contentType',
        fieldLabelVariable: 'description',
        multi: false,
        fieldLabel: 'Select properties type ',
      },
      {
        fieldName: 'fieldsGroups',
        fieldType: 'groups',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: 'fields',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'contentType',
            logicFieldVariable: 'contentType',
          },
        ],
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },
  {
    templateType: 'TaskAverageTimeToCloseByReps',
    name: 'Task average time to close by reps',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const selectedUserIds = filter.assignedUserIds || [];
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const tasks = await models?.Tasks.find({ ...query });

      const ticketData = await calculateAverageTimeToCloseUser(
        tasks,
        selectedUserIds,
      );

      const getTotalAssignedUsers = await Promise.all(
        ticketData?.map(async (result) => {
          return await sendCoreMessage({
            subdomain,
            action: 'users.find',
            data: {
              query: {
                _id: {
                  $in: result.assignedUserIds,
                },
              },
            },
            isRPC: true,
            defaultValue: [],
          });
        }) ?? [],
      );

      const result: any[] = [];

      for (const assignedUser of getTotalAssignedUsers) {
        assignedUser.map((itemsAdd) => {
          const ticket = ticketData?.find((item) =>
            item.assignedUserIds.includes(itemsAdd._id),
          );

          if (ticket) {
            result.push({
              timeDifference: ticket.timeDifference,
              assignedUserIds: ticket.assignedUserIds,
              FullName: itemsAdd.details?.fullName || '',
            });
          }
        });
      }
      // Convert timeDifference strings to numbers
      result.forEach((item) => {
        item.timeDifference = parseFloat(item.timeDifference);
      });

      // Sort the result array by the timeDifference property
      result.sort((a, b) => a.timeDifference - b.timeDifference);

      // Extract sorted data and labels
      const data = result.map((t: any) => t.timeDifference);
      const labels = result.map((t: any) => t.FullName);

      const title = 'Task average time to close by reps';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        fieldLabel: 'Select a board',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TASK,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },

  {
    templateType: 'TaskAverageTimeToCloseByLabel',
    name: 'Task average time to close by label',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );

      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const tasks = await models?.Tasks.find({ ...query });

      const ticketData = await taskAverageTimeToCloseByLabel(tasks);
      // const labelIds = ticketData.map((result) => result.labelIds);
      const labelIdsCount = ticketData.flatMap((result) => result.labelIds);

      const labels = await models?.PipelineLabels.find({
        _id: {
          $in: labelIdsCount,
        },
      }).lean();

      if (!labels || labels.length === 0) {
        // Handle the case where no labels are found
        return {
          title: '',
          data: [],
          labels: [],
        };
      }
      const enrichedTicketData = ticketData.map((task) => {
        // Ensure labelIds is an array (default to empty array if undefined)
        const labelIds = Array.isArray(task.labelIds) ? task.labelIds : [];

        // Check if labelIds is not empty before mapping
        if (labelIds.length > 0) {
          const labelNames = labelIds.map((labelId) => {
            const matchingLabel = labels.find(
              (label) => label && label._id === labelId,
            ); // Check for undefined label
            return matchingLabel ? matchingLabel.name : '';
          });

          // Filter out undefined and empty string labels
          const filteredLabels = labelNames.filter((label) => label !== '');

          return {
            ...task,
            labels: filteredLabels,
          };
        } else {
          // If labelIds is empty, return the task as is
          return task;
        }
      });

      enrichedTicketData.forEach((t) => {
        t.timeDifference = parseFloat(t.timeDifference);
      });

      // Sort the enrichedTicketData array by the timeDifference property
      enrichedTicketData.sort((a, b) => a.timeDifference - b.timeDifference);

      let setData: string[] = [];
      let stablesNames: string[] = [];

      enrichedTicketData
        .filter((t) => t.timeDifference && t.labels && t.labels.length > 0)
        .slice(0, 100) // Limit to the first 100 elements
        .forEach((t) => {
          setData.push(t.timeDifference.toString());

          // Flatten and join the labels array into a single string
          const flattenedLabels = t.labels.join(' ');
          stablesNames.push(flattenedLabels);
        });

      const title = 'Task average time to close by label';

      const datasets = {
        title,
        data: setData,
        labels: stablesNames,
      };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        fieldLabel: 'Select a board',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TASK,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
      {
        fieldName: 'pipelineLabels',
        fieldType: 'select',
        fieldQuery: 'pipelineLabels',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'select label',
      },
    ],
  },

  {
    templateType: 'TaskAverageTimeToCloseByTags',
    name: 'Task average time to close by tags',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType, tagIds } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const tasks = await models?.Tasks.find({
        ...query,
      }).lean();
      const taskData = await taskAverageTimeToCloseByLabel(tasks);
      const tagsCount = taskData.flatMap((result) => result.tagIds);
      let tagId = tagIds || tagsCount;
      const tagInfo = await sendTagsMessage({
        subdomain,
        action: 'find',
        data: {
          _id: { $in: tagId || [] },
        },
        isRPC: true,
        defaultValue: [],
      });

      const tagData = {};

      // Iterate over each task and accumulate timeDifference based on tagId
      taskData.forEach((task) => {
        tagId.forEach((tagId) => {
          if (!tagData[tagId]) {
            tagData[tagId] = {
              _id: tagId,
              timeDifference: 0,
              name: '',
              type: '',
            };
          }
          tagData[tagId].timeDifference += parseFloat(task.timeDifference);
        });
      });

      // Update tagData with the name and type from tagInfo
      tagInfo.forEach((tag) => {
        const tagId = tag._id;
        if (tagData[tagId]) {
          tagData[tagId].name = tag.name;
          tagData[tagId].type = tag.type;
        }
      });

      const groupedTagData: { timeDifference: number; name: string }[] =
        Object.values(tagData);

      groupedTagData.sort((a, b) => b.timeDifference - a.timeDifference);

      const data: number[] = groupedTagData.map((t) => t.timeDifference);
      const labels: string[] = groupedTagData.map((t) => t.name);

      const title: string = 'Task average time to close by tags';

      const datasets = {
        title,
        data,
        labels,
      };
      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TASK,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
      {
        fieldName: 'tagIds',
        fieldType: 'select',
        fieldQuery: 'tags',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${CUSTOM_PROPERTIES_TASK}", "perPage": 1000}`,
        multi: true,
        fieldLabel: 'Select tags',
      },
    ],
  },
  {
    templateType: 'TaskClosedTotalsByReps',
    name: 'Task closed totals by reps',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );
      const selectedUserIds = filter.assignedUserIds || [];

      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const tasks = await models?.Tasks.find({ ...query });

      // Calculate task counts
      const taskCounts = calculateTicketCounts(tasks, selectedUserIds);

      // Convert the counts object to an array of objects with ownerId and count
      const countsArray = Object.entries(taskCounts).map(
        // tslint:disable-next-line:no-shadowed-variable
        ([ownerId, count]) => ({
          ownerId,
          count,
        }),
      );

      // Sort the array based on task counts
      countsArray.sort((a, b) => b.count - a.count);

      // Extract unique ownerIds for user lookup
      const ownerIds = countsArray.map((item) => item.ownerId);

      // Fetch information about assigned users
      const getTotalAssignedUsers = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: { _id: { $in: ownerIds } },
        },
        isRPC: true,
        defaultValue: [],
      });
      // Create a map for faster user lookup
      const assignedUsersMap = getTotalAssignedUsers.reduce((acc, user) => {
        acc[user._id] = user.details; // Assuming details contains user information
        return acc;
      }, {});

      const title = 'View the total number of closed tasks by reps';

      const sort = ownerIds.map((ownerId) => {
        const user = assignedUsersMap[ownerId];
        const count = taskCounts[ownerId];
        return {
          name: user.fullName,
          count: count || 0, // Set count to 0 if not found in ticketCounts
        };
      });

      sort.sort((a, b) => a.count - b.count);
      const data = Object.values(sort).map((t: any) => t.count);
      const labels = Object.values(sort).map((t: any) => t.name);

      const datasets = { title, data, labels };
      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TASK,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },
  {
    templateType: 'TaskClosedTotalsByLabel',
    name: 'Task closed totals by label',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );

      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const tasks = await models?.Tasks.find({
        ...query,
      }).lean();

      const taskCounts = taskClosedByRep(tasks);

      // Convert the counts object to an array of objects with ownerId and count
      const countsArray = Object.entries(taskCounts).map(
        ([ownerId, count]) => ({
          ownerId,
          count,
        }),
      );
      countsArray.sort((a, b) => b.count - a.count);

      // Extract unique ownerIds for user lookup
      const ownerIds = countsArray.map((item) => item.ownerId);

      const labels = await models?.PipelineLabels.find({
        _id: {
          $in: ownerIds,
        },
      }).lean();

      if (!labels || labels.length === 0) {
        // Handle the case where no labels are found
        return {
          title: '',
          data: [],
          labels: [],
          count: [],
        };
      }
      const enrichedTicketData = countsArray.map((item) => {
        const { ownerId } = item;
        const matchingLabel = labels.find(
          (label) => label && label._id === ownerId,
        );

        // Use the spread operator (...) to include all properties of the item object
        return {
          ...item,
          labels: matchingLabel ? [matchingLabel.name] : [],
        };
      });
      enrichedTicketData.sort((a, b) => a.count - b.count);
      const data = enrichedTicketData.map((t) => t.count);

      // Flatten the label array and remove any empty arrays
      const label = enrichedTicketData
        .map((t) => t.labels)
        .flat()
        .filter((item) => item.length > 0);
      const title = 'Task closed totals by label';

      const datasets = { title, data, labels: label };

      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TASK,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
      {
        fieldName: 'pipelineLabels',
        fieldType: 'select',
        fieldQuery: 'pipelineLabels',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'select label',
      },
    ],
  },

  {
    templateType: 'TaskClosedTotalsByTags',
    name: 'Task closed totals by tags',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );

      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const tasks = await models?.Tasks.find({
        ...query,
      }).lean();

      const taskCount = calculateTicketCounts(
        tasks,
        filter.assignedUserIds || [],
      );
      const countsArray = Object.entries(taskCount).map(
        // tslint:disable-next-line:no-shadowed-variable
        ([ownerId, count]) => ({
          ownerId,
          count,
        }),
      );
      countsArray.sort((a, b) => b.count - a.count);

      // Extract unique ownerIds for user lookup
      const ownerIds = countsArray.map((item) => item.ownerId);

      const getTotalAssignedUsers = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: { _id: { $in: ownerIds } },
        },
        isRPC: true,
        defaultValue: [],
      });
      const assignedUsersMap = getTotalAssignedUsers.reduce((acc, user) => {
        acc[user._id] = user.details; // Assuming details contains user information
        return acc;
      }, {});

      const sort = ownerIds.map((ownerId) => {
        const user = assignedUsersMap[ownerId];
        const count = taskCount[ownerId];

        return {
          name: user.fullName,
          count: count || 0, // Set count to 0 if not found in ticketCounts
        };
      });
      const title = 'Task closed totals by tags';
      sort.sort((a, b) => a.count - b.count);
      const data = Object.values(sort).map((t: any) => t.count);
      const labels = Object.values(sort).map((t: any) => t.name);
      const datasets = {
        title,
        data,
        labels,
      };
      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TASK,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
      {
        fieldName: 'tagIds',
        fieldType: 'select',
        fieldQuery: 'tags',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${CUSTOM_PROPERTIES_TASK}", "perPage": 1000}`,
        multi: true,
        fieldLabel: 'Select tags',
      },
    ],
  },
  {
    templateType: 'TasksIncompleteTotalsByReps',
    name: 'Tasks incomplete totals by reps',
    chartTypes: ['bar'],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const selectedUserIds = filter.assignedUserIds || [];
      let tasks;

      if (selectedUserIds.length === 0) {
        // No selected users, so get all tasks
        tasks = await models?.Tasks.find({
          ...query,
        }).lean();
      } else {
        // Filter tasks based on selectedUserIds
        const taskCount = await models?.Tasks.find({
          ...query,
          assignedUserIds: { $in: selectedUserIds },
        }).lean();
        if (taskCount) {
          tasks = taskCount.filter((task) => {
            return (task.assignedUserIds || []).some((userId) =>
              selectedUserIds.includes(userId),
            );
          });
        } else {
          // Handle the case where datats is undefined
          throw new Error('No tasks found based on the selected user IDs.');
        }
      }

      // Check if the returned value is not an array
      if (!Array.isArray(tasks)) {
        throw new Error('Invalid data: tasks is not an array.');
      }

      const taskCounts = calculateTicketCounts(tasks, selectedUserIds);

      const countsArray = Object.entries(taskCounts).map(
        ([ownerId, count]) => ({
          ownerId,
          count,
        }),
      );
      countsArray.sort((a, b) => b.count - a.count);

      const ownerIds = countsArray.map((item) => item.ownerId);

      const getTotalAssignedUsers = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: { _id: { $in: ownerIds } },
        },
        isRPC: true,
        defaultValue: [],
      });
      const assignedUsersMap = getTotalAssignedUsers.reduce((acc, user) => {
        acc[user._id] = user.details;
        return acc;
      }, {});

      const title = 'Tasks incomplete totals by reps';
      const sort = ownerIds.map((ownerId) => {
        const user = assignedUsersMap[ownerId];
        const count = taskCounts[ownerId];

        if (user) {
          return {
            name: user.fullName,
            count: count || 0,
          };
        }
      });

      const filteredSort = sort.filter((entry) => entry !== undefined);

      filteredSort.sort((a, b) => {
        if (a && b) {
          return a.count - b.count;
        }
        return 0;
      });

      const data = Object.values(filteredSort).map((t: any) => t.count);
      const labels = Object.values(filteredSort).map((t: any) => t.name);

      const datasets = { title, data, labels };
      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TASK,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },

  {
    templateType: 'TasksIncompleteTotalsByLabel',
    name: 'Tasks incomplete totals by label',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const selectedLabelIds = filter.labelIds || [];
      let tasks;

      if (selectedLabelIds.length === 0) {
        // No selected users, so get all tasks
        tasks = await models?.Tasks.find({
          ...query,
        }).lean();
      } else {
        // Filter tasks based on selectedLabelIds
        tasks = await models?.Tasks.find({
          ...query,
          labelIds: { $in: selectedLabelIds },
        }).lean();
      }

      // Check if the returned value is not an array
      if (!Array.isArray(tasks)) {
        throw new Error('Invalid data: tasks is not an array.');
      }

      const taskCounts = taskClosedByRep(tasks);

      // Convert the counts object to an array of objects with ownerId and count
      const countsArray = Object.entries(taskCounts).map(
        ([ownerId, count]) => ({
          ownerId,
          count,
        }),
      );
      countsArray.sort((a, b) => b.count - a.count);

      // Extract unique ownerIds for user lookup
      const ownerIds = countsArray.map((item) => item.ownerId);

      const labels = await models?.PipelineLabels.find({
        _id: {
          $in: ownerIds,
        },
      }).lean();

      if (!labels || labels.length === 0) {
        // Handle the case where no labels are found
        return {
          title: '',
          data: [],
          labels: [],
          count: [],
        };
      }
      const enrichedTicketData = countsArray.map((item) => {
        const { ownerId } = item;
        const matchingLabel = labels.find(
          (label) => label && label._id === ownerId,
        );

        // Use the spread operator (...) to include all properties of the item object
        return {
          ...item,
          labels: matchingLabel ? [matchingLabel.name] : [],
        };
      });
      enrichedTicketData.sort((a, b) => a.count - b.count);
      const data = enrichedTicketData.map((t) => t.count);

      // Flatten the label array and remove any empty arrays
      const label = enrichedTicketData
        .map((t) => t.labels)
        .flat()
        .filter((item) => item.length > 0);
      const title = 'Tasks incomplete totals by label';

      const datasets = { title, data, labels: label };

      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TASK,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
      {
        fieldName: 'pipelineLabels',
        fieldType: 'select',
        fieldQuery: 'pipelineLabels',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'select label',
      },
    ],
  },

  {
    templateType: 'TasksIncompleteTotalsByTags',
    name: 'Tasks incomplete totals by tags',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const selectedTagIds = filter.tagIds || [];
      let tasksCount;

      if (selectedTagIds.length === 0) {
        // No selected users, so get all tasks
        tasksCount = await models?.Tasks.find({
          ...query,
        }).lean();
      } else {
        // Filter tasks based on selectedLabelIds
        tasksCount = await models?.Tasks.find({
          ...query,
          tagIds: { $in: selectedTagIds },
        }).lean();
      }

      // Check if the returned value is not an array
      if (!Array.isArray(tasksCount)) {
        throw new Error('Invalid data: tasks is not an array.');
      }

      const taskCounts = taskClosedByTagsRep(tasksCount);

      // Convert the counts object to an array of objects with ownerId and count
      const countsArray = Object.entries(taskCounts).map(
        ([ownerId, count]) => ({
          ownerId,
          count,
        }),
      );
      countsArray.sort((a, b) => b.count - a.count);

      // Extract unique ownerIds for user lookup
      const ownerIds = countsArray.map((item) => item.ownerId);

      const tagInfo = await sendTagsMessage({
        subdomain,
        action: 'find',
        data: {
          _id: { $in: ownerIds || [] },
        },
        isRPC: true,
        defaultValue: [],
      });

      if (!tagInfo || tagInfo.length === 0) {
        // Handle the case where no labels are found
        return {
          title: '',
          data: [],
          tagIds: [],
          count: [],
        };
      }
      const enrichedTicketData = countsArray.map((item) => {
        const { ownerId } = item;
        const matchingLabel = tagInfo.find(
          (label) => label && label._id === ownerId,
        );

        // Use the spread operator (...) to include all properties of the item object
        return {
          ...item,
          labels: matchingLabel ? [matchingLabel.name] : [],
        };
      });
      enrichedTicketData.sort((a, b) => a.count - b.count);
      const data = enrichedTicketData.map((t) => t.count);

      // Flatten the label array and remove any empty arrays
      const label = enrichedTicketData
        .map((t) => t.labels)
        .flat()
        .filter((item) => item.length > 0);
      const title = 'Tasks incomplete totals by tags';

      const datasets = { title, data, labels: label };

      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TASK,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
      {
        fieldName: 'tagIds',
        fieldType: 'select',
        fieldQuery: 'tags',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${CUSTOM_PROPERTIES_TASK}", "perPage": 1000}`,
        multi: true,
        fieldLabel: 'Select tags',
      },
    ],
  },
  {
    templateType: 'AllTasksIncompleteByDueDate',
    name: 'All tasks incomplete by due date',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const selectedUserIds = filter.assignedUserIds || [];
      let tasks;

      if (selectedUserIds.length === 0) {
        // No selected users, so get all tasks
        tasks = await models?.Tasks.find({
          ...query,
        }).lean();
      } else {
        // Filter tasks based on selectedUserIds
        const taskCount = await models?.Tasks.find({
          ...query,
          assignedUserIds: { $in: selectedUserIds },
        }).lean();
        if (taskCount) {
          tasks = taskCount.filter((task) => {
            return (task.assignedUserIds || []).some((userId) =>
              selectedUserIds.includes(userId),
            );
          });
        } else {
          throw new Error('No tasks found based on the selected user IDs.');
        }
      }

      if (!Array.isArray(tasks)) {
        throw new Error('Invalid data: tasks is not an array.');
      }

      const taskCounts = calculateTicketCounts(tasks, selectedUserIds);

      const countsArray = Object.entries(taskCounts).map(
        ([ownerId, count]) => ({
          ownerId,
          count,
        }),
      );

      countsArray.sort((a, b) => b.count - a.count);

      const ownerIds = countsArray.map((item) => item.ownerId);

      const getTotalAssignedUsers = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: { _id: { $in: ownerIds } },
        },
        isRPC: true,
        defaultValue: [],
      });

      const assignedUsersMap = getTotalAssignedUsers.reduce((acc, user) => {
        acc[user._id] = user.details;
        return acc;
      }, {});

      const sort = ownerIds.map((ownerId) => {
        const user = assignedUsersMap[ownerId];
        const count = taskCounts[ownerId];

        if (user) {
          return {
            name: user.fullName,
            count: count || 0,
          };
        }
        return null;
      });

      const filteredSort = sort.filter((entry) => entry !== null);

      filteredSort.sort((a, b) => {
        if (a && b) {
          return a.count - b.count;
        }
        return 0;
      });

      const data = filteredSort.map((t: any) => t.count);
      const labels = filteredSort.map((t: any) => t.name);

      const title = 'All tasks incomplete by due date';

      const datasets = { title, data, labels };
      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TASK,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },

  {
    templateType: 'TasksIncompleteAssignedToTheTeamByDueDate',
    name: 'Tasks incomplete assigned to the team by due date',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        stageId,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const tasksCount = await models?.Tasks.find({
        ...query,
      }).lean();

      const taskCounts = departmentCount(tasksCount);

      // Convert the counts object to an array of objects with ownerId and count
      const countsArray = Object.entries(taskCounts).map(
        ([ownerId, count]) => ({
          ownerId,
          count,
        }),
      );
      countsArray.sort((a, b) => b.count - a.count);

      // Extract unique ownerIds for user lookup
      const ownerIds = countsArray.map((item) => item.ownerId);

      const departmentInfo = await sendCoreMessage({
        subdomain,
        action: `departments.find`,
        data: {
          _id: { $in: ownerIds || [] },
        },
        isRPC: true,
        defaultValue: [],
      });

      if (!departmentInfo || departmentInfo.length === 0) {
        // Handle the case where no labels are found
        return {
          title: '',
          data: [],
          departmentsIds: [],
          count: [],
        };
      }
      const enrichedTicketData = countsArray.map((item) => {
        const { ownerId } = item;

        const matchingLabel = departmentInfo.find(
          (label) => label && label._id === ownerId,
        );
        // Use the spread operator (...) to include all properties of the item object
        return {
          ...item,
          labels: matchingLabel ? [matchingLabel.title] : [],
        };
      });
      enrichedTicketData.sort((a, b) => a.count - b.count);
      const data = enrichedTicketData.map((t) => t.count);

      // Flatten the label array and remove any empty arrays
      const label = enrichedTicketData
        .map((t) => t.labels)
        .flat()
        .filter((item) => item.length > 0);
      const title = 'Tasks incomplete assigned to the team by due date';

      const datasets = { title, data, labels: label };

      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        fieldLabel: 'Select a board',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TASK,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },

  {
    templateType: 'TasksIncompleteAssignedToMeByDueDate',
    name: 'Tasks incomplete assigned to me by due date',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const selectedUserIds = filter.assignedUserIds || [];
      let tickets;

      tickets = await models?.Tasks.find({
        ...query,
      }).lean();

      // Calculate ticket counts
      const ticketCounts = calculateTicketCounts(tickets, selectedUserIds);
      // Convert the counts object to an array of objects with ownerId and count
      const countsArray = Object.entries(ticketCounts).map(
        // tslint:disable-next-line:no-shadowed-variable
        ([ownerId, count]) => ({
          ownerId,
          count,
        }),
      );
      // Sort the array based on ticket counts

      // Extract unique ownerIds for user lookup
      const ownerIds = countsArray.map((item) => item.ownerId);
      // Fetch information about assigned users
      const getTotalAssignedUsers = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: {
            _id: {
              $in: ownerIds,
            },
          },
        },
        isRPC: true,
        defaultValue: [],
      });
      // Create a map for faster user lookup
      const assignedUsersMap = getTotalAssignedUsers.reduce((acc, user) => {
        acc[user._id] = user.details; // Assuming details contains user information
        return acc;
      }, {});

      const sort = ownerIds.map((ownerId) => {
        const user = assignedUsersMap[ownerId];
        const count = ticketCounts[ownerId];

        if (user) {
          return {
            name: user.fullName,
            count: count || 0,
          };
        }

        return null;
      });

      // Filter out null entries
      const filteredSort = sort.filter((entry) => entry !== null);

      // Sort by count in ascending order
      filteredSort.sort((a, b) => {
        return (a?.count || 0) - (b?.count || 0);
      });

      // Extract data and labels
      const title = 'Tasks incomplete assigned to me by due date';
      const data = filteredSort.map((t) => t?.count || 0);
      const labels = filteredSort.map((t) => t?.name || '');

      const datasets = {
        title,
        data,
        labels,
      };
      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TASK,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },

  {
    templateType: 'TicketsStageDateRange',
    name: 'Tickets Stage Date Range',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const selectedUserIds = filter.assignedUserIds || [];
      const matchedFilter = await filterData(filter, subdomain);
      const { pipelineId, boardId, stageId, stageType } = filter;
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        stageId,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      let ticketCounts = await models?.Tickets.find({
        ...query,
      }).lean();

      if (ticketCounts) {
        const data = await Promise.all(
          ticketCounts.map(async (item) => {
            const getTotalRespondedUsers = await sendCoreMessage({
              subdomain,
              action: 'users.find',
              data: {
                query: {
                  _id:
                    selectedUserIds.length > 0
                      ? { $in: selectedUserIds }
                      : { $in: item.assignedUserIds },
                },
              },
              isRPC: true,
              defaultValue: [],
            });

            const processedUsers = await Promise.all(
              getTotalRespondedUsers.map(async (user) => {
                const fullName = user.details?.fullName || user.email;
                const counts = await models?.Tickets.countDocuments({
                  status: 'active',
                  assignedUserIds: user._id,
                });
                return {
                  FullName: fullName,
                  _id: user._id,
                  count: counts || 0,
                };
              }),
            );

            // Flatten the array of arrays and remove duplicates based on _id
            const uniqueData = processedUsers.reduce((acc, val) => {
              acc[val._id] = val;
              return acc;
            }, {});

            return Object.values(uniqueData);
          }),
        );

        const filteredData = data.filter((arr) => arr.length > 0);
        const uniqueUserEntries = Array.from(
          new Set(filteredData.map((entry) => JSON.stringify(entry))),
          (str) => JSON.parse(str),
        );

        const summedResultArray =
          await sumCountsByUserIdName(uniqueUserEntries);
        const filteredResult =
          selectedUserIds.length > 0
            ? summedResultArray.filter((user) =>
                selectedUserIds.includes(user._id),
              )
            : summedResultArray;

        filteredResult.sort((a, b) => a.count - b.count);

        // Extract sorted data and labels
        const setData = filteredResult.map((item: any) => item.count);
        const setLabels = filteredResult.map((item: any) => item.fullName);

        const title = 'Tickets Stage Date Range';
        const datasets = { title, data: setData, labels: setLabels };
        return datasets;
      } else {
        throw new Error('No dealCounts found');
      }
    },

    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,

        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TICKET,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },
  {
    templateType: 'TicketsCardCountAssignedUser',
    name: 'Tickets Count and  Assigned User',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const selectedUserIds = filter.assignedUserIds || [];
      const matchedFilter = await filterData(filter, subdomain);
      const { pipelineId, boardId, stageId, stageType } = filter;
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        stageId,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      let tickedCounts = await models?.Tickets.find({
        ...query,
      }).lean();

      if (tickedCounts) {
        const data = await Promise.all(
          tickedCounts.map(async (item) => {
            const getTotalRespondedUsers = await sendCoreMessage({
              subdomain,
              action: 'users.find',
              data: {
                query: {
                  _id:
                    selectedUserIds.length > 0
                      ? { $in: selectedUserIds }
                      : { $in: item.assignedUserIds },
                },
              },
              isRPC: true,
              defaultValue: [],
            });

            const processedUsers = await Promise.all(
              getTotalRespondedUsers.map(async (user) => {
                const fullName = user.details?.fullName || user.email;
                const counts = await models?.Tickets.countDocuments({
                  status: 'active',
                  assignedUserIds: user._id,
                });
                return {
                  FullName: fullName,
                  _id: user._id,
                  count: counts || 0,
                };
              }),
            );

            // Flatten the array of arrays and remove duplicates based on _id
            const uniqueData = processedUsers.reduce((acc, val) => {
              acc[val._id] = val;
              return acc;
            }, {});

            return Object.values(uniqueData);
          }),
        );

        const filteredData = data.filter((arr) => arr.length > 0);
        const uniqueUserEntries = Array.from(
          new Set(filteredData.map((entry) => JSON.stringify(entry))),
          (str) => JSON.parse(str),
        );

        const summedResultArray =
          await sumCountsByUserIdName(uniqueUserEntries);
        const filteredResult =
          selectedUserIds.length > 0
            ? summedResultArray.filter((user) =>
                selectedUserIds.includes(user._id),
              )
            : summedResultArray;

        filteredResult.sort((a, b) => a.count - b.count);

        // Extract sorted data and labels
        const setData = filteredResult.map((item: any) => item.count);
        const setLabels = filteredResult.map((item: any) => item.fullName);

        const title = 'Tickets Count and  Assigned User';
        const datasets = { title, data: setData, labels: setLabels };
        return datasets;
      } else {
        throw new Error('No dealCounts found');
      }
    },

    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TICKET,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },

  {
    templateType: 'TicketAverageTimeToCloseOverTime',
    name: 'Ticket average time to close over time',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      filter: any,
      models: IModels,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        stageId,
        PIPELINE_TYPE_TICKET,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const ticket = await models?.Tickets.find({
        ...query,
      }).lean();
      if (!ticket || ticket.length === 0) {
        throw new Error(
          'No ticket found in the database matching the specified criteria.',
        );
      }

      const title =
        'View the average amount of time it takes your reps to close tickets. See how this tracks over time.';
      const ticketData = await calculateAverageTimeToClose(ticket);

      // Create an array of objects containing both duration and label
      const dataWithLabels = ticketData.map((duration) => {
        const { hours, minutes, seconds } = convertHoursToHMS(duration);
        const label = `${hours}h ${minutes}m ${seconds}s`;
        return { duration, label };
      });

      // Sort the array based on duration
      dataWithLabels.sort((a, b) => a.duration - b.duration);

      // Extract sorted labels and durations
      const labels = dataWithLabels.map((entry) => entry.label);
      const sortedTicketData = dataWithLabels.map((entry) => entry.duration);

      const datasets = { title, ticketData: sortedTicketData, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TICKET,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },

  {
    templateType: 'TicketClosedTotalsByRep',
    name: 'Ticket closed totals by rep',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      filter: any,
      models: IModels,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        stageId,
        PIPELINE_TYPE_TICKET,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const selectedUserIds = filter.assignedUserIds || [];
      const tickets = await models?.Tickets.find({
        ...query,
      }).lean();

      // Calculate ticket counts
      const ticketCounts = calculateTicketCounts(tickets, selectedUserIds);
      // Convert the counts object to an array of objects with ownerId and count
      const countsArray = Object.entries(ticketCounts).map(
        // tslint:disable-next-line:no-shadowed-variable
        ([ownerId, count]) => ({
          ownerId,
          count,
        }),
      );

      // Sort the array based on ticket counts

      // Extract unique ownerIds for user lookup
      const ownerIds = countsArray.map((item) => item.ownerId);

      // Fetch information about assigned users
      const getTotalAssignedUsers = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: { _id: { $in: ownerIds } },
        },
        isRPC: true,
        defaultValue: [],
      });
      // Create a map for faster user lookup
      const assignedUsersMap = getTotalAssignedUsers.reduce((acc, user) => {
        acc[user._id] = user.details; // Assuming details contains user information
        return acc;
      }, {});

      const sort = ownerIds.map((ownerId) => {
        const user = assignedUsersMap[ownerId];
        const count = ticketCounts[ownerId];

        // Check if user exists and has a fullName property
        const name = user && user.fullName ? user.fullName : 'Unknown';

        return {
          name: name,
          count: count || 0, // Set count to 0 if not found in ticketCounts
        };
      });

      // Sort the array by count in descending order
      sort.sort((a, b) => b.count - a.count);

      const title =
        'View the total number of tickets closed by their assigned owner';

      // Reverse both data and labels arrays to achieve the desired order
      const data = sort.map((t: any) => t.count).reverse();
      const labels = sort.map((t: any) => t.name).reverse();

      const datasets = { title, data, labels };
      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TICKET,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },
  {
    templateType: 'TicketTotalsByStatus',
    name: 'Ticket totals by status',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      filter: any,
      models: IModels,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        stageId,
        PIPELINE_TYPE_TICKET,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const tickets = await models?.Tickets.find({
        ...query,
      }).lean();
      const ticketTotalsByStatus = calculateTicketTotalsByStatus(tickets);

      const countsArray: any[] = Object.entries(ticketTotalsByStatus).map(
        ([status, count]) => ({
          status,
          count: count as number, // Ensure count is recognized as a number
        }),
      );
      countsArray.sort((a, b) => b.count - a.count);

      const title =
        'View the total number of tickets in each part of your support queue';
      countsArray.sort((a, b) => b.count - a.count);
      const labels = Object.values(countsArray).map((t: any) => t.status);
      const data = Object.values(countsArray).map((t: any) => t.count);

      const datasets = { title, data, labels };
      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TICKET,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },

  {
    templateType: 'TicketTotalsOverTime',
    name: 'Ticket totals over time',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],

    // Bar Chart Table
    getChartResult: async (
      filter: any,
      models: IModels,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        stageId,
        PIPELINE_TYPE_TICKET,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const totalTicked = await models?.Tickets.find({
        ...query,
      }).sort({
        createdAt: -1,
      });

      const monthNames: string[] = [];
      const monthlyTickedCount: number[] = [];

      if (totalTicked) {
        const now = new Date(); // Get the current date
        const startOfYear = new Date(now.getFullYear(), 0, 1); // Get the start of the year
        const endOfYear = new Date(now.getFullYear(), 12, 31); // Get the start of the year
        const endRange = dayjs(
          new Date(totalTicked.at(-1)?.createdAt || endOfYear),
        );

        let startRange = dayjs(startOfYear);

        while (startRange < endRange) {
          monthNames.push(startRange.format('MMMM'));

          const getStartOfNextMonth = startRange.add(1, 'month').toDate();
          const getTickedCountOfMonth = totalTicked.filter(
            (ticked) =>
              new Date(ticked.createdAt || '').getTime() >=
                startRange.toDate().getTime() &&
              new Date(ticked.createdAt || '').getTime() <
                getStartOfNextMonth.getTime(),
          );
          monthlyTickedCount.push(getTickedCountOfMonth.length);
          startRange = startRange.add(1, 'month');
        }
      }
      const label = 'View the total number of tickets created over a set time';
      const datasets = [
        { label, data: monthlyTickedCount, labels: monthNames },
      ];
      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TICKET,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },
  {
    templateType: 'TicketTotalsByLabelPriorityTag',
    name: 'Ticket totals by label/priority/tag/',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],

    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const tickets = await models?.Tickets.find({
        ...query,
      }).lean();

      if (!Array.isArray(tickets)) {
        throw new Error('Invalid data: tickets is not an array.');
      }

      // Calculate ticket totals by label, priority, and tag
      const ticketTotals = calculateTicketTotalsByLabelPriorityTag(tickets);
      let labelIds: string[] = [];
      let tagIds: string[] = [];
      let priorities: string[] = [];

      Object.entries(ticketTotals).forEach(([key, value]) => {
        if (key.startsWith('labelIds:')) {
          labelIds.push(key.replace('labelIds:', ''));
        } else if (key.startsWith('tagIds:')) {
          tagIds.push(key.replace('tagIds:', ''));
        } else if (key.startsWith('priority:')) {
          priorities.push(key.replace('priority:', ''));
        }
      });

      // Remove single quotes from both tagIds and labelIds
      tagIds = tagIds.map((tagId) => tagId.replace(/'/g, ''));
      labelIds = labelIds.map((labelId) => labelId.replace(/'/g, ''));
      priorities = priorities.map((priority) => priority.replace(/'/g, ''));

      const tagInfo = await sendTagsMessage({
        subdomain,
        action: 'find',
        data: {
          _id: { $in: tagIds || [] },
        },
        isRPC: true,
        defaultValue: [],
      });
      const tagNames = tagInfo.map((tag) => tag.name);

      const labels = await models?.PipelineLabels.find({
        _id: { $in: labelIds },
      });
      if (!labels || labels.length === 0) {
        return { title: '', data: [], labels: [] };
      }
      const labelNames = labels.map((label) => label.name);

      const allLabels = [...priorities, ...labelNames, ...tagNames];

      const simplifiedLabels = allLabels.map((label) =>
        label.replace(/(labelIds:|tagIds:|')/g, ''),
      );

      const title =
        '  View the total number of ticket totals by label/priority/tag/ ';

      const data = Object.values(ticketTotals);

      const datasets = { title, data, labels: simplifiedLabels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TICKET,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },
  {
    templateType: 'TicketAverageTimeToCloseByRep',
    name: 'Ticket average time to close by rep',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      filter: any,
      models: IModels,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageType, stageId } = filter;
      const selectedUserIds = filter.assignedUserIds || [];
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      let tickets;

      tickets = await models?.Tickets.find({
        ...query,
      });
      const ticketData = await calculateAverageTimeToCloseUser(
        tickets,
        selectedUserIds,
      );

      const getTotalAssignedUsers = await Promise.all(
        tickets.map(async (result) => {
          return await sendCoreMessage({
            subdomain,
            action: 'users.find',
            data: {
              query: {
                _id:
                  selectedUserIds.length > 0
                    ? { $in: selectedUserIds }
                    : { $in: result.assignedUserIds },
              },
            },
            isRPC: true,
            defaultValue: [],
          });
        }),
      );

      const result: any[] = [];
      const uniqueUserIds = new Set();

      for (const assignedUser of getTotalAssignedUsers) {
        assignedUser.forEach((itemsAdd) => {
          // Use forEach instead of map
          const ticket = ticketData?.find((item) =>
            item.assignedUserIds.includes(itemsAdd._id),
          );

          if (ticket && !uniqueUserIds.has(itemsAdd._id)) {
            uniqueUserIds.add(itemsAdd._id); // Add the user ID to the Set
            result.push({
              timeDifference: ticket.timeDifference,
              assignedUserIds: ticket.assignedUserIds,
              FullName: itemsAdd.details?.fullName || '',
            });
          }
        });
      }
      result.sort((a, b) => a.timeDifference - b.timeDifference);

      const data = Object.values(result).map((t: any) => t.timeDifference);
      const labels = Object.values(result).map((t: any) => t.FullName);

      const title =
        'View the average amount of time it takes for a rep to close a ticket';

      const datasets = {
        title,
        data,
        labels,
      };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TICKET,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },
  {
    templateType: 'TicketTotalsBySource',
    name: 'Ticket totals by source',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Table
    getChartResult: async (
      filter: any,
      models: IModels,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const ticket = await models?.Tickets.find({
        ...query,
        sourceConversationIds: { $exists: true, $ne: [] },
      }).lean();
      if (!ticket || ticket.length === 0) {
        throw new Error(
          'No ticket found in the database matching the specified criteria.',
        );
      }
      const data = [ticket.length];
      const labels = ['total'];
      const title = 'Ticket totals by source';

      const datasets = [{ title, data, labels }];
      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TICKET,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },

  {
    templateType: 'TicketAverageTimeToClose',
    name: 'Ticket average time to close',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Table
    getChartResult: async (
      filter: any,
      models: IModels,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;
      const matchedFilter = await filterData(filter, subdomain);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageId,
        stageType,
        PIPELINE_TYPE_DEAL,
        models,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const ticket = await models?.Tickets.find({
        ...query,
      }).lean();
      if (!ticket || ticket.length === 0) {
        throw new Error(
          'No ticket found in the database matching the specified criteria.',
        );
      }
      const data = await calculateAverageTimeToClose(ticket);

      const dataWithLabels = data.map((duration) => {
        const { hours, minutes, seconds } = convertHoursToHMS(duration);
        const label = `${hours}h ${minutes}m ${seconds}s`;
        return { duration, label };
      });

      dataWithLabels.sort((a, b) => a.duration - b.duration);

      const labels = dataWithLabels.map((entry) => entry.label);
      const sortedData = dataWithLabels.map((entry) => entry.duration);

      const title =
        'View the average amount of time it takes for your reps to close tickets';

      const datasets = { title, data: sortedData, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
      {
        fieldName: 'stageType',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PROBABILITY_TICKET,
        fieldLabel: 'Select Probability',
      },
      {
        fieldName: 'priority',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'stages',
        fieldOptions: PRIORITY,
        fieldLabel: 'Select Stage priority',
      },
    ],
  },
  {
    templateType: 'DealCountInEachPipeline',
    name: 'Deal Count In Each Pipeline',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;

      const matchedFilter = await filterData(filter, subdomain);

      const boards = await models?.Boards.find()

      const boardIds = (boards || []).map(board => board._id)

      const pipeline = [
        {
          $match: {
            ...matchedFilter,
            status: "active",
          },
        },
        {
          $group: {
            _id: "$stageId",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "stages",
            let: { stageId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$stageId"] },
                  type: PIPELINE_TYPE_DEAL,
                  ...(pipelineId ? { pipelineId: pipelineId } : {}),
                },
              },
              {
                $lookup: {
                  from: "pipelines",
                  let: { pipelineId: "$pipelineId" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$_id", "$$pipelineId"] },
                        type: PIPELINE_TYPE_DEAL,
                        status: "active",
                        boardId: {
                          $in: boardId ? [boardId] : boardIds,
                        },
                        ...(pipelineId ? { _id: pipelineId } : {}),
                      },
                    },
                  ],
                  as: "pipeline",
                },
              },
              { $unwind: "$pipeline" },
            ],
            as: "stage",
          },
        },
        { $unwind: "$stage" },
        {
          $group: {
            _id: "$stage.pipeline._id",
            name: { $first: "$stage.pipeline.name" },
            count: { $sum: "$count" },
          },
        },
        {
          $project: {
            _id: 0,
            pipeline: "$name",
            count: 1,
          },
        },
      ]

      const deals = await models.Deals.aggregate(pipeline)

      const dealCountByPipeline = (deals || []).reduce((acc, { pipeline, count }) => {
        acc[pipeline] = count

        return acc
      }, {})

      const getTotalDeals = Object.values(dealCountByPipeline);
      const getTotalIds = Object.keys(dealCountByPipeline);

      const data = getTotalDeals;
      const labels = getTotalIds;

      const title = 'Deal Count In Each Pipeline';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'attachment',
        fieldType: 'select',
        fieldOptions: ATTACHMENT_TYPES,
        fieldLabel: 'Select attachment',
      },
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
    ],
  },
  {
    templateType: 'TaskCountInEachPipeline',
    name: 'Task Count In Each Pipeline',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;

      const matchedFilter = await filterData(filter, subdomain);

      const boards = await models?.Boards.find()

      const boardIds = (boards || []).map(board => board._id)

      const pipeline = [
        {
          $match: {
            ...matchedFilter,
            status: "active",
          },
        },
        {
          $group: {
            _id: "$stageId",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "stages",
            let: { stageId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$stageId"] },
                  type: PIPELINE_TYPE_TASK,
                  ...(pipelineId ? { pipelineId: pipelineId } : {}),
                },
              },
              {
                $lookup: {
                  from: "pipelines",
                  let: { pipelineId: "$pipelineId" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$_id", "$$pipelineId"] },
                        type: PIPELINE_TYPE_TASK,
                        status: "active",
                        boardId: {
                          $in: boardId ? [boardId] : boardIds,
                        },
                        ...(pipelineId ? { _id: pipelineId } : {}),
                      },
                    },
                  ],
                  as: "pipeline",
                },
              },
              { $unwind: "$pipeline" },
            ],
            as: "stage",
          },
        },
        { $unwind: "$stage" },
        {
          $group: {
            _id: "$stage.pipeline._id",
            name: { $first: "$stage.pipeline.name" },
            count: { $sum: "$count" },
          },
        },
        {
          $project: {
            _id: 0,
            pipeline: "$name",
            count: 1,
          },
        },
      ]

      const tasks = await models.Tasks.aggregate(pipeline)

      const taskCountByPipeline = (tasks || []).reduce((acc, { pipeline, count }) => {
        acc[pipeline] = count

        return acc
      }, {})

      const getTotalTasks = Object.values(taskCountByPipeline);
      const getTotalIds = Object.keys(taskCountByPipeline);

      const data = getTotalTasks;
      const labels = getTotalIds;

      const title = 'Task Count In Each Pipeline';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'attachment',
        fieldType: 'select',
        fieldOptions: ATTACHMENT_TYPES,
        fieldLabel: 'Select attachment',
      },
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
    ],
  },
  {
    templateType: 'TicketCountInEachPipeline',
    name: 'Ticket Count In Each Pipeline',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType } = filter;

      const matchedFilter = await filterData(filter, subdomain);

      const boards = await models?.Boards.find()

      const boardIds = (boards || []).map(board => board._id)

      const pipeline = [
        {
          $match: {
            ...matchedFilter,
            status: "active",
          },
        },
        {
          $group: {
            _id: "$stageId",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "stages",
            let: { stageId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$stageId"] },
                  type: PIPELINE_TYPE_TICKET,
                  ...(pipelineId ? { pipelineId: pipelineId } : {}),
                },
              },
              {
                $lookup: {
                  from: "pipelines",
                  let: { pipelineId: "$pipelineId" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$_id", "$$pipelineId"] },
                        type: PIPELINE_TYPE_TICKET,
                        status: "active",
                        boardId: {
                          $in: boardId ? [boardId] : boardIds,
                        },
                        ...(pipelineId ? { _id: pipelineId } : {}),
                      },
                    },
                  ],
                  as: "pipeline",
                },
              },
              { $unwind: "$pipeline" },
            ],
            as: "stage",
          },
        },
        { $unwind: "$stage" },
        {
          $group: {
            _id: "$stage.pipeline._id",
            name: { $first: "$stage.pipeline.name" },
            count: { $sum: "$count" },
          },
        },
        {
          $project: {
            _id: 0,
            pipeline: "$name",
            count: 1,
          },
        },
      ]

      const tickets = await models.Tickets.aggregate(pipeline)

      const ticketCountByPipeline = (tickets || []).reduce((acc, { pipeline, count }) => {
        acc[pipeline] = count

        return acc
      }, {})

      const getTotalTickets = Object.values(ticketCountByPipeline);
      const getTotalIds = Object.keys(ticketCountByPipeline);

      const data = getTotalTickets;
      const labels = getTotalIds;

      const title = 'Ticket Count In Each Pipeline';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'attachment',
        fieldType: 'select',
        fieldOptions: ATTACHMENT_TYPES,
        fieldLabel: 'Select attachment',
      },
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },
    ],
  },
  {
    templateType: 'DealCountByCompanies',
    name: 'Deal Count By Companies',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType, companyIds } = filter;

      const matchedFilter = await filterData(filter, subdomain);

      if (boardId || pipelineId || stageId) {
        const stageIds = await getStageIds(filter, PIPELINE_TYPE_DEAL, models)
        matchedFilter['stageId'] = { $in: stageIds }
      }

      const pipeline = [
        {
          $match: { ...matchedFilter, status: "active" }
        },
        {
          $lookup: {
            from: "conformities",
            let: { dealId: "$_id" },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ["$mainType", "deal"],
                      },
                    },
                    {
                      $expr: {
                        $eq: [
                          "$mainTypeId",
                          "$$dealId",
                        ],
                      },
                    },
                    {
                      $expr: {
                        $eq: ["$relType", "company"],
                      },
                    },
                    (companyIds && companyIds.length ? {
                      $expr: {
                        $in: [
                          "$relTypeId",
                          companyIds,
                        ],
                      },
                    } : {})
                  ],
                },
              },
            ],
            as: "conformity",
          },
        },
        {
          $unwind: "$conformity",
        },
        {
          $group: {
            _id: "$conformity.relTypeId",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "companies",
            let: { companyId: "$_id" },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ["$_id", "$$companyId"],
                      },
                    },
                  ],
                },
              },
            ],
            as: "company",
          },
        },
        {
          $unwind: "$company",
        },
        {
          $project: {
            _id: 0,
            company: "$company.primaryName",
            count: 1,
          },
        }
      ]

      const deals = await models.Deals.aggregate(pipeline)

      const dealCountByCompany = (deals || []).reduce((acc, { company, count }) => {
        acc[company] = count

        return acc
      }, {})

      const getTotalDeals = Object.values(dealCountByCompany);
      const getTotalIds = Object.keys(dealCountByCompany);

      const data = getTotalDeals;
      const labels = getTotalIds;

      const title = 'Deal Count By Company';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'attachment',
        fieldType: 'select',
        fieldOptions: ATTACHMENT_TYPES,
        fieldLabel: 'Select attachment',
      },
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'companyIds',
        fieldType: 'select',
        fieldQuery: 'companies',
        multi: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'primaryName',
        fieldQueryVariables: `{"conformityMainType": "${PIPELINE_TYPE_DEAL}", "conformityRelType": "company"}`,
        fieldLabel: 'Select companies',
      },
      {
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },

    ],
  },
  {
    templateType: 'TaskCountByCompanies',
    name: 'Task Count By Companies',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId, stageType, companyIds } = filter;

      const matchedFilter = await filterData(filter, subdomain);

      if (boardId || pipelineId || stageId) {
        const stageIds = await getStageIds(filter, PIPELINE_TYPE_TASK, models)
        matchedFilter['stageId'] = { $in: stageIds }
      }

      const pipeline = [
        {
          $match: { ...matchedFilter, status: "active" }
        },
        {
          $lookup: {
            from: "conformities",
            let: { taskId: "$_id" },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ["$mainType", "task"],
                      },
                    },
                    {
                      $expr: {
                        $eq: [
                          "$mainTypeId",
                          "$$taskId",
                        ],
                      },
                    },
                    {
                      $expr: {
                        $eq: ["$relType", "company"],
                      },
                    },
                    (companyIds && companyIds.length ? {
                      $expr: {
                        $in: [
                          "$relTypeId",
                          companyIds,
                        ],
                      },
                    } : {})
                  ],
                },
              },
            ],
            as: "conformity",
          },
        },
        {
          $unwind: "$conformity",
        },
        {
          $group: {
            _id: "$conformity.relTypeId",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "companies",
            let: { companyId: "$_id" },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ["$_id", "$$companyId"],
                      },
                    },
                  ],
                },
              },
            ],
            as: "company",
          },
        },
        {
          $unwind: "$company",
        },
        {
          $project: {
            _id: 0,
            company: "$company.primaryName",
            count: 1,
          },
        }
      ]

      const tasks = await models.Tasks.aggregate(pipeline)

      const taskCountByCompany = (tasks || []).reduce((acc, { company, count }) => {
        acc[company] = count

        return acc
      }, {})

      const getTotalTasks = Object.values(taskCountByCompany);
      const getTotalIds = Object.keys(taskCountByCompany);

      const data = getTotalTasks;
      const labels = getTotalIds;

      const title = 'Task Count By Company';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'attachment',
        fieldType: 'select',
        fieldOptions: ATTACHMENT_TYPES,
        fieldLabel: 'Select attachment',
      },
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'companyIds',
        fieldType: 'select',
        fieldQuery: 'companies',
        multi: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'primaryName',
        fieldQueryVariables: `{"conformityMainType": "${PIPELINE_TYPE_TASK}", "conformityRelType": "company"}`,
        fieldLabel: 'Select companies',
      },
      {
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },

    ],
  },
  {
    templateType: 'TicketCountByCompanies',
    name: 'Ticket Count By Companies',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    // Bar Chart Table
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { pipelineId, boardId, stageId } = filter;

      const matchedFilter = await filterData(filter, subdomain);

      if (boardId || pipelineId || stageId) {
        const stageIds = await getStageIds(filter, PIPELINE_TYPE_TICKET, models)
        matchedFilter['stageId'] = { $in: stageIds }
      }

      const pipeline = [
        {
          $match: { ...matchedFilter, status: "active" }
        },
        {
          $lookup: {
            from: "conformities",
            let: { ticketId: "$_id" },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ["$mainType", "ticket"],
                      },
                    },
                    {
                      $expr: {
                        $eq: [
                          "$mainTypeId",
                          "$$ticketId",
                        ],
                      },
                    },
                    {
                      $expr: {
                        $eq: ["$relType", "company"],
                      },
                    },

                  ],
                },
              },
            ],
            as: "conformity",
          },
        },
        {
          $unwind: "$conformity",
        },
        {
          $group: {
            _id: "$conformity.relTypeId",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "companies",
            let: { companyId: "$_id" },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      $expr: {
                        $eq: ["$_id", "$$companyId"],
                      },
                    },
                  ],
                },
              },
            ],
            as: "company",
          },
        },
        {
          $unwind: "$company",
        },
        {
          $project: {
            _id: 0,
            company: "$company.primaryName",
            count: 1,
          },
        }
      ]

      const tickets = await models.Tickets.aggregate(pipeline)

      const ticketCountByCompany = (tickets || []).reduce((acc, { company, count }) => {
        acc[company] = count

        return acc
      }, {})

      const getTotalTicketss = Object.values(ticketCountByCompany);
      const getTotalIds = Object.keys(ticketCountByCompany);

      const data = getTotalTicketss;
      const labels = getTotalIds;

      const title = 'Ticket Count By Company';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'attachment',
        fieldType: 'select',
        fieldOptions: ATTACHMENT_TYPES,
        fieldLabel: 'Select attachment',
      },
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'companyIds',
        fieldType: 'select',
        fieldQuery: 'companies',
        multi: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'primaryName',
        fieldQueryVariables: `{"conformityMainType": "${PIPELINE_TYPE_TICKET}", "conformityRelType": "company"}`,
        fieldLabel: 'Select companies',
      },
      {
        fieldName: 'boardId',
        fieldType: 'select',
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        fieldLabel: 'Select boards',
      },
      {
        fieldName: 'pipelineId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageId',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: false,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        logics: [
          {
            logicFieldName: 'pipelineId',
            logicFieldVariable: 'pipelineId',
          },
        ],
        fieldLabel: 'Select stage',
      },

    ],
  },
  {
    templateType: 'DealCountInEachStage',
    name: "Deal Count In Each Stage",
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { boardId } = filter;

      const matchedFilter = await filterData(filter, subdomain);

      const pipelines = await models.Pipelines.find(
        boardId ? { boardId: { $eq: boardId } } : {}
      )

      const pipelineIds = filter.pipelineIds || (pipelines || []).map(pipeline => pipeline._id)

      const pipeline = [
        {
          $match: {
            ...matchedFilter,
            status: "active",
          },
        },
        {
          $group: {
            _id: "$stageId",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "stages",
            let: { stageId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$stageId"] },
                      { $eq: ['$type', PIPELINE_TYPE_DEAL] },
                      ...(pipelineIds && pipelineIds.length ? [{ $in: ["$pipelineId", pipelineIds] }] : []),
                    ]
                  }
                }
              }
            ],
            as: "stage"
          }
        },
        {
          $unwind: "$stage"
        },
        {
          $project: {
            _id: 0,
            stage: "$stage.name",
            count: 1
          }
        }
      ]

      const deals = await models.Deals.aggregate(pipeline)

      const dealCountByStage = (deals || []).reduce((acc, { stage, count }) => {
        acc[stage] = (acc[stage] || 0) + count;
        return acc
      }, {})

      const getTotalDeals = Object.values(dealCountByStage);
      const getTotalIds = Object.keys(dealCountByStage);

      const data = getTotalDeals;
      const labels = getTotalIds;

      const title = 'Deal Count In Each Stage';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'attachment',
        fieldType: 'select',
        fieldOptions: ATTACHMENT_TYPES,
        fieldLabel: 'Select attachment',
      },
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        fieldLabel: 'Select board',
      },
      {
        fieldName: 'pipelineIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_DEAL}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageIds',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        fieldParentQuery: "pipelines",
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'Select stage',
      },
    ]
  },
  {
    templateType: 'TaskCountInEachStage',
    name: "Task Count In Each Stage",
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { boardId } = filter;

      const matchedFilter = await filterData(filter, subdomain);

      const pipelines = await models.Pipelines.find(
        boardId ? { boardId: { $eq: boardId } } : {}
      )

      const pipelineIds = filter.pipelineIds || (pipelines || []).map(pipeline => pipeline._id)

      const pipeline = [
        {
          $match: {
            ...matchedFilter,
            status: "active",
          },
        },
        {
          $group: {
            _id: "$stageId",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "stages",
            let: { stageId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$stageId"] },
                      { $eq: ['$type', PIPELINE_TYPE_TASK] },
                      ...(pipelineIds && pipelineIds.length ? [{ $in: ["$pipelineId", pipelineIds] }] : []),
                    ]
                  }
                }
              }
            ],
            as: "stage"
          }
        },
        {
          $unwind: "$stage"
        },
        {
          $project: {
            _id: 0,
            stage: "$stage.name",
            count: 1
          }
        }
      ]

      const tasks = await models.Tasks.aggregate(pipeline)

      const taskCountByStage = (tasks || []).reduce((acc, { stage, count }) => {
        acc[stage] = (acc[stage] || 0) + count;
        return acc
      }, {})

      const getTotalTasks = Object.values(taskCountByStage);
      const getTotalIds = Object.keys(taskCountByStage);

      const data = getTotalTasks;
      const labels = getTotalIds;

      const title = 'Task Count In Each Stage';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'attachment',
        fieldType: 'select',
        fieldOptions: ATTACHMENT_TYPES,
        fieldLabel: 'Select attachment',
      },
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        fieldLabel: 'Select board',
      },
      {
        fieldName: 'pipelineIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TASK}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageIds',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        fieldParentQuery: "pipelines",
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'Select stage',
      },
    ]
  },
  {
    templateType: 'TicketCountInEachStage',
    name: "Ticket Count In Each Stage",
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string,
    ) => {
      const { boardId } = filter;

      const matchedFilter = await filterData(filter, subdomain);

      const pipelines = await models.Pipelines.find(
        boardId ? { boardId: { $eq: boardId } } : {}
      )

      const pipelineIds = filter.pipelineIds || (pipelines || []).map(pipeline => pipeline._id)

      const pipeline = [
        {
          $match: {
            ...matchedFilter,
            status: "active",
          },
        },
        {
          $group: {
            _id: "$stageId",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "stages",
            let: { stageId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$stageId"] },
                      { $eq: ['$type', PIPELINE_TYPE_TICKET] },
                      ...(pipelineIds && pipelineIds.length ? [{ $in: ["$pipelineId", pipelineIds] }] : []),
                    ]
                  }
                }
              }
            ],
            as: "stage"
          }
        },
        {
          $unwind: "$stage"
        },
        {
          $project: {
            _id: 0,
            stage: "$stage.name",
            count: 1
          }
        }
      ]

      const tickets = await models.Tickets.aggregate(pipeline)

      const ticketCountByStage = (tickets || []).reduce((acc, { stage, count }) => {
        acc[stage] = (acc[stage] || 0) + count;
        return acc
      }, {})

      const getTotalTickets = Object.values(ticketCountByStage);
      const getTotalIds = Object.keys(ticketCountByStage);

      const data = getTotalTickets;
      const labels = getTotalIds;

      const title = 'Ticket Count In Each Stage';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'attachment',
        fieldType: 'select',
        fieldOptions: ATTACHMENT_TYPES,
        fieldLabel: 'Select attachment',
      },
      {
        fieldName: 'assignedUserIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select assigned users',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATE_RANGE_TYPES,
        fieldLabel: 'Select date range',
        fieldDefaultValue: 'all',
      },
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
        fieldName: 'boardId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'boards',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        fieldLabel: 'Select board',
      },
      {
        fieldName: 'pipelineIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'pipelines',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${PIPELINE_TYPE_TICKET}"}`,
        logics: [
          {
            logicFieldName: 'boardId',
            logicFieldVariable: 'boardId',
          },
        ],
        fieldLabel: 'Select pipeline',
      },
      {
        fieldName: 'stageIds',
        fieldType: 'select',
        fieldQuery: 'stages',
        multi: true,
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldParentVariable: 'pipelineId',
        fieldParentQuery: "pipelines",
        logics: [
          {
            logicFieldName: 'pipelineIds',
            logicFieldVariable: 'pipelineIds',
          },
        ],
        fieldLabel: 'Select stage',
      },
    ]
  }
];

const getChartResult = async ({ subdomain, data }) => {
  const models = await generateModels(subdomain);
  const { templateType, filter, dimension } = data;

  const template =
    chartTemplates.find((t) => t.templateType === templateType) || ({} as any);

  return template.getChartResult(models, filter, dimension, subdomain);
};

export default {
  chartTemplates,
  reportTemplates,
  getChartResult,
};

function taskClosedByRep(tickets: any) {
  // tslint:disable-next-line:no-shadowed-variable
  const ticketCounts: Record<string, number> = {};

  // Check if tickets is an array
  if (!Array.isArray(tickets)) {
  }

  tickets.forEach((ticket) => {
    const labelIds = (ticket.labelIds as string[]) || [];

    if (labelIds.length === 0) {
      return;
    }
    labelIds.forEach((ownerId) => {
      ticketCounts[ownerId] = (ticketCounts[ownerId] || 0) + 1;
    });
  });

  return ticketCounts;
}

function taskClosedByTagsRep(tasks: any) {
  // tslint:disable-next-line:no-shadowed-variable
  const ticketCounts: Record<string, number> = {};

  // Check if tickets is an array
  if (!Array.isArray(tasks)) {
    throw new Error('Invalid input: tasks should be an array.');
  }

  tasks.forEach((ticket) => {
    const tagIds = (ticket.tagIds as string[]) || [];

    if (tagIds.length === 0) {
      return;
    }
    tagIds.forEach((ownerId) => {
      ticketCounts[ownerId] = (ticketCounts[ownerId] || 0) + 1;
    });
  });

  return ticketCounts;
}

function departmentCount(tasks: any) {
  // tslint:disable-next-line:no-shadowed-variable
  const taskCounts: Record<string, number> = {};

  // Check if tasks is an array
  if (!Array.isArray(tasks)) {
    throw new Error('Invalid input: tasks should be an array.');
  }

  tasks.forEach((task) => {
    const tagIds = (task.departmentIds as string[]) || [];

    if (tagIds.length === 0) {
      return;
    }
    tagIds.forEach((ownerId) => {
      taskCounts[ownerId] = (taskCounts[ownerId] || 0) + 1;
    });
  });

  return taskCounts;
}

function calculateTicketCounts(tickets: any, selectedUserIds: any) {
  // tslint:disable-next-line:no-shadowed-variable
  const ticketCounts: Record<string, number> = {};

  // Check if tickets is an array
  if (!Array.isArray(tickets)) {
    throw new Error('Invalid input: tickets should be an array.');
  }
  if (selectedUserIds.length > 0) {
    selectedUserIds.forEach((userId) => {
      ticketCounts[userId] = 0;
    });
  }

  tickets.forEach((ticket) => {
    const assignedUserIds = (ticket.assignedUserIds as string[]) || [];

    if (assignedUserIds.length === 0) {
      return;
    }
    if (selectedUserIds.length > 0) {
      assignedUserIds.forEach((ownerId) => {
        if (selectedUserIds.includes(ownerId)) {
          ticketCounts[ownerId] = (ticketCounts[ownerId] || 0) + 1;
        }
      });
    } else {
      assignedUserIds.forEach((ownerId) => {
        ticketCounts[ownerId] = (ticketCounts[ownerId] || 0) + 1;
      });
    }
  });

  return ticketCounts;
}

function amountProductData(deals: any[]): Promise<any[]> {
  return new Promise((resolve) => {
    const repAmounts: Record<string, any> = {};

    deals.forEach((deal) => {
      if (deal.productsData) {
        const { productsData } = deal;
        productsData.forEach((product) => {
          if (product.amount) {
            if (!repAmounts[deal.stageId]) {
              repAmounts[deal.stageId] = {
                totalAmount: 0,
                stageId: deal.stageId,
              };
            }

            repAmounts[deal.stageId].totalAmount += product.amount;
          }
        });
      }
    });

    // Convert the repAmounts object into an array
    const resultArray = Object.values(repAmounts);

    resolve(resultArray);
  });
}

// Function to calculate the average deal amounts by rep
function calculateAverageDealAmountByRep(deals: any, selectedUserIds: any) {
  const repAmounts = {};
  const dealCounts: Record<string, number> = {};

  if (selectedUserIds.length > 0) {
    selectedUserIds.forEach((userId) => {
      repAmounts[userId] = { totalAmount: 0, count: 0 };
      dealCounts[userId] = 0;
    });
  }
  deals.forEach((deal) => {
    if (deal.productsData && deal.status === 'active') {
      const { productsData } = deal;

      productsData.forEach((product) => {
        if (product.amount) {
          const { assignedUserIds } = deal;
          if (selectedUserIds.length > 0) {
            assignedUserIds.forEach((userId) => {
              if (selectedUserIds.includes(userId)) {
                repAmounts[userId] = repAmounts[userId] || {
                  totalAmount: 0,
                  count: 0,
                };
                repAmounts[userId].totalAmount += product.amount;
                repAmounts[userId].count += 1;

                // If you want counts for each user, increment the deal count
                dealCounts[userId] = (dealCounts[userId] || 0) + 1;
              }
            });
          } else {
            assignedUserIds.forEach((userId) => {
              repAmounts[userId] = repAmounts[userId] || {
                totalAmount: 0,
                count: 0,
              };
              repAmounts[userId].totalAmount += product.amount;
              repAmounts[userId].count += 1;
            });
          }
        }
      });
    }
  });

  const result: Array<{ userId: string; amount: string }> = [];

  // tslint:disable-next-line:forin
  for (const userId in repAmounts) {
    const { totalAmount, count } = repAmounts[userId];
    const averageAmount = count > 0 ? totalAmount / count : 0;

    result.push({ userId, amount: averageAmount.toFixed(3) });
  }

  return result;
}

function calculateTicketTotalsByStatus(tickets: any) {
  const ticketTotals = {};

  // Loop through tickets
  tickets.forEach((ticket) => {
    const { status } = ticket;

    // Check if status exists
    if (status !== undefined && status !== null) {
      // Initialize or increment status count
      ticketTotals[status] = (ticketTotals[status] || 0) + 1;
    }
  });

  // Return the result
  return ticketTotals;
}

function calculateTicketTotalsByLabelPriorityTag(tickets: any) {
  return tickets.reduce((ticketTotals: Record<string, number>, ticket) => {
    const labels = ticket.labelIds || [];
    const priority = ticket.priority || 'Default'; // Replace 'Default' with the default priority if not available
    const tags = ticket.tagIds || [];
    // Increment counts for each label
    labels.forEach((label) => {
      const labelKey = `labelIds:'${label}'`;
      ticketTotals[labelKey] = (ticketTotals[labelKey] || 0) + 1;
    });
    // Increment counts for each priority
    const priorityKey = `priority:'${priority}'`;
    ticketTotals[priorityKey] = (ticketTotals[priorityKey] || 0) + 1;

    // Increment counts for each tag
    tags.forEach((tag) => {
      const tagKey = `tagIds:'${tag}'`;
      ticketTotals[tagKey] = (ticketTotals[tagKey] || 0) + 1;
    });

    return ticketTotals;
  }, {});
}

const calculateAverageTimeToClose = (tickets) => {
  // Filter out tickets without close dates
  const closedTickets = tickets.filter(
    (ticketItem) => ticketItem.modifiedAt && ticketItem.createdAt,
  );

  if (closedTickets.length === 0) {
    throw new Error('No closed tickets found.');
  }

  // Calculate time to close for each ticket in milliseconds
  const timeToCloseArray = closedTickets.map((ticketItem) => {
    const createdAt = new Date(ticketItem.createdAt).getTime();
    const modifiedAt = new Date(ticketItem.modifiedAt).getTime();

    // Check if both dates are valid
    if (!isNaN(createdAt) && !isNaN(modifiedAt)) {
      return modifiedAt - createdAt;
    }
  });

  // Filter out invalid date differences
  const validTimeToCloseArray = timeToCloseArray.filter(
    (time) => time !== null,
  );

  if (validTimeToCloseArray.length === 0) {
    throw new Error('No valid time differences found.');
  }

  const timeToCloseInHoursArray = validTimeToCloseArray.map((time) =>
    (time / (1000 * 60 * 60)).toFixed(3),
  );

  return timeToCloseInHoursArray;
};
function convertHoursToHMS(durationInHours) {
  const hours = Math.floor(durationInHours);
  const minutes = Math.floor((durationInHours - hours) * 60);
  const seconds = Math.floor(((durationInHours - hours) * 60 - minutes) * 60);

  return { hours, minutes, seconds };
}
const taskAverageTimeToCloseByLabel = async (tasks) => {
  const closedTasks = tasks.filter(
    (ticketItem) => ticketItem.modifiedAt && ticketItem.createdAt,
  );

  if (closedTasks.length === 0) {
    throw new Error('No closed Tasks found.');
  }

  // Calculate time to close for each ticket in milliseconds
  const timeToCloseArray = closedTasks.map((ticketItem) => {
    const createdAt = new Date(ticketItem.createdAt).getTime();
    const modifiedAt = new Date(ticketItem.modifiedAt).getTime();

    // Check if both dates are valid
    if (!isNaN(createdAt) && !isNaN(modifiedAt)) {
      return {
        timeDifference: modifiedAt - createdAt,
        stageId: ticketItem.stageId, // Include assignedUserIds
        labelIds: ticketItem.labelIds,
        tagIds: ticketItem.tagIds,
      };
    }
  });

  // Filter out invalid date differences
  const validTimeToCloseArray = timeToCloseArray.filter(
    (time) => time !== null,
  );

  if (validTimeToCloseArray.length === 0) {
    throw new Error('No valid time differences found.');
  }

  const timeToCloseInHoursArray = validTimeToCloseArray.map((time) => ({
    timeDifference: (time.timeDifference / (1000 * 60 * 60)).toFixed(3),
    stageId: time.stageId, // Include assignedUserIds
    labelIds: time.labelIds,
    tagIds: time.tagIds,
  }));

  return timeToCloseInHoursArray;
};

const calculateAverageTimeToCloseUser = (
  tickets: any,
  selectedUserIds: any,
) => {
  // Filter out tickets without close dates
  const closedTickets = tickets.filter(
    (ticketItem) => ticketItem.modifiedAt && ticketItem.createdAt,
  );

  if (closedTickets.length === 0) {
    throw new Error('No closed tickets found.');
  }
  if (selectedUserIds.length > 0) {
    selectedUserIds.forEach((userId) => {
      closedTickets[userId] = 0;
    });
  }
  // Calculate time to close for each ticket in milliseconds
  const timeToCloseArray = closedTickets.map((ticketItem) => {
    const createdAt = new Date(ticketItem.createdAt).getTime();
    const modifiedAt = new Date(ticketItem.modifiedAt).getTime();
    const user_id = ticketItem.assignedUserIds;

    if (!isNaN(createdAt) && !isNaN(modifiedAt)) {
      if (selectedUserIds.length > 0) {
        const matchingUserIds = user_id.filter((result) =>
          selectedUserIds.includes(result),
        );
        return {
          timeDifference: modifiedAt - createdAt,
          assignedUserIds: matchingUserIds, // Include assignedUserIds
        };
      } else {
        return {
          timeDifference: modifiedAt - createdAt,
          assignedUserIds: user_id, // Include assignedUserIds
        };
      }
    }
  });

  // Filter out invalid date differences
  const validTimeToCloseArray = timeToCloseArray.filter(
    (time) => time !== null,
  );

  if (validTimeToCloseArray.length === 0) {
    throw new Error('No valid time differences found.');
  }

  // Calculate the sum of timeDifference for each unique user
  const userTotals = {};

  validTimeToCloseArray.forEach((entry) => {
    if (entry !== null) {
      entry.assignedUserIds.forEach((userId) => {
        userTotals[userId] = (userTotals[userId] || 0) + entry.timeDifference;
      });
    }
  });

  const resultArray = Object.entries(userTotals).map(
    (
      value: [string, unknown],
      index: number,
      array: Array<[string, unknown]>,
    ) => {
      const [userId, timeDifferenceSum] = value;
      return {
        timeDifference: (timeDifferenceSum as number).toFixed(3),
        assignedUserIds: [userId],
      };
    },
  );
  return resultArray;
};

function sumCountsByUserIdName(inputArray: any[]) {
  const resultMap = new Map<
    string,
    { count: number; fullName: string; _id: string }
  >();
  inputArray.forEach((userEntries) => {
    userEntries.forEach((entry) => {
      const userId = entry._id;
      const { count } = entry;

      if (resultMap.has(userId)) {
        resultMap.get(userId)!.count += count;
      } else {
        resultMap.set(userId, {
          count,
          fullName: entry.FullName,
          _id: entry._id,
        });
      }
    });
  });

  return Array.from(resultMap.values());
}

function stageChangedDate(ticked: any[]) {
  const resultMap = new Map<
    string,
    { date: string; name: string; _id: string }
  >(
    Array.from(ticked, (t) => [
      t._id,
      {
        _id: t._id,
        name: t.name,
        date: new Date(t.stageChangedDate).toLocaleString(),
      },
    ]),
  );

  return Array.from(resultMap.values());
}
async function filterData(filter: any, subdomain: any) {
  const {
    dateRange,
    startDate,
    endDate,
    assignedUserIds,
    branchIds,
    departmentIds,
    companyIds,
    stageId,
    stageIds,
    tagIds,
    pipelineLabels,
    groupIds,
    fieldIds,
    priority,
    attachment
  } = filter;
  const matchfilter = {};

  if (attachment === true) {
    matchfilter['attachments'] = { '$ne': [] };
  }

  if (attachment === false) {
    matchfilter['attachments'] = { '$eq': [] };
  }

  if (assignedUserIds) {
    matchfilter['assignedUserIds'] = { $in: assignedUserIds };
  }
  if (dateRange) {
    const dateFilter = returnDateRange(filter.dateRange, startDate, endDate);

    if (Object.keys(dateFilter).length) {
      matchfilter['createdAt'] = dateFilter;
    }
  }
  if (branchIds) {
    matchfilter['branchIds'] = { $in: branchIds };
  }
  if (departmentIds) {
    matchfilter['departmentIds'] = { $in: departmentIds };
  }

  if (stageId) {
    matchfilter['stageId'] = { $eq: stageId };
  }

  if (stageIds) {
    matchfilter['stageId'] = { $in: stageIds };
  }

  if (tagIds) {
    matchfilter['tagIds'] = { $in: tagIds };
  }
  if (pipelineLabels) {
    matchfilter['labelIds'] = { $in: pipelineLabels };
  }
  if (priority) {
    matchfilter['priority'] = { $eq: priority };
  }

  // FIELD GROUP FILTER
  if (groupIds && groupIds.length) {
    const fields = await sendFormsMessage({
      subdomain,
      action: 'fields.find',
      data: {
        query: {
          groupId: { $in: groupIds }
        }
      },
      isRPC: true,
      defaultValue: []
    })

    const fieldIds = (fields || []).map(field => field._id)

    matchfilter['customFieldsData.field'] = { $in: fieldIds };
  }

  // FIELD FILTER
  if (fieldIds && fieldIds.length) {
    matchfilter['customFieldsData.field'] = { $in: fieldIds };
  }

  // COMPANY FILTER
  if (companyIds) {
    const conformities = await sendCoreMessage({
      subdomain,
      action: 'conformities.findConformities',
      data: {
        relType: "company",
        relTypeId: { $in: companyIds }
      },
      isRPC: true,
      defaultValue: []
    })

    const mainTypeIds = conformities.map(conformity => conformity.mainTypeId)

    matchfilter['_id'] = { $in: mainTypeIds };
  }

  return matchfilter;
}

async function getStageIds(filter: any, type: string, models: IModels,) {
  const { pipelineId, boardId, stageId, stageType } = filter;

  const probability = returnStage(stageType)

  const boards = await models.Boards.find({
    ...(boardId ? { _id: { $in: [boardId] } } : {}),
    type: type,
  })

  const getBoardIds = (boards || []).map(board => board._id)

  const pipelines = await models.Pipelines.find({
    ...(pipelineId ? { _id: { $in: [pipelineId] } } : {}),
    boardId: {
      $in: getBoardIds,
    },
    type: type,
  })

  const getPipelineIds = (pipelines || []).map(pipeline => pipeline._id)

  const stages = await models.Stages.find({
    ...(stageId ? { _id: { $in: [stageId] } } : {}),
    ...(stageType ? { probability: { $eq: probability } } : {}),
    pipelineId: {
      $in: getPipelineIds,
    },
    type: type,
  })

  const getStageIds = (stages || []).map(stage => stage._id)

  return getStageIds
}

async function pipelineFilterData(
  filter: any,
  models: IModels,
  pipelineId: any,
  boardId: any,
  stageType: any,
) {
  let pipelineIds: string[] = [];
  let stageFilters = {};
  if (stageType) {
    const stageFilter = returnStage(stageType);
    // Check if stageFilter is not empty
    if (Object.keys(stageFilter).length) {
      stageFilters['probability'] = stageFilter;
    }
  }
  if (checkFilterParam(pipelineId)) {
    const findPipeline = await models?.Pipelines.find({
      _id: {
        $in: pipelineId,
      },
      type: 'deal',
      status: 'active',
    });
    if (findPipeline) {
      pipelineIds.push(...findPipeline.map((item) => item._id));
    }
  }
  if (checkFilterParam(boardId)) {
    const findBoard = await models?.Boards.find({
      _id: {
        $in: boardId,
      },
      type: 'deal',
    });
    if (findBoard) {
      const boardId = findBoard?.map((item) => item._id);
      const pipeline = await models?.Pipelines.find({
        boardId: {
          $in: boardId,
        },
        type: 'deal',
        status: 'active',
      });
      if (pipeline) {
        pipelineIds.push(...pipeline.map((item: any) => item._id));
      }
    }
  }

  const stages = await models?.Stages.find({
    ...stageFilters,
    pipelineId: {
      $in: pipelineIds,
    },
    type: 'deal',
  });
  const pipeline = stages?.map((item) => item._id);

  const deals = await models?.Deals.find({
    ...filter,
    stageId: {
      $in: pipeline,
    },
  }).lean();

  if (deals) {
    const dealAmount = await amountProductData(deals);

    const dealAmountMap = {};
    dealAmount.forEach((item) => {
      dealAmountMap[item.stageId] = item.totalAmount;
    });

    // Assign totalAmount to each deal
    const groupStage = deals.map((deal) => ({
      ...deal,
      productCount: deal.productsData?.length,
      totalAmount: dealAmountMap[deal.stageId],
    }));
    const title = 'Deals sales and average';

    const filteredGroupStage = groupStage.filter(
      (item: any) => typeof item.totalAmount === 'number',
    );

    // Sort the filtered array by totalAmount
    filteredGroupStage.sort((a, b) => a.totalAmount - b.totalAmount);

    // Extract sorted data and labels
    const data = filteredGroupStage.map((item: any) => item.totalAmount);
    const labels = filteredGroupStage.map(
      (item: any) => `Name: ${item.name}, Product Count: ${item.productCount}`,
    );

    const datasets = { title, data, labels };
    return datasets;
  } else {
    throw new Error('No deals found');
  }
}

async function PipelineAndBoardFilter(
  pipelineId: string,
  boardId: string,
  stageType: string,
  stageId: string,
  type: string,
  models: IModels,
) {
  let pipelineIds: string[] = [];

  let stageFilters = {};
  if (stageType) {
    const stageFilter = returnStage(stageType);
    // Check if stageFilter is not empty
    if (Object.keys(stageFilter).length) {
      stageFilters['probability'] = stageFilter;
    }
  }

  if (checkFilterParam(boardId)) {
    const findPipeline = await models?.Pipelines.find({
      boardId: {
        $in: boardId,
      },
      type: type,
      status: 'active',
    });
    if (findPipeline) {
      pipelineIds.push(...findPipeline.map((item) => item._id));
    }
  }
  if (checkFilterParam(pipelineId)) {
    const findPipeline = await models?.Pipelines.find({
      _id: {
        $in: pipelineId,
      },
      type: type,
      status: 'active',
    });
    if (findPipeline) {
      pipelineIds.push(...findPipeline.map((item) => item._id));
    }
  }
  if (checkFilterParam(stageId)) {
    const findStages = await models?.Stages.find({
      ...stageFilters,
      _id: {
        $in: stageId,
      },
      type: type,
    });
    if (findStages) {
      const stage_ids = findStages?.map((item) => item._id);
      return stage_ids;
    }
  }
  let uniquePipelineIdsSet = new Set(pipelineIds);
  let uniquePipelineIds = Array.from(uniquePipelineIdsSet);
  const stages = await models?.Stages.find({
    ...stageFilters,
    pipelineId: {
      $in: uniquePipelineIds,
    },
    type: type,
  });
  const stage_ids = stages?.map((item) => item._id);
  return stage_ids;
}

function QueryFilter(filterPipelineId: any, matchedFilter: any) {
  let constructedQuery: any = {};

  if (filterPipelineId && Object.keys(filterPipelineId).length > 0) {
    constructedQuery.stageId = { $in: filterPipelineId };
  }

  if (
    matchedFilter &&
    typeof matchedFilter === 'object' &&
    Object.keys(matchedFilter).length > 0
  ) {
    constructedQuery = {
      ...constructedQuery,
      ...matchedFilter,
    };
  }

  return constructedQuery;
}