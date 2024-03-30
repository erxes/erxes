import * as dayjs from 'dayjs';
import {
  ACTION_PIPELINES,
  ACTION_PIPELINE_TYPE,
  DEVIATION_PIPELINES,
  MONTH_NAMES,
  NOW,
} from './constants';
import {
  sendCardsMessage,
  sendCoreMessage,
  sendLogsMessage,
} from '../messageBroker';
import { generateChildrenIds } from '../graphql/resolvers/utils';

export const getDates = (startDate: Date, endDate: Date) => {
  const result: { start: Date; end: Date; label: string }[] = [];
  let currentDate = new Date(startDate);

  // Loop through each day between start and end dates
  while (dayjs(currentDate) <= dayjs(endDate)) {
    // Calculate the start date of the current day (00:00:00)
    let startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);

    // Calculate the end date of the current day (23:59:59)
    let endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Add the start and end dates of the current day to the result array
    result.push({
      start: startOfDay,
      end: endOfDay,
      label: dayjs(startOfDay).format('M/D dd'),
    });

    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
};

export const getMonths = (startDate: Date, endDate: Date) => {
  // Initialize an array to store the results
  const result: { start: Date; end: Date; label: string }[] = [];

  // Clone the start date to avoid modifying the original date
  let currentDate = new Date(startDate);

  // Loop through each month between start and end dates
  while (dayjs(currentDate) <= dayjs(endDate)) {
    // Get the year and month of the current date
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Calculate the start date of the current month
    const startOfMonth = new Date(year, month, 1);

    // Calculate the end date of the current month
    const endOfMonth = new Date(year, month + 1, 0);

    // Add the start and end dates of the current month to the result array
    result.push({
      start: startOfMonth,
      end: endOfMonth,
      label: MONTH_NAMES[startOfMonth.getMonth()],
    });

    // Move to the next month
    currentDate.setMonth(month + 1);
  }

  return result;
};

export const getWeeks = (startDate: Date, endDate: Date) => {
  // Initialize an array to store the results
  const result: { start: Date; end: Date; label: string }[] = [];

  // Clone the start date to avoid modifying the original date
  let currentDate = new Date(startDate);
  let weekIndex = 1;
  // Move to the first day of the week (Sunday)
  currentDate.setDate(currentDate.getDate() - currentDate.getDay());

  // Loop through each week between start and end dates
  while (dayjs(currentDate) <= dayjs(endDate)) {
    // Calculate the start date of the current week
    const startOfWeek = new Date(currentDate);

    // Calculate the end date of the current week (Saturday)
    const endOfWeek = new Date(currentDate);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const dateFormat = 'M/D';
    const label = `Week ${weekIndex} ${dayjs(startOfWeek).format(
      dateFormat,
    )} - ${dayjs(endOfWeek).format(dateFormat)}`;

    // Add the start and end dates of the current week to the result array
    result.push({ start: startOfWeek, end: endOfWeek, label });

    // Move to the next week
    currentDate.setDate(currentDate.getDate() + 7);
    weekIndex++;
  }

  return result;
};

