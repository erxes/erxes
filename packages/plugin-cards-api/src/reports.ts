import { IUserDocument } from '@erxes/api-utils/src/types';
import { models } from './connectionResolver';
import { sendCoreMessage, sendTagsMessage } from './messageBroker';
import * as dayjs from 'dayjs';

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
const returnStage = (resolve: string | string[]) => {
  // Handle the case when resolve is an array
  const firstResolve = Array.isArray(resolve) ? resolve[0] : resolve;

  switch (firstResolve) {
    case 'won':
      return 'Won'; // Return directly the string 'Won'
    case 'lost':
      return 'Lost'; // Return directly the string 'Lost'
    case 'open':
      return {
        $or: [
          { $lt: 0 }, // Less than 0%
          { $gte: 100 }, // Greater than or equal to 100%
        ],
      };
    case 'all':
      return {}; // Return all stages, you might need to adjust this
    default:
      return {}; // Default case returns an empty object
  }
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

const STAGE = [
  { label: 'Won', value: 'won' },
  { label: 'Lost', value: 'lost' },
  { label: 'Open', value: 'Open' },
  {
    label: 'All',
    value: 'All',
  },
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
      'dealsChartByMonth',
      'DealAmountAverageByRep',
      'DealLeaderboardAmountClosedByRep',
      'DealsByLastModifiedDate',
      'DealsClosedLostAllTimeByRep',
      'DealsOpenByCurrentStage',
      'DealsClosedWonAllTimeByRep',
      'DealRevenueByStage',
      'DealsSales',
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
      'TaskClosedTotalsByReps',
      'TaskClosedTotalsByLabel',
      'TaskClosedTotalsByTags',
      'TasksIncompleteTotalsByReps',
      'TasksIncompleteTotalsByLabel',
      'TasksIncompleteTotalsByTags',
      'AllTasksIncompleteByDueDate',
      'TasksIncompleteAssignedToTheTeamByDueDate',
      'TasksIncompleteAssignedToMeByDueDate',
    ],
    img: 'https://cdn.mos.cms.futurecdn.net/S5bicwPe8vbP9nt3iwAwwi.jpg',
  },
  {
    serviceType: 'ticket',
    title: 'Tickets chart',
    serviceName: 'cards',
    description: 'Tickets conversation charts',
    charts: [
      'TicketAverageTimeToCloseOverTime',
      'TicketClosedTotalsByRep',
      'TicketTotalsByStatus',
      'TicketTotalsByLabelPriorityTag',
      'TicketTotalsOverTime',
      'TicketAverageTimeToCloseByRep',
      'TicketAverageTimeToClose',
      'TicketTotalsBySource',
      'TicketStageChangedDate',
      'TicketsCardCountAssignedUser',
      'TicketsStageDateRange',
    ],
    img: 'https://sciter.com/wp-content/uploads/2022/08/chart-js.png',
  },
];

