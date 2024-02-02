import { IUserDocument } from '@erxes/api-utils/src/types';
import { models } from './connectionResolver';
import { sendCoreMessage, sendTagsMessage } from './messageBroker';
import * as dayjs from 'dayjs';
import { getDefaultHighWaterMark } from 'stream';

const MMSTOMINS = 60000;

const MMSTOHRS = MMSTOMINS * 60;

const INBOX_TAG_TYPE = 'inbox:conversation';

const NOW = new Date();

const reportTemplates = [
  {
    serviceType: 'inbox',
    title: 'Inbox chart',
    serviceName: 'inbox',
    description: 'Chat conversation charts',
    charts: [
      'averageFirstResponseTime',
      'averageCloseTime',
      'conversationsCount',
    ],
    img: 'https://sciter.com/wp-content/uploads/2022/08/chart-js.png',
  },
];

const checkFilterParam = (param: any) => {
  return param && param.length;
};

const getDates = (startDate: Date, endDate: Date) => {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

// integrationTypess

// XOS messenger
// email
// Call
// CallPro
// FB post
// FB messenger
// SMS
// All

const DATERANGE_TYPES = [
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

const INTEGRATION_TYPES = [
  { label: 'XOS Messenger', value: 'messenger' },
  { label: 'Email', value: 'email' },
  { label: 'Call', value: 'calls' },
  { label: 'Callpro', value: 'callpro' },
  { label: 'SMS', value: 'sms' },
  { label: 'Facebook Messenger', value: 'facebook-messenger' },
  { label: 'Facebook Post', value: 'facebook-post' },
  { label: 'All', value: 'all' },
];

const STATUS_TYPES = [
  { label: 'All', value: 'all' },
  { label: 'Closed / Resolved', value: 'closed' },
  { label: 'Open', value: 'open' },
  { label: 'Unassigned', value: 'unassigned' },
];

const calculateAverage = (arr: number[]) => {
  if (!arr || !arr.length) {
    return 0; // Handle division by zero for an empty array
  }

  const sum = arr.reduce((acc, curr) => acc + curr, 0);
  return (sum / arr.length).toFixed();
};

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

const chartTemplates = [
  {
    templateType: 'averageFirstResponseTime',
    name: 'Average first response time by rep in hours',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const matchfilter = {
        'conversationMessages.internal': false,
        'conversationMessages.content': { $ne: '' },
      };

      const { startDate, endDate, tagIds } = filter;

      const { departmentIds, branchIds, userIds } = filter;

      let departmentUsers;
      let filterUserIds: any = [];

      if (checkFilterParam(departmentIds)) {
        const findDepartmentUsers = await sendCoreMessage({
          subdomain,
          action: 'users.find',
          data: {
            query: { departmentIds: { $in: filter.departmentIds } },
          },
          isRPC: true,
          defaultValue: [],
        });

        departmentUsers = findDepartmentUsers;
        filterUserIds = findDepartmentUsers.map((user) => user._id);
      }

      if (checkFilterParam(branchIds)) {
        const findBranchUsers = await sendCoreMessage({
          subdomain,
          action: 'users.find',
          data: {
            query: { branchIds: { $in: filter.branchIds } },
          },
          isRPC: true,
          defaultValue: [],
        });

        filterUserIds.push(...findBranchUsers.map((user) => user._id));
      }

      if (checkFilterParam(userIds)) {
        filterUserIds = filter.userIds;
      }

      // filter by source
      if (filter.integrationTypes && !filter.integrationTypes.includes('all')) {
        const { integrationTypes } = filter;

        const integrations: any = await models?.Integrations.find({
          kind: { $in: integrationTypes },
        });

        const integrationIds = integrations.map((i) => i._id);

        matchfilter['integrationId'] = { $in: integrationIds };
      }

      // filter by date
      if (filter.dateRange) {
        const dateFilter = returnDateRange(
          filter.dateRange,
          startDate,
          endDate,
        );

        console.log(dateFilter);

        if (Object.keys(dateFilter).length) {
          matchfilter['createdAt'] = dateFilter;
        }
      }

      if (checkFilterParam(tagIds)) {
        matchfilter['conversationMessages.tagIds'] = { $in: tagIds };
      }

      matchfilter['conversationMessages.userId'] = filterUserIds.length
        ? {
            $exists: true,
            $in: filterUserIds,
          }
        : { $exists: true };

      const conversations = await models?.Conversations.aggregate([
        {
          $lookup: {
            from: 'conversation_messages',
            let: { id: '$_id', customerFirstMessagedAt: '$createdAt' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$conversationId', '$$id'] },
                },
              },
            ],
            as: 'conversationMessages',
          },
        },
        {
          $project: {
            _id: 1,
            createdAt: 1,
            conversationMessages: 1,
            integrationId: 1,
            closedAt: 1,
            closedUserId: 1,
            firstRespondedDate: 1,
            firstRespondedUserId: 1,
            tagIds: 1,
          },
        },
        {
          $match: {
            conversationMessages: { $not: { $size: 0 } }, // Filter out documents with empty 'conversationMessages' array
          },
        },
        {
          $unwind: '$conversationMessages',
        },
        {
          $sort: {
            'conversationMessages.createdAt': 1,
          },
        },
        {
          $match: matchfilter,
        },
        {
          $group: {
            _id: '$_id',
            conversationMessages: { $push: '$conversationMessages' },
            customerMessagedAt: { $first: '$createdAt' },
            integrationId: { $first: '$integrationId' },
            closedAt: { $first: '$closedAt' },
            closedUserId: { $first: '$closedUserId' },
            firstRespondedDate: { $first: '$firstRespondedDate' },
            firstResponedUserId: { $first: '$firstResponedUserId' },
          },
        },
      ]);

      type UserWithFirstRespondTime = {
        [userId: string]: number[];
      };

      const usersWithRespondTime: UserWithFirstRespondTime = {};

      if (conversations) {
        for (const convo of conversations) {
          const {
            conversationMessages,
            firstRespondedDate,
            firstResponedUserId,
            customerMessagedAt,
          } = convo;

          if (firstRespondedDate && firstResponedUserId) {
            const respondTime =
              (new Date(firstRespondedDate).getTime() -
                new Date(customerMessagedAt).getTime()) /
              MMSTOHRS;

            if (firstResponedUserId in usersWithRespondTime) {
              usersWithRespondTime[firstResponedUserId] = [
                ...usersWithRespondTime[firstResponedUserId],
                respondTime,
              ];
            } else {
              usersWithRespondTime[firstResponedUserId] = [respondTime];
            }

            continue;
          }

          if (conversationMessages.length) {
            const getFirstRespond = conversationMessages[0];
            const { userId } = getFirstRespond;

            const respondTime =
              (new Date(getFirstRespond.createdAt).getTime() -
                new Date(customerMessagedAt).getTime()) /
              MMSTOHRS;

            if (userId in usersWithRespondTime) {
              usersWithRespondTime[userId] = [
                ...usersWithRespondTime[userId],
                respondTime,
              ];
            } else {
              usersWithRespondTime[userId] = [respondTime];
            }
          }
        }
      }

      const getTotalRespondedUsers: IUserDocument[] = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: { _id: { $in: Object.keys(usersWithRespondTime) } },
        },
        isRPC: true,
        defaultValue: [],
      });

      const usersMap = {};

      for (const user of getTotalRespondedUsers) {
        usersMap[user._id] = {
          fullName:
            user.details?.fullName ||
            `${user.details?.firstName || ''} ${user.details?.lastName || ''}`,
          avgRespondtime: calculateAverage(usersWithRespondTime[user._id]),
        };
      }

      const data = Object.values(usersMap).map((t: any) => t.avgRespondtime);

      const labels = Object.values(usersMap).map((t: any) => t.fullName);

      const title = 'Average first response time in hours';

      const datasets = { title, data, labels };

      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'userIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select users',
      },
      {
        fieldName: 'departmentIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'departments',
        fieldLabel: 'Select departments',
      },
      {
        fieldName: 'branchIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'branches',
        fieldLabel: 'Select branches',
      },
      {
        fieldName: 'integrationTypes',
        fieldType: 'select',
        fieldQuery: 'integrations',
        multi: true,
        fieldOptions: INTEGRATION_TYPES,
        fieldLabel: 'Select source',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATERANGE_TYPES,
        fieldLabel: 'Select date range',
      },
      {
        fieldName: 'tagIds',
        fieldType: 'select',
        fieldQuery: 'tags',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${INBOX_TAG_TYPE}", "perPage": 1000}`,
        multi: true,
        fieldLabel: 'Select tags',
      },
    ],
  },

  {
    templateType: 'averageCloseTime',
    name: 'Average chat close time by rep in hours',
    chartTypes: ['bar', 'doughnut', 'radar', 'polarArea', 'table'],
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const matchfilter = {
        status: /closed/gi,
        closedAt: { $exists: true },
      };

      const { departmentIds, branchIds, userIds } = filter;

      const dimensionX = dimension.x;

      let departmentUsers;
      let filterUserIds: any = [];
      const integrationsDict = {};
      let totalIntegrations;

      if (checkFilterParam(departmentIds)) {
        const findDepartmentUsers = await sendCoreMessage({
          subdomain,
          action: 'users.find',
          data: {
            query: { departmentIds: { $in: filter.departmentIds } },
          },
          isRPC: true,
          defaultValue: [],
        });

        departmentUsers = findDepartmentUsers;
        filterUserIds = findDepartmentUsers.map((user) => user._id);
      }

      if (checkFilterParam(branchIds)) {
        const findBranchUsers = await sendCoreMessage({
          subdomain,
          action: 'users.find',
          data: {
            query: { branchIds: { $in: filter.branchIds } },
          },
          isRPC: true,
          defaultValue: [],
        });

        filterUserIds.push(...findBranchUsers.map((user) => user._id));
      }

      if (checkFilterParam(userIds)) {
        filterUserIds = filter.userIds;
      }

      // filter by source
      if (filter.integrationTypes && !filter.integrationTypes.includes('all')) {
        const { integrationTypes } = filter;

        const integrations: any = await models?.Integrations.find({
          kind: { $in: integrationTypes },
        });

        const integrationIds = integrations.map((i) => i._id);

        matchfilter['integrationId'] = { $in: integrationIds };
      }

      // filter by date
      if (filter.dateRange) {
        const { startDate, endDate, dateRange } = filter;
        let dateFilter = {};

        dateFilter = returnDateRange(dateRange, startDate, endDate);

        if (Object.keys(dateFilter).length) {
          matchfilter['createdAt'] = dateFilter;
        }
      }

      matchfilter['closedUserId'] = filterUserIds.length
        ? {
            $exists: true,
            $in: filterUserIds,
          }
        : { $exists: true };

      const usersWithClosedTime = await models?.Conversations.aggregate([
        {
          $match: matchfilter,
        },

        {
          $project: {
            closeTimeDifference: { $subtract: ['$closedAt', '$createdAt'] },
            closedUserId: '$closedUserId',
          },
        },
        {
          $group: {
            _id: '$closedUserId',
            avgCloseTimeDifference: { $avg: '$closeTimeDifference' },
          },
        },
      ]);

      const usersWithClosedTimeMap = {};
      const getUserIds: string[] = [];

      if (usersWithClosedTime) {
        for (const user of usersWithClosedTime) {
          getUserIds.push(user._id);
          usersWithClosedTimeMap[user._id] = (
            user.avgCloseTimeDifference / MMSTOHRS
          ).toFixed();
        }
      }

      const getTotalClosedUsers: IUserDocument[] = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: { _id: { $in: getUserIds } },
        },
        isRPC: true,
        defaultValue: [],
      });

      const usersMap = {};

      for (const user of getTotalClosedUsers) {
        usersMap[user._id] = {
          fullName:
            user.details?.fullName ||
            `${user.details?.firstName || ''} ${user.details?.lastName || ''}`,
          avgCloseTime: usersWithClosedTimeMap[user._id],
        };
      }

      const data = Object.values(usersMap).map((t: any) => t.avgCloseTime);

      const labels = Object.values(usersMap).map((t: any) => t.fullName);

      const title = 'Average conversation close time in hours';

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'userIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select users',
      },
      {
        fieldName: 'departmentIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'departments',
        fieldLabel: 'Select departments',
      },
      {
        fieldName: 'branchIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'branches',
        fieldLabel: 'Select branches',
      },
      {
        fieldName: 'integrationTypes',
        fieldType: 'select',
        fieldQuery: 'integrations',
        multi: true,
        fieldOptions: INTEGRATION_TYPES,
        fieldLabel: 'Select source',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATERANGE_TYPES,
        fieldLabel: 'Select date range',
      },
      {
        fieldName: 'tagIds',
        fieldType: 'select',
        fieldQuery: 'tags',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${INBOX_TAG_TYPE}", "perPage": 1000}`,
        multi: true,
        fieldLabel: 'Select tags',
      },
    ],
  },
  {
    templateType: 'conversationsCount',
    name: 'Conversations count by rep',
    chartTypes: [
      'bar',
      'line',
      'pie',
      'doughnut',
      'radar',
      'polarArea',
      'table',
    ],
    getChartResult: async (filter: any, dimension: any, subdomain: string) => {
      const data: number[] = [];
      const labels: string[] = [];

      const matchfilter = {};
      const filterStatus = filter.status;

      let title = `${filterStatus} conversations' count`;

      const {
        departmentIds,
        branchIds,
        userIds,
        brandIds,
        dateRange,
        integrationTypes,
        tagIds,
      } = filter;

      const dimensionX = dimension.x;

      let departmentUsers;
      let filterUserIds: any = [];
      const integrationsDict = {};
      let totalIntegrations;

      if (checkFilterParam(departmentIds)) {
        const findDepartmentUsers = await sendCoreMessage({
          subdomain,
          action: 'users.find',
          data: {
            query: { departmentIds: { $in: filter.departmentIds } },
          },
          isRPC: true,
          defaultValue: [],
        });

        departmentUsers = findDepartmentUsers;
        filterUserIds = findDepartmentUsers.map((user) => user._id);
      }

      if (checkFilterParam(branchIds)) {
        const findBranchUsers = await sendCoreMessage({
          subdomain,
          action: 'users.find',
          data: {
            query: { branchIds: { $in: filter.branchIds } },
          },
          isRPC: true,
          defaultValue: [],
        });

        filterUserIds.push(...findBranchUsers.map((user) => user._id));
      }

      if (checkFilterParam(tagIds)) {
        matchfilter['tagIds'] = { $in: tagIds };
      }

      // if team members selected, go by team members
      if (checkFilterParam(userIds)) {
        filterUserIds = userIds;
      }

      if (dateRange) {
        const { startDate, endDate } = filter;
        const dateFilter = returnDateRange(dateRange, startDate, endDate);

        // const NOW = new Date();
        // const startOfToday = new Date(NOW.setHours(0, 0, 0, 0));
        // const endOfToday = new Date(NOW.setHours(23, 59, 59, 999));
        // const startOfYesterday = new Date(
        //   dayjs(NOW).add(-1, 'day').toDate().setHours(0, 0, 0, 0)
        // );

        // switch (dateRange) {
        //   case 'today':
        //     dateFilter['$gte'] = startOfToday;
        //     dateFilter['$lte'] = endOfToday;
        //     break;
        //   case 'yesterday':
        //     dateFilter['$gte'] = startOfYesterday;
        //     dateFilter['$lte'] = startOfToday;
        //   case 'thisWeek':
        //     dateFilter['$gte'] = dayjs(NOW).startOf('week').toDate();
        //     dateFilter['$lte'] = dayjs(NOW).endOf('week').toDate();
        //     break;

        //   case 'lastWeek':
        //     dateFilter['$gte'] = dayjs(NOW)
        //       .add(-1, 'week')
        //       .startOf('week')
        //       .toDate();
        //     dateFilter['$lte'] = dayjs(NOW)
        //       .add(-1, 'week')
        //       .endOf('week')
        //       .toDate();
        //     break;
        //   case 'lastMonth':
        //     dateFilter['$gte'] = dayjs(NOW)
        //       .add(-1, 'month')
        //       .startOf('month')
        //       .toDate();
        //     dateFilter['$lte'] = dayjs(NOW)
        //       .add(-1, 'month')
        //       .endOf('month')
        //       .toDate();
        //     break;
        //   case 'thisMonth':
        //     dateFilter['$gte'] = dayjs(NOW).startOf('month').toDate();
        //     dateFilter['$lte'] = dayjs(NOW).endOf('month').toDate();
        //     break;
        //   case 'thisYear':
        //     dateFilter['$gte'] = dayjs(NOW).startOf('year').toDate();
        //     dateFilter['$lte'] = dayjs(NOW).endOf('year').toDate();
        //     break;
        //   case 'lastYear':
        //     dateFilter['$gte'] = dayjs(NOW)
        //       .add(-1, 'year')
        //       .startOf('year')
        //       .toDate();
        //     dateFilter['$lte'] = dayjs(NOW)
        //       .add(-1, 'year')
        //       .endOf('year')
        //       .toDate();
        //     break;

        //   case 'customDate':
        //     dateFilter['$gte'] = filter.startDate;
        //     dateFilter['$lte'] = filter.endDate;
        //     break;
        //   //all
        //   default:
        //     break;
        // }

        if (Object.keys(dateFilter).length) {
          matchfilter['createdAt'] = dateFilter;
        }
      }

      // filter by status
      if (filterStatus && filterStatus !== 'all') {
        if (filterStatus === 'unassigned') {
          matchfilter['assignedUserId'] = null;
        } else {
          //open or closed
          matchfilter['status'] = filterStatus;
        }
      }

      const integrationFindQuery = {};

      // filter integrations by brands
      if (brandIds && brandIds.length) {
        integrationFindQuery['brandId'] = { $in: filter.brandIds };

        const integrations: any =
          await models?.Integrations.find(integrationFindQuery);

        const integrationIds = integrations.map((i) => i._id);

        matchfilter['integrationId'] = { $in: integrationIds };
      }

      // filter by source
      if (filter.integrationTypes && !filter.integrationTypes.includes('all')) {
        const { integrationTypes } = filter;

        integrationFindQuery['kind'] = { $in: integrationTypes };

        const integrations: any =
          await models?.Integrations.find(integrationFindQuery);

        totalIntegrations = integrations;

        const integrationIds: string[] = [];

        for (const integration of integrations) {
          integrationsDict[integration._id] = integration.kind;
          integrationIds.push(integration._id);
        }

        matchfilter['integrationId'] = { $in: integrationIds };
      }

      let userIdGroup;
      let groupByQuery;

      if (filterStatus === 'open' || filterStatus === 'all') {
        matchfilter['assignedUserId'] =
          filter &&
          ((userIds && userIds.length) ||
            (departmentIds && departmentIds.length) ||
            (branchIds && branchIds.length))
            ? {
                $exists: true,
                $in: filterUserIds,
              }
            : { $exists: true, $ne: null };

        userIdGroup = {
          $group: {
            _id: '$assignedUserId',
            conversationsCount: {
              $sum: 1,
            },
          },
        };
      }
      if (filterStatus === 'closed') {
        matchfilter['closedUserId'] =
          filter && (filter.userIds || filter.departmentIds || filter.branchIds)
            ? {
                $exists: true,
                $in: filterUserIds,
              }
            : { $exists: true };

        userIdGroup = {
          $group: {
            _id: '$closedUserId',
            conversationsCount: { $sum: 1 },
          },
        };
      }

      if (filterStatus === 'unassigned') {
        const totalUnassignedConvosCount =
          (await models?.Conversations.count(matchfilter)) || 0;

        data.push(totalUnassignedConvosCount);
        labels.push('Total unassigned conversations');

        return { title, data, labels };
      }

      // add dimensions
      if (dimensionX === 'status') {
        groupByQuery = {
          $group: {
            _id: '$status',
            conversationsCount: { $sum: 1 },
          },
        };

        const convosCountByStatus = await models?.Conversations.aggregate([
          {
            $match: matchfilter,
          },
          groupByQuery,
        ]);

        if (convosCountByStatus) {
          for (const convo of convosCountByStatus) {
            data.push(convo.conversationsCount);
            labels.push(convo._id);
          }
        }

        title = 'Conversations count by status';
        const datasets = { title, data, labels };

        return datasets;
      }

      const usersWithConvosCount = await models?.Conversations.aggregate([
        {
          $match: matchfilter,
        },
        userIdGroup,
      ]);

      const getUserIds: string[] =
        usersWithConvosCount?.map((r) => r._id) || [];

      const getTotalUsers: IUserDocument[] = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: { _id: { $in: getUserIds } },
        },
        isRPC: true,
        defaultValue: [],
      });

      const usersMap = {};
      for (const user of getTotalUsers) {
        usersMap[user._id] = {
          fullName:
            user.details?.fullName ||
            `${user.details?.firstName || ''} ${user.details?.lastName || ''}`,
          departmentIds: user.departmentIds,
          branchIds: user.branchIds,
        };
      }

      // department
      if (dimensionX === 'department') {
        const departmentsDict = {};

        const departmentsQuery =
          departmentIds && departmentIds.length
            ? { query: { _id: { $in: departmentIds } } }
            : {};

        const departments = await sendCoreMessage({
          subdomain,
          action: 'departments.find',
          data: departmentsQuery,
          isRPC: true,
          defaultValue: [],
        });

        for (const department of departments) {
          departmentsDict[department._id] = {
            title: department.title,
            conversationsCount: 0,
          };
        }

        if (usersWithConvosCount) {
          for (const user of usersWithConvosCount) {
            if (!usersMap[user._id] || !usersMap[user._id].departmentIds) {
              continue;
            }

            for (const departmentId of usersMap[user._id].departmentIds) {
              if (!departmentsDict[departmentId]) {
                continue;
              }

              const getOldConvosCount =
                departmentsDict[departmentId].conversationsCount;

              const incrementCount =
                getOldConvosCount + user.conversationsCount;

              departmentsDict[departmentId] = {
                conversationsCount: incrementCount,
                title: departmentsDict[departmentId].title,
              };
            }
          }

          title = 'Conversations count by departments';

          for (const deptId of Object.keys(departmentsDict)) {
            labels.push(departmentsDict[deptId].title);
            data.push(departmentsDict[deptId].conversationsCount);
          }
        }

        return { title, labels, data };
      }

      // branch
      if (dimensionX === 'branch') {
        const branchesDict = {};

        const branchesQuery =
          branchIds && branchIds.length
            ? { query: { _id: { $in: branchIds } } }
            : {};

        const branches = await sendCoreMessage({
          subdomain,
          action: 'branches.find',
          data: branchesQuery,
          isRPC: true,
          defaultValue: [],
        });

        for (const branch of branches) {
          branchesDict[branch._id] = {
            title: branch.title,
            conversationsCount: 0,
          };
        }

        if (usersWithConvosCount) {
          for (const user of usersWithConvosCount) {
            if (!usersMap[user._id] || !usersMap[user._id].branchIds) {
              continue;
            }

            for (const branchId of usersMap[user._id].branchIds) {
              if (!branchesDict[branchId]) {
                continue;
              }

              const getOldConvosCount =
                branchesDict[branchId].conversationsCount;

              const incrementCount =
                getOldConvosCount + user.conversationsCount;

              branchesDict[branchId] = {
                conversationsCount: incrementCount,
                title: branchesDict[branchId].title,
              };
            }
          }

          title = 'Conversations count by departments';

          for (const branchId of Object.keys(branchesDict)) {
            labels.push(branchesDict[branchId].title);
            data.push(branchesDict[branchId].conversationsCount);
          }
        }

        return { title, labels, data };
      }

      //source
      if (dimensionX === 'source') {
        const sourcesDict = {};

        groupByQuery = {
          $group: {
            _id: '$integrationId',
            conversationsCount: { $sum: 1 },
          },
        };

        const convosCountBySource = await models?.Conversations.aggregate([
          {
            $match: { ...matchfilter, integrationId: { $exists: true } },
          },
          groupByQuery,
        ]);

        const integrations = await models?.Integrations.find({});

        if (integrations) {
          for (const i of integrations) {
            integrationsDict[i._id] = i.kind;
          }
        }

        if (convosCountBySource) {
          for (const convo of convosCountBySource) {
            const integrationId = convo._id;
            if (!integrationsDict[integrationId]) {
              continue;
            }
            const integrationKind = integrationsDict[integrationId];

            if (!sourcesDict[integrationKind]) {
              sourcesDict[integrationKind] = convo.conversationsCount;
              continue;
            }

            //increment
            const getOldCount = sourcesDict[integrationKind];
            const increment = getOldCount + convo.conversationsCount;
            sourcesDict[integrationKind] = increment;
          }

          for (const source of Object.keys(sourcesDict)) {
            labels.push(source);
            data.push(sourcesDict[source]);
          }
        }

        const title = 'Conversations count by source';
        return { title, labels, data };
      }

      //brand
      if (dimensionX === 'brand') {
        const query =
          brandIds && brandIds.length ? { _id: { $in: brandIds } } : {};

        const brandsMap: { [brandId: string]: string } = {};

        const brands = await sendCoreMessage({
          subdomain,
          action: 'brands.find',
          data: {
            query,
          },
          isRPC: true,
          defaultValue: [],
        });

        groupByQuery = {
          $group: {
            _id: '$integrationId',
            conversationsCount: { $sum: 1 },
          },
        };

        for (const brand of brands) {
          brandsMap[brand._id] = brand.name;
        }

        const convosCountBySource = await models?.Conversations.aggregate([
          {
            $match: { ...matchfilter, integrationId: { $exists: true } },
          },
          groupByQuery,
        ]);

        if (convosCountBySource && convosCountBySource.length) {
          const integrationsCountMap = {};
          const brandsCountMap = {};

          const integrationsMap = {};

          for (const convo of convosCountBySource) {
            integrationsCountMap[convo._id] = convo.conversationsCount;
          }

          const ingegrations =
            (await models?.Integrations.find({
              _id: { $in: convosCountBySource.map((c) => c._id) },
            })) || [];

          for (const integration of ingegrations) {
            if (integration.brandId) {
              const { brandId } = integration;

              if (brandsCountMap[brandId]) {
                const getOldConvosCount = brandsCountMap[brandId];
                brandsCountMap[brandId] =
                  getOldConvosCount + integrationsCountMap[integration._id];
              }
              brandsCountMap[brandId] =
                integrationsCountMap[integration._id] || 0;
            }
          }

          for (const brandId of Object.keys(brandsCountMap)) {
            labels.push(brandsMap[brandId]);
            data.push(brandsCountMap[brandId]);
          }

          const title = 'Conversations count by brand';
          return { title, labels, data };
        }
      }

      //tag
      if (dimensionX === 'tag') {
        const query = checkFilterParam(tagIds) ? { _id: { $in: tagIds } } : {};

        const tags = await sendTagsMessage({
          subdomain,
          action: 'find',
          data: {
            ...query,
          },
          isRPC: true,
          defaultValue: [],
        });

        const tagsMap: { [key: string]: string } = {};

        for (const tag of tags) {
          tagsMap[tag._id] = tag.name;
        }

        groupByQuery = {
          $group: {
            _id: '$tagIds',
            conversationsCount: { $sum: 1 },
          },
        };

        const convosCountByTag = await models?.Conversations.aggregate([
          {
            $match: { ...matchfilter, integrationId: { $exists: true } },
          },
          { $unwind: '$tagIds' },
          groupByQuery,
        ]);

        if (convosCountByTag) {
          for (const convo of convosCountByTag) {
            data.push(convo.conversationsCount);
            labels.push(tagsMap[convo._id]);
          }
        }

        const title = 'Conversations count by tag';

        return { title, labels, data };
      }

      // frequency

      if (dimensionX === 'frequency') {
        const convosCountByDateRange =
          (await models?.Conversations.find(matchfilter)) || [];

        if (dateRange) {
          if (dateRange === 'today' || dateRange === 'yesterday') {
            labels.push(dateRange);
            data.push(convosCountByDateRange.length);
          }

          // { label: 'All time', value: 'all' },
          // { label: 'Today', value: 'today' },
          // { label: 'Yesterday', value: 'yesterday' },
          // { label: 'This Week', value: 'thisWeek' },
          // { label: 'Last Week', value: 'lastWeek' },
          // { label: 'This Month', value: 'thisMonth' },
          // { label: 'Last Month', value: 'lastMonth' },
          // { label: 'This Year', value: 'thisYear' },
          // { label: 'Last Year', value: 'lastYear' },
          // { label: 'Custom Date', value: 'customDate' }

          if (dateRange.toLowerCase().includes('week')) {
            if (dateRange === 'thisWeek') {
              dayjs().set;
              const startOfThisWeek = dayjs(NOW).startOf('week').toDate();
              const endOfThisWeek = dayjs(NOW).endOf('week').toDate();

              console.log(dayjs(startOfThisWeek).format('YYYY-MM-DD hh:mm'));
              console.log(dayjs(endOfThisWeek).format('YYYY-MM-DD hh:mm'));

              console.log(startOfThisWeek, endOfThisWeek, ' ````````````````');

              const dates = getDates(startOfThisWeek, endOfThisWeek);
              console.log(dates);
            }

            if (dateRange === 'lastWeek') {
              // const startOfLastWeek = dayjs(NOW).
            }
          }
        }

        const title = `Conversations count of ${dateRange}`;

        return { title, labels, data };
      }

      // team members
      if (usersWithConvosCount) {
        for (const user of usersWithConvosCount) {
          if (!usersMap[user._id]) {
            continue;
          }

          data.push(user.conversationsCount);
          labels.push(usersMap[user._id].fullName);
        }
      }

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: 'status',
        fieldType: 'select',
        multi: false,
        fieldOptions: STATUS_TYPES,
        fieldLabel: 'Select conversation status',
      },

      {
        fieldName: 'userIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'users',
        fieldLabel: 'Select users',
      },
      {
        fieldName: 'departmentIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'departments',
        fieldLabel: 'Select departments',
      },
      {
        fieldName: 'branchIds',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'branches',
        fieldLabel: 'Select branches',
      },
      {
        fieldName: 'integrationTypes',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'integrations',
        fieldOptions: INTEGRATION_TYPES,
        fieldLabel: 'Select source',
      },
      {
        fieldName: 'brandIds',
        fieldType: 'select',
        fieldQuery: 'allBrands',
        multi: true,
        fieldLabel: 'Select brands',
      },
      {
        fieldName: 'dateRange',
        fieldType: 'select',
        multi: true,
        fieldQuery: 'date',
        fieldOptions: DATERANGE_TYPES,
        fieldLabel: 'Select date range',
      },
      {
        fieldName: 'tagIds',
        fieldType: 'select',
        fieldQuery: 'tags',
        fieldValueVariable: '_id',
        fieldLabelVariable: 'name',
        fieldQueryVariables: `{"type": "${INBOX_TAG_TYPE}", "perPage": 1000}`,
        multi: true,
        fieldLabel: 'Select tags',
      },
    ],
  },
];

const getChartResult = async ({ subdomain, data }) => {
  const { templateType, filter, dimension } = data;

  const template =
    chartTemplates.find((t) => t.templateType === templateType) || ({} as any);

  return template.getChartResult(filter, dimension, subdomain);
};

export default {
  chartTemplates,
  reportTemplates,
  getChartResult,
};