export const returnDateRange = (
  dateRange: string,
  startDate: Date,
  endDate: Date,
) => {
  const startOfToday = new Date(NOW.setHours(0, 0, 0, 0));
  const endOfToday = new Date(NOW.setHours(23, 59, 59, 999));
  const startOfYesterday = new Date(
    dayjs(NOW).add(-1, 'day').toDate().setHours(0, 0, 0, 0),
  );
  const startOfTheDayBeforeYesterday = new Date(
    dayjs(NOW).add(-2, 'day').toDate().setHours(0, 0, 0, 0),
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
      break;
    case 'last72h':
      $gte = startOfTheDayBeforeYesterday;
      $lte = startOfToday;
      break;
    case 'thisWeek':
      $gte = dayjs(NOW).startOf('week').toDate();
      $lte = dayjs(NOW).endOf('week').toDate();
      break;
    case 'lastWeek':
      $gte = dayjs(NOW).add(-1, 'week').startOf('week').toDate();
      $lte = dayjs(NOW).add(-1, 'week').endOf('week').toDate();
      break;
    case 'last2Week':
      $gte = dayjs(NOW).add(-2, 'week').startOf('week').toDate();
      $lte = dayjs(NOW).add(-1, 'week').endOf('week').toDate();
      break;
    case 'last3Week':
      $gte = dayjs(NOW).add(-3, 'week').startOf('week').toDate();
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
      $gte = new Date(startDate);
      $lte = new Date(endDate);
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

export const returnDateRanges = (
  dateRange: string,
  $gte: Date,
  $lte: Date,
  customDateFrequencyType?: string,
) => {
  let dateRanges;

  if (dateRange.toLowerCase().includes('week')) {
    dateRanges = getDates($gte, $lte);
  }
  if (dateRange.toLowerCase().includes('month')) {
    dateRanges = getWeeks($gte, $lte);
  }
  if (dateRange.toLowerCase().includes('year')) {
    dateRanges = getMonths($gte, $lte);
  }

  if (dateRange === 'customDate') {
    if (customDateFrequencyType) {
      switch (customDateFrequencyType) {
        case 'byMonth':
          dateRanges = getMonths($gte, $lte);
          return dateRanges;
        case 'byWeek':
          dateRanges = getWeeks($gte, $lte);
          return dateRanges;
      }
    }
    // by date
    dateRanges = getDates($gte, $lte);
  }

  return dateRanges;
};

export const generateGroupIds = async (ids: string[], type: string, subdomain: string) => {

  const childIds: { [parentId: string]: string[] }[] = [];

  if (!ids) {
    return []
  }

  if (type === "branch") {
    for (const branchId of ids) {
      const branchIds = await generateChildrenIds({
        subdomain,
        action: 'branches.find',
        query: { _id: { $in: [branchId] } },
        type: 'branch'
      });
      childIds.push({ [branchId]: branchIds });
    }
  }

  if (type === "department") {
    for (const departmentId of ids) {
      const departmentIds = await generateChildrenIds(
        {
          subdomain,
          action: 'departments.find',
          query: { _id: { $in: [departmentId] } },
          type: 'department'
        }
      )
      childIds.push({ [departmentId]: departmentIds });
    }
  }

  return childIds;
}

export const buildMatchFilter = async (filter, subdomain, type: string) => {
  const {
    branchIds,
    departmentIds,
    createdUserIds,
    assignedUserIds,
    closedUserIds,
    assetIds,
    pipelineIds,
    stageIds,
    pipelineLabelIds,
    dateRange,
  } = filter;
  const matchfilter = {};
  const getPipelineIds: string[] = [];

  if (branchIds && branchIds.length) {

    const getBranchIds = await generateChildrenIds(
      {
        subdomain,
        action: 'branches.find',
        query: { _id: { $in: branchIds } },
        type: 'branch'
      }
    )

    matchfilter['branchIds'] = { $in: getBranchIds };
  }

  if (departmentIds && departmentIds.length) {

    const getDepartmentIds = await generateChildrenIds(
      {
        subdomain,
        action: 'departments.find',
        query: { _id: { $in: departmentIds } },
        type: 'department'
      }
    )
    matchfilter['departmentIds'] = { $in: getDepartmentIds };
  }

  if (createdUserIds && createdUserIds.length) {
    matchfilter['userId'] = { $in: createdUserIds };
  }

  if (assignedUserIds && assignedUserIds.length) {
    matchfilter['assignedUserIds'] = { $in: assignedUserIds };
  }

  if (closedUserIds && closedUserIds.length) {
    const closedCardItemIds: string[] = [];

    const stageIds = await getStageIds(subdomain, type, true);

    const logs = await sendLogsMessage({
      subdomain,
      action: 'activityLogs.findMany',
      data: {
        query: {
          contentType: `cards:${type}`,
          createdBy: { $in: closedUserIds },
          'content.destinationStageId': { $in: stageIds },
          action: 'moved',
        },
      },
      isRPC: true,
      defaultValue: [],
    });

    closedCardItemIds.push(...logs.map((log) => log.contentId));

    matchfilter['_id'] = { $in: closedCardItemIds };
  }

  if (assetIds && assetIds.length) {
    matchfilter['customFieldsData.value'] = { $in: assetIds };
  }

  if (pipelineIds && pipelineIds.length) {
    const pipelines = await sendCardsMessage({
      subdomain,
      action: 'pipelines.find',
      data: {
        _id: {
          $in: pipelineIds,
        },
        type,
      },
      isRPC: true,
      defaultValue: null,
    });

    getPipelineIds.push(...pipelines.map((pipeline) => pipeline._id));
  }

  if (getPipelineIds && getPipelineIds.length) {
    const stages = await sendCardsMessage({
      subdomain,
      action: 'stages.find',
      data: {
        pipelineId: {
          $in: getPipelineIds,
        },
        type,
      },
      isRPC: true,
      defaultValue: null,
    });

    const getStageIds = stages.map((stage) => stage._id);
    matchfilter['stageId'] = { $in: getStageIds };

    if (stageIds && stageIds.length) {
      matchfilter['stageId'] = { $in: stageIds };
    }
  }

  if (pipelineLabelIds && pipelineLabelIds.length) {
    matchfilter['labelIds'] = { $in: pipelineLabelIds };
  }

  if (dateRange) {
    const { startDate, endDate } = filter;
    const dateFilter = returnDateRange(dateRange, startDate, endDate);

    if (Object.keys(dateFilter).length) {
      matchfilter['createdAt'] = dateFilter;
    }
  }

  return matchfilter;
};

export const getDetails = async ({ subdomain, params }) => {
  const { getUserIds, getLabelIds, getBranchIds, getDepartmentIds } = params;

  const detailsMap = {};

  if (getUserIds) {
    const getTotalUsers = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: { query: { _id: { $in: getUserIds }, isActive: true } },
      isRPC: true,
      defaultValue: [],
    });

    for (const user of getTotalUsers) {
      detailsMap[user._id] = {
        fullName:
          user.details?.fullName ||
          `${user.details?.firstName || ''} ${user.details?.lastName || ''}`,
        departmentIds: user.departmentIds,
        branchIds: user.branchIds,
      };
    }
  }

  if (getBranchIds) {
    const getTotalBranches = await sendCoreMessage({
      subdomain,
      action: 'branches.find',
      data: { _id: { $in: getBranchIds } },
      isRPC: true,
      defaultValue: [],
    });

    for (const branch of getTotalBranches) {
      detailsMap[branch._id] = {
        title: branch.title,
      };
    }
  }

  if (getDepartmentIds) {
    const getTotalDepartments = await sendCoreMessage({
      subdomain,
      action: 'departments.find',
      data: { _id: { $in: getDepartmentIds } },
      isRPC: true,
      defaultValue: [],
    });

    for (const department of getTotalDepartments) {
      detailsMap[department._id] = {
        title: department.title,
      };
    }
  }

  if (getLabelIds) {
    const getTotalLabels = await sendCardsMessage({
      subdomain,
      action: 'pipelineLabels.find',
      data: { _id: { $in: getLabelIds } },
      isRPC: true,
      defaultValue: null,
    });

    for (const label of getTotalLabels) {
      detailsMap[label._id] = {
        title: label.name,
      };
    }
  }

  return detailsMap;
};