const chartTemplates = [
  {
    templateType: 'DealAmountAverageByRep',
    name: 'Deal amount average by rep',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const matchedFilter = await filterData(filter);
      const selectedUserIds = filter.assignedUserIds || [];
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_DEAL,
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
      const assignedUsersMap = {};

      for (let i = 0; i < getTotalAssignedUserIds.length; i++) {
        const assignedUsers = getTotalAssignedUserIds[i];
        for (const assignedUser of assignedUsers) {
          assignedUsersMap[assignedUser._id] = {
            fullName: assignedUser.details?.fullName,
            amount: dealCounts[i].amount, // Match the amount with the correct index
          };
        }
      }
      const data = Object.values(assignedUsersMap).map((t: any) => t.amount);
      const labels = Object.values(assignedUsersMap).map(
        (t: any) => t.fullName,
      );

      const title = 'Deal amount average by rep';
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
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
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_DEAL}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },

  {
    templateType: 'DealLeaderboardAmountClosedByRep',
    name: 'Deal leader board - amount closed by rep',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const matchedFilter = await filterData(filter);
      const selectedUserIds = filter.assignedUserIds || [];
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_DEAL,
      );

      let query = await QueryFilter(filterPipelineId, matchedFilter);
      let deals;

      // Use the find() method with your query object
      deals = await models?.Deals.find({
        ...query,
        isComplete: true,
      });

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
      const assignedUsersMap = {};

      for (let i = 0; i < getTotalAssignedUserIds.length; i++) {
        const assignedUsers = getTotalAssignedUserIds[i];
        for (const assignedUser of assignedUsers) {
          assignedUsersMap[assignedUser._id] = {
            fullName: assignedUser.details?.fullName,
            amount: dealCounts[i].amount, // Match the amount with the correct index
          };
        }
      }
      const data = Object.values(assignedUsersMap).map((t: any) => t.amount);
      const labels = Object.values(assignedUsersMap).map(
        (t: any) => t.fullName,
      );

      const title = 'Deal amount average by rep';
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
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
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_DEAL}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },

  {
    templateType: 'DealsByLastModifiedDate',
    name: 'Deals by last modified date',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const matchedFilter = await filterData(filter);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_DEAL,
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
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
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_DEAL}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },

  {
    templateType: 'DealsClosedLostAllTimeByRep',
    name: 'Deals closed lost all time by rep',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { stageType } = filter;
      const selectedUserIds = filter.assignedUserIds || [];
      const matchedFilter = await filterData(filter);
      let stageFilters = {};
      if (stageType) {
        const stageFilter = returnStage(stageType);
        // Check if stageFilter is not empty
        if (Object.keys(stageFilter).length) {
          stageFilters['probability'] = stageFilter;
        }
      }
      const stages = await models?.Stages.find({
        type: 'deal',
        ...stageFilters,
      }).lean();

      let dealCounts;
      if (stages) {
        if (selectedUserIds.length === 0) {
          dealCounts = await Promise.all(
            // tslint:disable-next-line:no-shadowed-variable
            stages.map(async (result) => {
              return await models?.Deals.find({
                ...matchedFilter,
                stageId: result._id,
              }).lean();
            }),
          );
        } else {
          dealCounts = await Promise.all(
            // tslint:disable-next-line:no-shadowed-variable
            stages.map(async (result) => {
              return await models?.Deals.find({
                ...matchedFilter,
                $and: [
                  { stageId: result._id },
                  { assignedUserIds: { $in: selectedUserIds } },
                ],
              }).lean();
            }),
          );
        }
      } else {
        throw new Error('Stages are undefined.');
      }

      // Extract counts
      const data = await Promise.all(
        dealCounts.map(async (item) => {
          const resultPromises = item.map(async (result) => {
            const getTotalRespondedUsers = await sendCoreMessage({
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

            return getTotalRespondedUsers.map((user) => {
              const counts = item.filter(
                (element) =>
                  element.status === 'active' &&
                  element.assignedUserIds &&
                  element.assignedUserIds.includes(user._id),
              ).length;
              return {
                FullName: user.details?.fullName || '',
                _id: user._id,
                count: counts || 0,
              };
            });
          });

          // Wait for all inner promises to resolve
          const resultData = await Promise.all(resultPromises);
          // Flatten the array of arrays and remove duplicates based on _id
          const flattenedData = resultData.flat();
          const uniqueData = Array.from(
            new Set(flattenedData.map((user) => user._id)),
          ).map((id) => flattenedData.find((user) => user._id === id));

          return uniqueData;
        }),
      );

      const uniqueUserEntries = Array.from(
        new Set(data.map((entry) => JSON.stringify(entry))),
        (str) => JSON.parse(str),
      );

      const summedResultArray = await sumCountsByUserIdName(uniqueUserEntries);

      const filteredResult =
        selectedUserIds.length > 0
          ? summedResultArray.filter((user) =>
              selectedUserIds.includes(user._id),
            )
          : summedResultArray;

      const setData = Object.values(filteredResult).map((t: any) => t.count);
      const setLabels = Object.values(filteredResult).map(
        (t: any) => t.fullName,
      );
      const title = 'Deals closed lost all time by rep';
      const datasets = { title, data: setData, labels: setLabels };
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
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
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_DEAL}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },

  {
    templateType: 'DealsOpenByCurrentStage',
    name: 'Deals open by current stage',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { stageType } = filter;
      const matchedFilter = await filterData(filter);
      let stageFilters = {};
      if (stageType) {
        const stageFilter = returnStage(stageType);
        // Check if stageFilter is not empty
        if (Object.keys(stageFilter).length) {
          stageFilters['probability'] = stageFilter;
        }
      }

      let stages = await models?.Stages.find({
        ...stageFilters,
        type: 'deal',
      });

      if (stages) {
        const openDealsCounts = await Promise.all(
          stages.map(async (stage) => {
            const openDealsCount = await models?.Deals.countDocuments({
              ...matchedFilter,
              stageId: stage._id,
              status: 'active', // Assuming 'active' is the status for open deals
            });

            const stageDetails = await models?.Stages.findById(
              stage._id,
            ).lean();

            return {
              stageId: stage._id,
              stageName: stageDetails?.name, // Include other relevant stage information
              count: openDealsCount,
            };
          }),
        );

        const setData = Object.values(openDealsCounts).map((t: any) => t.count);
        const setLabels = Object.values(openDealsCounts).map(
          (t: any) => t.stageName,
        );
        const title = 'Deals open by current stage';
        const datasets = { title, data: setData, labels: setLabels };

        return datasets;
      } else {
        throw new Error('No deal stages found');
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
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
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_DEAL}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },

  {
    templateType: 'DealsClosedWonAllTimeByRep',
    name: 'Deals closed won all time by rep',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { stageType } = filter;
      let stageFilters = {};
      if (stageType) {
        const stageFilter = returnStage(stageType);
        // Check if stageFilter is not empty
        if (Object.keys(stageFilter).length) {
          stageFilters['probability'] = stageFilter;
        }
      }
      const matchedFilter = await filterData(filter);
      const selectedUserIds = filter.assignedUserIds || [];
      const stages = await models?.Stages.find({
        type: 'deal',
        ...stageFilters,
      }).lean();
      let dealCounts;
      if (stages) {
        dealCounts = await Promise.all(
          stages.map(async (result) => {
            return await models?.Deals.find({
              ...matchedFilter,
              stageId: result._id,
            }).lean();
          }),
        );
      } else {
        throw new Error('Stages are undefined.');
      }

      // Extract counts
      const data = await Promise.all(
        dealCounts.map(async (item) => {
          const resultPromises = item.map(async (result) => {
            const getTotalRespondedUsers = await sendCoreMessage({
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

            return getTotalRespondedUsers.map((user) => {
              const counts = item.filter(
                (element) =>
                  element.status === 'active' &&
                  element.assignedUserIds &&
                  element.assignedUserIds.includes(user._id),
              ).length;
              return {
                FullName: user.details?.fullName || '',
                _id: user._id,
                count: counts || 0,
              };
            });
          });

          // Wait for all inner promises to resolve
          const resultData = await Promise.all(resultPromises);
          // Flatten the array of arrays and remove duplicates based on _id
          const flattenedData = resultData.flat();
          const uniqueData = Array.from(
            new Set(flattenedData.map((user) => user._id)),
          ).map((id) => flattenedData.find((user) => user._id === id));

          return uniqueData;
        }),
      );

      const uniqueUserEntries = Array.from(
        new Set(data.map((entry) => JSON.stringify(entry))),
        (str) => JSON.parse(str),
      );

      const summedResultArray = await sumCountsByUserIdName(uniqueUserEntries);

      const filteredResult =
        selectedUserIds.length > 0
          ? summedResultArray.filter((user) =>
              selectedUserIds.includes(user._id),
            )
          : summedResultArray;

      const setData = Object.values(filteredResult).map((t: any) => t.count);
      const setLabels = Object.values(filteredResult).map(
        (t: any) => t.fullName,
      );

      const title = 'Deals closed won all time by rep';
      const datasets = { title, data: setData, labels: setLabels };
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
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
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_DEAL}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },
  {
    templateType: 'DealsSales',
    name: 'Deals sales',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const filerData = await filterData(filter);
      const data = await pipelineFilterData(
        filerData,
        pipelineId,
        boardId,
        stageType,
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
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
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_DEAL}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },

  //Task Reports

  {
    templateType: 'TaskAverageTimeToCloseByReps',
    name: 'Task average time to close by reps',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const selectedUserIds = filter.assignedUserIds || [];
      const matchedFilter = await filterData(filter);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_TASK,
      );
      let tasks;
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      tasks = await models?.Tasks.find({ ...query, isComplete: true });

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

      const data = Object.values(result).map((t: any) => t.timeDifference);
      const labels = Object.values(result).map((t: any) => t.FullName);

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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
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
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TASK}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },

  {
    templateType: 'TaskAverageTimeToCloseByLabel',
    name: 'Task average time to close by label',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const matchedFilter = await filterData(filter);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_TASK,
      );

      let tasks;

      let query = await QueryFilter(filterPipelineId, matchedFilter);

      tasks = await models?.Tasks.find({ ...query, isComplete: false });

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

      let setData: string[] = [];
      let stablesNames: string[] = [];

      enrichedTicketData
        .filter((t) => t.timeDifference && t.labels && t.labels.length > 0)
        .slice(0, 100) // Limit to the first 10 elements
        .map((t) => {
          setData.push(t.timeDifference);

          // Flatten and join the labels array into a single string
          const flattenedLabels = t.labels.join(' ');
          stablesNames.push(flattenedLabels);

          return {
            timeDifference: t.timeDifference,
            stageId: t.stageId,
            labelIds: t.labelIds,
            labels: flattenedLabels,
            /* Add other properties as needed */
          };
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
        fieldName: 'labels',
        fieldType: 'select',
        multi: true,
        fieldLabel: 'Select labels',
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
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
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TASK}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },

  {
    templateType: 'TaskAverageTimeToCloseByTags',
    name: 'Task average time to close by tags',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const matchedFilter = await filterData(filter);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_TASK,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const tasks = await models?.Tasks.find({
        ...query,
        isComplete: false,
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

      const title = 'Task average time to close by tags';
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
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
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TASK}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },
  {
    templateType: 'TaskClosedTotalsByReps',
    name: 'Task closed totals by reps',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const matchedFilter = await filterData(filter);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_TASK,
      );
      const selectedUserIds = filter.assignedUserIds || [];
      let tasks;

      let query = await QueryFilter(filterPipelineId, matchedFilter);

      tasks = await models?.Tasks.find({ ...query, isComplete: true });

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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
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
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TASK}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },
  {
    templateType: 'TaskClosedTotalsByLabel',
    name: 'Task closed totals by label',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const matchedFilter = await filterData(filter);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_TASK,
      );

      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const tasks = await models?.Tasks.find({
        ...query,
        isComplete: true,
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
        const ownerId = item.ownerId;
        const matchingLabel = labels.find(
          (label) => label && label._id === ownerId,
        );

        // Use the spread operator (...) to include all properties of the item object
        return {
          ...item,
          labels: matchingLabel ? [matchingLabel.name] : [],
        };
      });
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
        fieldName: 'labels',
        fieldType: 'select',
        multi: true,
        fieldLabel: 'Select labels',
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
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
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TASK}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },

  {
    templateType: 'TaskClosedTotalsByTags',
    name: 'Task closed totals by tags',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const matchedFilter = await filterData(filter);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_TASK,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const tasks = await models?.Tasks.find({
        ...query,
        isComplete: true,
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
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
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TASK}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },
  {
    templateType: 'TasksIncompleteTotalsByReps',
    name: 'Tasks incomplete totals by reps',
    chartTypes: ['bar'],
    // Bar Chart Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const matchedFilter = await filterData(filter);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_TASK,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const selectedUserIds = filter.assignedUserIds || [];
      let tasks;

      if (selectedUserIds.length === 0) {
        // No selected users, so get all tasks
        tasks = await models?.Tasks.find({
          isComplete: false,
          ...query,
        }).lean();
      } else {
        // Filter tasks based on selectedUserIds
        const taskCount = await models?.Tasks.find({
          ...query,
          assignedUserIds: { $in: selectedUserIds },
          isComplete: false,
        }).lean();
        if (taskCount) {
          tasks = taskCount.filter((task) => {
            return task.assignedUserIds.some((userId) =>
              selectedUserIds.includes(userId),
            );
          });
        } else {
          // Handle the case where datats is undefined
          throw new Error('No tasks found based on the selected user IDs.');
          tasks = [];
        }
      }

      // Check if the returned value is not an array
      if (!Array.isArray(tasks)) {
        throw new Error('Invalid data: tasks is not an array.');
      }

      // Continue processing tasks...

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

      const title = 'Tasks incomplete totals by reps';
      const sort = ownerIds.map((ownerId) => {
        const user = assignedUsersMap[ownerId];
        const count = taskCounts[ownerId];

        if (user) {
          return {
            name: user.fullName,
            count: count || 0, // Set count to 0 if not found in ticketCounts
          };
        }
      });
      const filteredSort = sort.filter((entry) => entry !== undefined);

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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
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
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TASK}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },

  {
    templateType: 'TasksIncompleteTotalsByLabel',
    name: 'Tasks incomplete totals by label',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const matchedFilter = await filterData(filter);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_TASK,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const selectedLabelIds = filter.labelIds || [];
      let tasks;

      if (selectedLabelIds.length === 0) {
        // No selected users, so get all tasks
        tasks = await models?.Tasks.find({
          isComplete: false,
          ...query,
        }).lean();
      } else {
        // Filter tasks based on selectedLabelIds
        tasks = await models?.Tasks.find({
          ...query,
          labelIds: { $in: selectedLabelIds },
          isComplete: false,
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
        const ownerId = item.ownerId;
        const matchingLabel = labels.find(
          (label) => label && label._id === ownerId,
        );

        // Use the spread operator (...) to include all properties of the item object
        return {
          ...item,
          labels: matchingLabel ? [matchingLabel.name] : [],
        };
      });
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
        fieldName: 'labels',
        fieldType: 'select',
        multi: true,
        fieldLabel: 'Select labels',
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
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
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TASK}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },

  {
    templateType: 'TasksIncompleteTotalsByTags',
    name: 'Tasks incomplete totals by tags',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const matchedFilter = await filterData(filter);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_TASK,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const selectedTagIds = filter.tagIds || [];
      let tasksCount;

      if (selectedTagIds.length === 0) {
        // No selected users, so get all tasks
        tasksCount = await models?.Tasks.find({
          ...query,
          isComplete: false,
        }).lean();
      } else {
        // Filter tasks based on selectedLabelIds
        tasksCount = await models?.Tasks.find({
          ...query,
          tagIds: { $in: selectedTagIds },
          isComplete: false,
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
        const ownerId = item.ownerId;
        const matchingLabel = tagInfo.find(
          (label) => label && label._id === ownerId,
        );

        // Use the spread operator (...) to include all properties of the item object
        return {
          ...item,
          labels: matchingLabel ? [matchingLabel.name] : [],
        };
      });
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
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
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TASK}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },
  {
    templateType: 'AllTasksIncompleteByDueDate',
    name: 'All tasks incomplete by due date',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const matchedFilter = await filterData(filter);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_TASK,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const selectedUserIds = filter.assignedUserIds || [];
      let tasks;

      if (selectedUserIds.length === 0) {
        // No selected users, so get all tasks
        tasks = await models?.Tasks.find({
          isComplete: false,
          ...query,
        }).lean();
      } else {
        // Filter tasks based on selectedUserIds
        const taskCount = await models?.Tasks.find({
          ...query,
          assignedUserIds: { $in: selectedUserIds },
          isComplete: false,
        }).lean();
        if (taskCount) {
          tasks = taskCount.filter((task) => {
            return task.assignedUserIds.some((userId) =>
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

      const sort = ownerIds.map((ownerId) => {
        const user = assignedUsersMap[ownerId];
        const count = taskCounts[ownerId];

        if (user) {
          return {
            name: user.fullName,
            count: count || 0, // Set count to 0 if not found in ticketCounts
          };
        }
      });
      const filteredSort = sort.filter((entry) => entry !== undefined);
      const data = Object.values(filteredSort).map((t: any) => t.count);
      const labels = Object.values(filteredSort).map((t: any) => t.name);

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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
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
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TASK}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },

  {
    templateType: 'TasksIncompleteAssignedToTheTeamByDueDate',
    name: 'Tasks incomplete assigned to the team by due date',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const matchedFilter = await filterData(filter);

      const tasksCount = await models?.Tasks.find({
        ...matchedFilter,
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
        const ownerId = item.ownerId;

        const matchingLabel = departmentInfo.find(
          (label) => label && label._id === ownerId,
        );
        // Use the spread operator (...) to include all properties of the item object
        return {
          ...item,
          labels: matchingLabel ? [matchingLabel.title] : [],
        };
      });
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
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
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TASK}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },

  {
    templateType: 'TasksIncompleteAssignedToMeByDueDate',
    name: 'Tasks incomplete assigned to me by due date',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const matchedFilter = await filterData(filter);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_TASK,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const selectedUserIds = filter.assignedUserIds || [];
      let tickets;

      tickets = await models?.Tasks.find({
        ...query,
        isComplete: false,
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
      countsArray.sort((a, b) => b.count - a.count);

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
            count: count || 0, // Set count to 0 if not found in ticketCounts
          };
        }
      });

      // Filter out undefined values from sort

      const filteredSort = sort.filter((entry) => entry !== undefined);

      const title = 'Tasks incomplete assigned to me by due date';
      const data = filteredSort.map((t: any) => t.count);
      const labels = filteredSort.map((t: any) => t.name);

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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
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
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TASK}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },

  {
    templateType: 'TicketsStageDateRange',
    name: 'Stage Date',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const matchedFilter = await filterData(filter);
      const board = await models?.Boards.find({
        type: 'ticket',
      }).lean();

      const boardId = board?.map((item) => item._id);

      const pipeline = await models?.Pipelines.find({
        boardId: {
          $in: boardId,
        },
        type: 'ticket',
        status: 'active',
      }).lean();

      const pipelineId = pipeline?.map((item) => item._id);

      const stages = await models?.Stages.find({
        pipelineId: {
          $in: pipelineId,
        },
      });

      const stageId = stages?.map((item) => item._id);

      let ticketCounts;
      let matchStageAndDate;
      if (Object.keys(matchedFilter).length > 0) {
        matchStageAndDate = {
          $match: {
            stageId: {
              $in: stageId,
            },
            ...matchedFilter,
          },
        };
      } else {
        matchStageAndDate = {
          $match: {
            stageId: {
              $in: stageId,
            },
          },
        };
      }

      const groupStage = {
        $group: {
          _id: '$stageId',
          count: { $sum: 1 },
        },
      };

      ticketCounts = await models?.Tickets.aggregate([
        matchStageAndDate,
        groupStage,
      ]);

      const countByStageId = ticketCounts?.reduce((acc, result) => {
        acc[result._id] = result.count;
        return acc;
      }, {});

      const filters = (stages || [])
        .map((item) => ({
          _id: item._id,
          count: countByStageId?.[item._id] || 0,
          name: item.name,
        }))
        .filter((item) => item.count > 0);
      const title = 'Stage Date';
      const data = Object.values(filters).map((t: any) => t.count);

      const labels = Object.values(filters).map((t: any) => t.name);

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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
      },
      {
        fieldName: 'tagIds',
        fieldType: 'select',
        fieldQuery: 'tags',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${CUSTOM_PROPERTIES_TICKET}", "perPage": 1000}`,
        multi: true,
        fieldLabel: 'Select tags',
      },
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TICKET}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },
  {
    templateType: 'TicketsCardCountAssignedUser',
    name: 'Tickets Count and  AssignedUser',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const matchedFilter = await filterData(filter);

      const selectedUserIds = filter.assignedUserIds || [];
      const board = await models?.Boards.find({
        type: 'ticket',
      }).lean();
      const boardId = board?.map((item) => item._id);
      const pipeline = await models?.Pipelines.find({
        boardId: {
          $in: boardId,
        },
        type: 'ticket',
        status: 'active',
      }).lean();

      const pipelineId = pipeline?.map((item) => item._id);
      const stages = await models?.Stages.find({
        pipelineId: {
          $in: pipelineId,
        },
      });
      const stageId = stages?.map((item) => item._id);
      let ticketCounts;

      const matchStage = {
        $match: {
          stageId: {
            $in: stageId,
          },
        },
      };

      const matchAssignedUsers = {
        $match: {
          assignedUserIds: {
            $in: selectedUserIds,
          },
          ...matchedFilter,
        },
      };

      const groupStage = {
        $group: {
          _id: '$stageId',
          count: { $sum: 1 },
        },
      };

      const groupAssignedUsers = {
        $group: {
          _id: '$stageId',
          count: { $sum: 1 },
          assignedUserIds: { $push: '$assignedUserIds' }, // assuming you want an array of assignedUserIds
        },
      };

      if (selectedUserIds.length === 0) {
        ticketCounts = await models?.Tickets.aggregate([
          matchStage,
          groupStage,
        ]);
      } else {
        ticketCounts = await models?.Tickets.aggregate([
          matchStage,
          matchAssignedUsers,
          groupAssignedUsers,
        ]);
      }
      const countByStageId = ticketCounts?.reduce((acc, result) => {
        acc[result._id] = result.count;
        return acc;
      }, {});
      const filters = (stages || [])
        .map((item) => ({
          _id: item._id,
          count: countByStageId?.[item._id] || 0,
          name: item.name,
        }))
        .filter((item) => item.count > 0);
      const title = 'Tickets Count and  AssignedUser';
      const data = Object.values(filters).map((t: any) => t.count);
      const labels = Object.values(filters).map((t: any) => t.name);

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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
      },
      {
        fieldName: 'tagIds',
        fieldType: 'select',
        fieldQuery: 'tags',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${CUSTOM_PROPERTIES_TICKET}", "perPage": 1000}`,
        multi: true,
        fieldLabel: 'Select tags',
      },
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TICKET}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },
  {
    templateType: 'TicketStageChangedDate',
    name: 'Ticket Stage Changed Date',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      try {
        const matchedFilter = await filterData(filter);

        const ticked = await models?.Tickets.find({
          ...matchedFilter,
          stageChangedDate: { $exists: true },
        }).sort({ stageChangedDate: -1 });

        if (ticked) {
          const stageDate = await stageChangedDate(ticked);
          const title = 'Ticket Stage Changed Date';
          const data = stageDate.reduce((result, item) => {
            const date = item.date.split(',')[0]; // Extracting the date part without time
            result[date] = (result[date] || 0) + 1;

            return result;
          }, {});

          const aggregatedData = Object.keys(data).map((date) => ({
            x: date,
            y: data[date],
          }));

          const result = {
            title,
            data: aggregatedData,
          };

          return result;
        } else {
          return { error: 'No data found' };
        }
      } catch (error) {
        return { error: error.message };
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
      },
      {
        fieldName: 'tagIds',
        fieldType: 'select',
        fieldQuery: 'tags',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${CUSTOM_PROPERTIES_TICKET}", "perPage": 1000}`,
        multi: true,
        fieldLabel: 'Select tags',
      },
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TICKET}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },

  {
    templateType: 'TicketAverageTimeToCloseOverTime',
    name: 'Ticket average time to close over time',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const matchedFilter = await filterData(filter);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_TICKET,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const ticket = await models?.Tickets.find({
        ...query,
        isComplete: true,
      }).lean();
      if (!ticket || ticket.length === 0) {
        throw new Error(
          'No ticket found in the database matching the specified criteria.',
        );
      }

      const title =
        'View the average amount of time it takes your reps to close tickets. See how this tracks over time.';
      const ticketData = await calculateAverageTimeToClose(ticket);
      const labels = ticketData.map((duration) => {
        const { hours, minutes, seconds } = convertHoursToHMS(duration);
        return `${hours}h ${minutes}m ${seconds}s`;
      });

      const datasets = { title, ticketData, labels };

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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
      },
      {
        fieldName: 'tagIds',
        fieldType: 'select',
        fieldQuery: 'tags',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${CUSTOM_PROPERTIES_TICKET}", "perPage": 1000}`,
        multi: true,
        fieldLabel: 'Select tags',
      },
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TICKET}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },

  {
    templateType: 'TicketClosedTotalsByRep',
    name: 'Ticket closed totals by rep',
    chartTypes: ['bar'],
    // Bar Chart Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const matchedFilter = await filterData(filter);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_TICKET,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const selectedUserIds = filter.assignedUserIds || [];
      const tickets = await models?.Tickets.find({
        ...query,
        isComplete: true,
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

      const sort = ownerIds.map((ownerId) => {
        const user = assignedUsersMap[ownerId];
        const count = ticketCounts[ownerId];

        return {
          name: user.fullName,
          count: count || 0, // Set count to 0 if not found in ticketCounts
        };
      });

      const title =
        'View the total number of tickets closed by their assigned owner';
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
      },
      {
        fieldName: 'tagIds',
        fieldType: 'select',
        fieldQuery: 'tags',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${CUSTOM_PROPERTIES_TICKET}", "perPage": 1000}`,
        multi: true,
        fieldLabel: 'Select tags',
      },
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TICKET}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },
  {
    templateType: 'TicketTotalsByStatus',
    name: 'Ticket totals by status',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const matchedFilter = await filterData(filter);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_TICKET,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);

      const tickets = await models?.Tickets.find({
        ...query,
      }).lean();
      const ticketTotalsByStatus = calculateTicketTotalsByStatus(tickets);
      // Convert the counts object to an array of objects with ownerId and count
      const countsArray = Object.entries(ticketTotalsByStatus).map(
        // tslint:disable-next-line:no-shadowed-variable
        ([status, count]) => ({
          status,
          count,
        }),
      );
      const title =
        'View the total number of tickets in each part of your support queue';
      const labels = Object.values(countsArray).map((t: any) => t.status);
      const data = Object.values(countsArray).map((t: any) => t.count);

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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
      },
      {
        fieldName: 'tagIds',
        fieldType: 'select',
        fieldQuery: 'tags',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${CUSTOM_PROPERTIES_TICKET}", "perPage": 1000}`,
        multi: true,
        fieldLabel: 'Select tags',
      },
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TICKET}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },
  {
    templateType: 'TicketTotalsByLabelPriorityTag',
    name: 'Ticket totals by label/priority/tag/',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],

    getChartResult: async (filter: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const matchedFilter = await filterData(filter);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_TICKET,
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
        // Handle the case where no labels are found
        return { title: '', data: [], labels: [] };
      }
      // Adjust the property names based on your actual data structure
      const labelNames = labels.map((label) => label.name);

      // Combine labelNames with tagNames and other keys
      const allLabels = [...priorities, ...labelNames, ...tagNames];

      // Remove additional characters from labels and tags
      const simplifiedLabels = allLabels.map((label) =>
        label.replace(/(labelIds:|tagIds:|')/g, ''),
      );

      const title =
        '  View the total number of ticket totals by label/priority/tag/ ';

      // Assuming you have a relevant property for the chart data
      const data = Object.values(ticketTotals);

      // Combine the arrays into datasets
      const datasets = { title, data, labels: simplifiedLabels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'labelIds',
        fieldType: 'select',
        multi: true,
        fieldLabel: 'Select label',
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
      },
      {
        fieldName: 'tagIds',
        fieldType: 'select',
        fieldQuery: 'tags',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${CUSTOM_PROPERTIES_TICKET}", "perPage": 1000}`,
        multi: true,
        fieldLabel: 'Select tags',
      },
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TICKET}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },
  {
    templateType: 'TicketTotalsOverTime',
    name: 'Ticket totals over time',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],

    // Bar Chart Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const matchedFilter = await filterData(filter);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_TICKET,
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
      },
      {
        fieldName: 'tagIds',
        fieldType: 'select',
        fieldQuery: 'tags',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${CUSTOM_PROPERTIES_TICKET}", "perPage": 1000}`,
        multi: true,
        fieldLabel: 'Select tags',
      },
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TICKET}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },
  {
    templateType: 'TicketAverageTimeToCloseByRep',
    name: 'Ticket average time to close by rep',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Bar Chart Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType, assignedUserIds } = filter;
      const matchedFilter = await filterData(filter);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_TASK,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      let tickets;

      tickets = await models?.Tickets.find({
        isComplete: true,
        ...query,
      });
      const ticketData = await calculateAverageTimeToCloseUser(
        tickets,
        assignedUserIds,
      );

      const getTotalAssignedUsers = await Promise.all(
        tickets.map(async (result) => {
          return await sendCoreMessage({
            subdomain,
            action: 'users.find',
            data: {
              query: {
                _id: {
                  $in: filter.assignedUserIds,
                },
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
      },
      {
        fieldName: 'tagIds',
        fieldType: 'select',
        fieldQuery: 'tags',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${CUSTOM_PROPERTIES_TICKET}", "perPage": 1000}`,
        multi: true,
        fieldLabel: 'Select tags',
      },
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TICKET}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },
  {
    templateType: 'TicketTotalsBySource',
    name: 'Ticket totals by source',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const matchedFilter = await filterData(filter);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_TASK,
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
      },
      {
        fieldName: 'tagIds',
        fieldType: 'select',
        fieldQuery: 'tags',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${CUSTOM_PROPERTIES_TICKET}", "perPage": 1000}`,
        multi: true,
        fieldLabel: 'Select tags',
      },
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TICKET}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },

  {
    templateType: 'TicketAverageTimeToClose',
    name: 'Ticket average time to close',
    chartTypes: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'],
    // Table
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const { pipelineId, boardId, stageType } = filter;
      const matchedFilter = await filterData(filter);
      const filterPipelineId = await PipelineAndBoardFilter(
        pipelineId,
        boardId,
        stageType,
        PIPELINE_TYPE_TASK,
      );
      let query = await QueryFilter(filterPipelineId, matchedFilter);
      const ticket = await models?.Tickets.find({
        isComplete: true,
        ...query,
      }).lean();
      if (!ticket || ticket.length === 0) {
        throw new Error(
          'No ticket found in the database matching the specified criteria.',
        );
      }
      const data = await calculateAverageTimeToClose(ticket);

      const labels = data.map((duration) => {
        const { hours, minutes, seconds } = convertHoursToHMS(duration);
        return `${hours}h ${minutes}m ${seconds}s`;
      });
      const title =
        'View the average amount of time it takes for your reps to close tickets';

      // const datasets = [{ label, data: ticketData, labels }];
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
        fieldLabel: 'Select labels',
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
        multi: true,
        fieldQuery: 'stages',
        fieldOptions: STAGE,
        fieldLabel: 'Select stage type',
      },
      {
        fieldName: 'tagIds',
        fieldType: 'select',
        fieldQuery: 'tags',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${CUSTOM_PROPERTIES_TICKET}", "perPage": 1000}`,
        multi: true,
        fieldLabel: 'Select tags',
      },
      {
        fieldName: 'fieldsGroups',
        fieldType: 'select',
        fieldQuery: 'fieldsGroups',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"contentType": "${CUSTOM_PROPERTIES_TICKET}"}`,
        multi: true,
        fieldLabel: 'Select custom properties',
      },
    ],
  },
];

const getChartResult = async ({ subdomain, data }) => {
  const { templateType, filter, currentUser } = data;

  const template =
    chartTemplates.find((t) => t.templateType === templateType) || ({} as any);

  return template.getChartResult(filter, subdomain, currentUser);
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
    return taskCounts;
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
        const productsData = deal.productsData;
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
      const productsData = deal.productsData;

      productsData.forEach((product) => {
        if (deal.assignedUserIds && product.amount) {
          const assignedUserIds = deal.assignedUserIds;
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
    const totalAmount = repAmounts[userId].totalAmount;
    const count = repAmounts[userId].count;
    const averageAmount = count > 0 ? totalAmount / count : 0;

    result.push({ userId, amount: averageAmount.toFixed(3) });
  }

  return result;
}

function calculateTicketTotalsByStatus(tickets: any) {
  const ticketTotals = {};

  // Loop through tickets
  tickets.forEach((ticket) => {
    const status = ticket.status;

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
      const count = entry.count;

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
function filterData(filter: any) {
  const {
    dateRange,
    startDate,
    endDate,
    assignedUserIds,
    branchIds,
    departmentIds,
    stageId,
    tagIds,
    pipelineLabels,
    fieldsGroups,
  } = filter;
  const matchfilter = {};

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
    matchfilter['stageId'] = { $in: stageId };
  }
  if (tagIds) {
    matchfilter['tagIds'] = { $in: tagIds };
  }
  if (pipelineLabels) {
    matchfilter['labelIds'] = { $in: pipelineLabels };
  }
  if (fieldsGroups) {
    matchfilter['customFieldsData'] = {
      $elemMatch: { field: { $in: fieldsGroups } },
    };
  }
  return matchfilter;
}
async function pipelineFilterData(
  filter: any,
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
  let deals;
  deals = await models?.Deals.find({
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
      productCount: deal.productsData.length,
      totalAmount: dealAmountMap[deal.stageId],
    }));
    const title = 'Deals sales and average';
    const data = Object.values(groupStage).map((t: any) => t.totalAmount);
    const labels = Object.values(groupStage).map(
      (t: any) => 'name: ' + t.name + '    product count: ' + t.productCount,
    );
    const datasets = { title, data, labels };
    return datasets;
  } else {
    throw new Error('No deals found');
  }
}

async function PipelineAndBoardFilter(
  pipelineId: any,
  boardId: any,
  stageType: any,
  type: string,
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
      type: type,
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
      type: type,
    });
    if (findBoard) {
      const boardId = findBoard?.map((item) => item._id);
      const pipeline = await models?.Pipelines.find({
        boardId: {
          $in: boardId,
        },
        type: type,
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
    type: type,
  });
  const pipeline_ids = stages?.map((item) => item._id);
  return pipeline_ids;
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