export const getStageIds = async (
  subdomain,
  type: string,
  closed?: boolean,
) => {
  const name = type === 'ticket' ? 'Deviation' : 'Action';
  const names = type === 'ticket' ? DEVIATION_PIPELINES : ACTION_PIPELINES;

  const board = await sendCardsMessage({
    subdomain,
    action: 'boards.findOne',
    data: {
      type: type,
      name,
    },
    isRPC: true,
    defaultValue: null,
  });

  const pipelines = await sendCardsMessage({
    subdomain,
    action: 'pipelines.find',
    data: {
      type: type,
      boardId: board._id,
      name: { $in: names },
    },
    isRPC: true,
    defaultValue: null,
  });

  const pipelineIds = pipelines.map((pipeline) => pipeline._id);

  if (closed) {
    const stages = await sendCardsMessage({
      subdomain,
      action: 'stages.find',
      data: {
        type: type,
        name: 'Хаасан',
        pipelineId: { $in: pipelineIds },
      },
      isRPC: true,
      defaultValue: null,
    });

    const stageIds = stages.map((stage) => stage._id);

    return stageIds;
  }

  const stages = await sendCardsMessage({
    subdomain,
    action: 'stages.find',
    data: {
      type: type,
      pipelineId: { $in: pipelineIds },
    },
    isRPC: true,
    defaultValue: null,
  });

  const stageIds = stages.map((stage) => stage._id);

  return stageIds;
};
