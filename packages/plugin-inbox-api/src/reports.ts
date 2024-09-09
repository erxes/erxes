import { IUserDocument } from "@erxes/api-utils/src/types";
import { sendCoreMessage } from "./messageBroker";
import * as dayjs from "dayjs";
import { IModels, generateModels } from "./connectionResolver";

const MMSTOMINS = 60000;

const MMSTOHRS = MMSTOMINS * 60;

const INBOX_TAG_TYPE = "inbox:conversation";

const NOW = new Date();

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const reportTemplates = [
  {
    serviceType: "inbox",
    title: "Inbox chart",
    serviceName: "inbox",
    description: "Chat conversation charts",
    charts: [
      "averageFirstResponseTime",
      "averageCloseTime",
      "closedConversationsCountByRep",
      "conversationsCountByTag",
      "conversationsCountBySource",
      "conversationsCountByRep",
      "conversationsCountByStatus",
      "conversationsCount"
    ],
    img: "https://sciter.com/wp-content/uploads/2022/08/chart-js.png"
  }
];

const DIMENSION_OPTIONS = [
  { label: "Team members", value: "teamMember" },
  { label: "Departments", value: "department" },
  { label: "Branches", value: "branch" },
  { label: "Source/Channel", value: "source" },
  { label: "Brands", value: "brand" },
  { label: "Tags", value: "tag" },
  { label: "Labels", value: "label" },
  { label: "Frequency (day, week, month)", value: "frequency" },
  { label: "Status", value: "status" }
];

const checkFilterParam = (param: any) => {
  return param && param.length;
};

const getDates = (startDate: Date, endDate: Date) => {
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
      label: dayjs(startOfDay).format("M/D dd")
    });

    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
};

const getMonths = (startDate: Date, endDate: Date) => {
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
      label: MONTH_NAMES[startOfMonth.getMonth()]
    });

    // Move to the next month
    currentDate.setMonth(month + 1);
  }

  return result;
};

const getWeeks = (startDate: Date, endDate: Date) => {
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

    const dateFormat = "M/D";
    const label = `Week ${weekIndex} ${dayjs(startOfWeek).format(
      dateFormat
    )} - ${dayjs(endOfWeek).format(dateFormat)}`;

    // Add the start and end dates of the current week to the result array
    result.push({ start: startOfWeek, end: endOfWeek, label });

    // Move to the next week
    currentDate.setDate(currentDate.getDate() + 7);
    weekIndex++;
  }

  return result;
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
  { label: "All time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "thisWeek" },
  { label: "Last Week", value: "lastWeek" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "This Year", value: "thisYear" },
  { label: "Last Year", value: "lastYear" },
  { label: "Custom Date", value: "customDate" }
];

const CUSTOM_DATE_FREQUENCY_TYPES = [
  { label: "By week", value: "byWeek" },
  { label: "By month", value: "byMonth" },
  { label: "By date", value: "byDate" }
];

const INTEGRATION_TYPES = [
  { label: "XOS Messenger", value: "messenger" },
  { label: "Email", value: "email" },
  { label: "Call", value: "calls" },
  { label: "Callpro", value: "callpro" },
  { label: "SMS", value: "sms" },
  { label: "Facebook Messenger", value: "facebook-messenger" },
  { label: "Facebook Post", value: "facebook-post" },
  { label: "All", value: "all" }
];

const STATUS_TYPES = [
  { label: "All", value: "all" },
  { label: "Closed / Resolved", value: "closed" },
  { label: "Open", value: "open" },
  { label: "Unassigned", value: "unassigned" }
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
    dayjs(NOW).add(-1, "day").toDate().setHours(0, 0, 0, 0)
  );

  let $gte;
  let $lte;

  switch (dateRange) {
    case "today":
      $gte = startOfToday;
      $lte = endOfToday;
      break;
    case "yesterday":
      $gte = startOfYesterday;
      $lte = startOfToday;
    case "thisWeek":
      $gte = dayjs(NOW).startOf("week").toDate();
      $lte = dayjs(NOW).endOf("week").toDate();
      break;

    case "lastWeek":
      $gte = dayjs(NOW).add(-1, "week").startOf("week").toDate();
      $lte = dayjs(NOW).add(-1, "week").endOf("week").toDate();
      break;
    case "lastMonth":
      $gte = dayjs(NOW).add(-1, "month").startOf("month").toDate();
      $lte = dayjs(NOW).add(-1, "month").endOf("month").toDate();
      break;
    case "thisMonth":
      $gte = dayjs(NOW).startOf("month").toDate();
      $lte = dayjs(NOW).endOf("month").toDate();
      break;
    case "thisYear":
      $gte = dayjs(NOW).startOf("year").toDate();
      $lte = dayjs(NOW).endOf("year").toDate();
      break;
    case "lastYear":
      $gte = dayjs(NOW).add(-1, "year").startOf("year").toDate();
      $lte = dayjs(NOW).add(-1, "year").endOf("year").toDate();
      break;
    case "customDate":
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

const returnDateRanges = (
  dateRange: string,
  $gte: Date,
  $lte: Date,
  customDateFrequencyType?: string
) => {
  let dateRanges;

  if (dateRange.toLowerCase().includes("week")) {
    dateRanges = getDates($gte, $lte);
  }
  if (dateRange.toLowerCase().includes("month")) {
    dateRanges = getWeeks($gte, $lte);
  }
  if (dateRange.toLowerCase().includes("year")) {
    dateRanges = getMonths($gte, $lte);
  }

  if (dateRange === "customDate") {
    if (customDateFrequencyType) {
      switch (customDateFrequencyType) {
        case "byMonth":
          dateRanges = getMonths($gte, $lte);
          return dateRanges;
        case "byWeek":
          dateRanges = getWeeks($gte, $lte);
          return dateRanges;
      }
    }
    // by date
    dateRanges = getDates($gte, $lte);
  }

  return dateRanges;
};

const chartTemplates = [
  {
    templateType: "averageFirstResponseTime",
    serviceType: "inbox",
    name: "Average first response time by rep in hours",
    chartTypes: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "table"
    ],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string
    ) => {
      const matchfilter = {
        "conversationMessages.internal": false,
        "conversationMessages.content": { $ne: "" }
      };

      const { startDate, endDate, tagIds } = filter;

      const { departmentIds, branchIds, userIds } = filter;

      let departmentUsers;
      let filterUserIds: any = [];

      if (checkFilterParam(departmentIds)) {
        const findDepartmentUsers = await sendCoreMessage({
          subdomain,
          action: "users.find",
          data: {
            query: {
              departmentIds: { $in: filter.departmentIds },
              isActive: true
            }
          },
          isRPC: true,
          defaultValue: []
        });

        departmentUsers = findDepartmentUsers;
        filterUserIds = findDepartmentUsers.map(user => user._id);
      }

      if (checkFilterParam(branchIds)) {
        const findBranchUsers = await sendCoreMessage({
          subdomain,
          action: "users.find",
          data: {
            query: { branchIds: { $in: filter.branchIds }, isActive: true }
          },
          isRPC: true,
          defaultValue: []
        });

        filterUserIds.push(...findBranchUsers.map(user => user._id));
      }

      if (checkFilterParam(userIds)) {
        filterUserIds = filter.userIds;
      }

      // filter by source
      if (filter.integrationTypes && !filter.integrationTypes.includes("all")) {
        const { integrationTypes } = filter;

        const integrations: any = await models.Integrations.find({
          kind: { $in: integrationTypes }
        });

        const integrationIds = integrations.map(i => i._id);

        matchfilter["integrationId"] = { $in: integrationIds };
      }

      // filter by date
      if (filter.dateRange) {
        const dateFilter = returnDateRange(
          filter.dateRange,
          startDate,
          endDate
        );

        if (Object.keys(dateFilter).length) {
          matchfilter["createdAt"] = dateFilter;
        }
      }

      if (checkFilterParam(tagIds)) {
        matchfilter["conversationMessages.tagIds"] = { $in: tagIds };
      }

      matchfilter["conversationMessages.userId"] = filterUserIds.length
        ? {
            $exists: true,
            $in: filterUserIds
          }
        : { $exists: true };

      const conversations = await models.Conversations.aggregate([
        {
          $lookup: {
            from: "conversation_messages",
            let: { id: "$_id", customerFirstMessagedAt: "$createdAt" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$conversationId", "$$id"] }
                }
              }
            ],
            as: "conversationMessages"
          }
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
            tagIds: 1
          }
        },
        {
          $match: {
            conversationMessages: { $not: { $size: 0 } } // Filter out documents with empty 'conversationMessages' array
          }
        },
        {
          $unwind: "$conversationMessages"
        },
        {
          $sort: {
            "conversationMessages.createdAt": 1
          }
        },
        {
          $match: matchfilter
        },
        {
          $group: {
            _id: "$_id",
            conversationMessages: { $push: "$conversationMessages" },
            customerMessagedAt: { $first: "$createdAt" },
            integrationId: { $first: "$integrationId" },
            closedAt: { $first: "$closedAt" },
            closedUserId: { $first: "$closedUserId" },
            firstRespondedDate: { $first: "$firstRespondedDate" },
            firstResponedUserId: { $first: "$firstResponedUserId" }
          }
        }
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
            customerMessagedAt
          } = convo;

          if (firstRespondedDate && firstResponedUserId) {
            const respondTime =
              (new Date(firstRespondedDate).getTime() -
                new Date(customerMessagedAt).getTime()) /
              MMSTOHRS;

            if (firstResponedUserId in usersWithRespondTime) {
              usersWithRespondTime[firstResponedUserId] = [
                ...usersWithRespondTime[firstResponedUserId],
                respondTime
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
                respondTime
              ];
            } else {
              usersWithRespondTime[userId] = [respondTime];
            }
          }
        }
      }

      const getTotalRespondedUsers: IUserDocument[] = await sendCoreMessage({
        subdomain,
        action: "users.find",
        data: {
          query: {
            _id: { $in: Object.keys(usersWithRespondTime) },
            isActive: true
          }
        },
        isRPC: true,
        defaultValue: []
      });

      const usersMap = {};

      for (const user of getTotalRespondedUsers) {
        usersMap[user._id] = {
          fullName:
            user.details?.fullName ||
            `${user.details?.firstName || ""} ${user.details?.lastName || ""}`,
          avgRespondtime: calculateAverage(usersWithRespondTime[user._id])
        };
      }

      const data = Object.values(usersMap).map((t: any) => t.avgRespondtime);

      const labels = Object.values(usersMap).map((t: any) => t.fullName);

      const title = "Average first response time in hours";

      const datasets = { title, data, labels };

      return datasets;
    },

    filterTypes: [
      {
        fieldName: "userIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "users",
        fieldLabel: "Select users"
      },
      {
        fieldName: "departmentIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "departments",
        fieldLabel: "Select departments"
      },
      {
        fieldName: "branchIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "branches",
        fieldLabel: "Select branches"
      },
      {
        fieldName: "integrationTypes",
        fieldType: "select",
        fieldQuery: "integrations",
        multi: true,
        fieldOptions: INTEGRATION_TYPES,
        fieldLabel: "Select source"
      },
      {
        fieldName: "tagIds",
        fieldType: "select",
        fieldQuery: "tags",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${INBOX_TAG_TYPE}", "perPage": 1000}`,
        multi: true,
        fieldLabel: "Select tags"
      },
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATERANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      }
    ]
  },

  {
    templateType: "averageCloseTime",
    serviceType: "inbox",
    name: "Average chat close time by rep in hours",
    chartTypes: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "table"
    ],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string
    ) => {
      const matchfilter = {
        status: /closed/gi,
        closedAt: { $exists: true }
      };

      const { departmentIds, branchIds, userIds, tagIds, brandIds } = filter;

      let departmentUsers;
      let filterUserIds: any = [];
      const integrationsDict = {};

      if (checkFilterParam(departmentIds)) {
        const findDepartmentUsers = await sendCoreMessage({
          subdomain,
          action: "users.find",
          data: {
            query: {
              departmentIds: { $in: filter.departmentIds },
              isActive: true
            }
          },
          isRPC: true,
          defaultValue: []
        });

        departmentUsers = findDepartmentUsers;
        filterUserIds = findDepartmentUsers.map(user => user._id);
      }

      if (checkFilterParam(branchIds)) {
        const findBranchUsers = await sendCoreMessage({
          subdomain,
          action: "users.find",
          data: {
            query: { branchIds: { $in: filter.branchIds }, isActive: true }
          },
          isRPC: true,
          defaultValue: []
        });

        filterUserIds.push(...findBranchUsers.map(user => user._id));
      }

      if (checkFilterParam(userIds)) {
        filterUserIds = filter.userIds;
      }

      // filter by tags
      if (checkFilterParam(tagIds)) {
        matchfilter["conversationMessages.tagIds"] = { $in: tagIds };
      }

      // filter by source
      if (filter.integrationTypes && !filter.integrationTypes.includes("all")) {
        const { integrationTypes } = filter;

        const integrations: any = await models.Integrations.find({
          kind: { $in: integrationTypes }
        });

        const integrationIds = integrations.map(i => i._id);

        matchfilter["integrationId"] = { $in: integrationIds };
      }

      // filter by date
      if (filter.dateRange) {
        const { startDate, endDate, dateRange } = filter;
        let dateFilter = {};

        dateFilter = returnDateRange(dateRange, startDate, endDate);

        if (Object.keys(dateFilter).length) {
          matchfilter["createdAt"] = dateFilter;
        }
      }

      matchfilter["closedUserId"] = filterUserIds.length
        ? {
            $exists: true,
            $in: filterUserIds
          }
        : { $exists: true };

      const usersWithClosedTime = await models.Conversations.aggregate([
        {
          $match: matchfilter
        },

        {
          $project: {
            closeTimeDifference: { $subtract: ["$closedAt", "$createdAt"] },
            closedUserId: "$closedUserId"
          }
        },
        {
          $group: {
            _id: "$closedUserId",
            avgCloseTimeDifference: { $avg: "$closeTimeDifference" }
          }
        }
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
        action: "users.find",
        data: {
          query: { _id: { $in: getUserIds }, isActive: true }
        },
        isRPC: true,
        defaultValue: []
      });

      const usersMap = {};

      for (const user of getTotalClosedUsers) {
        usersMap[user._id] = {
          fullName:
            user.details?.fullName ||
            `${user.details?.firstName || ""} ${user.details?.lastName || ""}`,
          avgCloseTime: usersWithClosedTimeMap[user._id]
        };
      }

      const data = Object.values(usersMap).map((t: any) => t.avgCloseTime);

      const labels = Object.values(usersMap).map((t: any) => t.fullName);

      const title = "Average conversation close time in hours";

      const datasets = { title, data, labels };

      return datasets;
    },
    filterTypes: [
      {
        fieldName: "userIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "users",
        fieldLabel: "Select users"
      },
      {
        fieldName: "departmentIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "departments",
        fieldLabel: "Select departments"
      },
      {
        fieldName: "branchIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "branches",
        fieldLabel: "Select branches"
      },
      {
        fieldName: "integrationTypes",
        fieldType: "select",
        fieldQuery: "integrations",
        multi: true,
        fieldOptions: INTEGRATION_TYPES,
        fieldLabel: "Select source"
      },
      {
        fieldName: "tagIds",
        fieldType: "select",
        fieldQuery: "tags",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${INBOX_TAG_TYPE}", "perPage": 1000}`,
        multi: true,
        fieldLabel: "Select tags"
      },
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATERANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      }
    ]
  },
  {
    templateType: "closedConversationsCountByRep",
    serviceType: "inbox",
    name: "Total closed conversations count by rep",
    chartTypes: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "table"
    ],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string
    ) => {
      const data: number[] = [];
      const labels: string[] = [];

      const matchfilter = {};
      const filterStatus = filter.status;

      let title = `Total closed conversations count by rep`;

      const {
        departmentIds,
        branchIds,
        userIds,
        brandIds,
        dateRange,
        integrationTypes,
        tagIds
      } = filter;

      let filterUserIds: any = [];
      const integrationsDict = {};

      if (checkFilterParam(departmentIds)) {
        const findDepartmentUsers = await sendCoreMessage({
          subdomain,
          action: "users.find",
          data: {
            query: {
              departmentIds: { $in: filter.departmentIds },
              isActive: true
            }
          },
          isRPC: true,
          defaultValue: []
        });

        filterUserIds = findDepartmentUsers.map(user => user._id);
      }

      if (checkFilterParam(branchIds)) {
        const findBranchUsers = await sendCoreMessage({
          subdomain,
          action: "users.find",
          data: {
            query: { branchIds: { $in: filter.branchIds }, isActive: true }
          },
          isRPC: true,
          defaultValue: []
        });

        filterUserIds.push(...findBranchUsers.map(user => user._id));
      }

      if (checkFilterParam(tagIds)) {
        matchfilter["tagIds"] = { $in: tagIds };
      }

      // if team members selected, go by team members
      if (checkFilterParam(userIds)) {
        filterUserIds = userIds;
      }

      if (dateRange) {
        const { startDate, endDate } = filter;
        const dateFilter = returnDateRange(dateRange, startDate, endDate);

        if (Object.keys(dateFilter).length) {
          matchfilter["createdAt"] = dateFilter;
        }
      }

      // filter by status
      if (filterStatus && filterStatus !== "all") {
        if (filterStatus === "unassigned") {
          matchfilter["assignedUserId"] = null;
        } else {
          //open or closed
          matchfilter["status"] = filterStatus;
        }
      }

      const integrationFindQuery = {};

      // filter integrations by brands
      if (checkFilterParam(brandIds)) {
        integrationFindQuery["brandId"] = { $in: filter.brandIds };

        const integrations: any =
          await models.Integrations.find(integrationFindQuery);

        const integrationIds = integrations.map(i => i._id);

        matchfilter["integrationId"] = { $in: integrationIds };
      }

      // filter by source
      if (integrationTypes && !integrationTypes.includes("all")) {
        const { integrationTypes } = filter;

        integrationFindQuery["kind"] = { $in: integrationTypes };

        const integrations: any =
          await models.Integrations.find(integrationFindQuery);

        const integrationIds: string[] = [];

        for (const integration of integrations) {
          integrationsDict[integration._id] = integration.kind;
          integrationIds.push(integration._id);
        }

        matchfilter["integrationId"] = { $in: integrationIds };
      }

      let userIdGroup;

      matchfilter["closedUserId"] =
        filter && (filter.userIds || filter.departmentIds || filter.branchIds)
          ? {
              $exists: true,
              $in: filterUserIds
            }
          : { $exists: true };

      userIdGroup = {
        $group: {
          _id: "$closedUserId",
          conversationsCount: { $sum: 1 }
        }
      };

      const usersWithConvosCount = await models.Conversations.aggregate([
        {
          $match: matchfilter
        },
        userIdGroup
      ]);

      const getUserIds: string[] = usersWithConvosCount?.map(r => r._id) || [];

      const getTotalUsers: IUserDocument[] = await sendCoreMessage({
        subdomain,
        action: "users.find",
        data: {
          query: { _id: { $in: getUserIds }, isActive: true }
        },
        isRPC: true,
        defaultValue: []
      });

      const usersMap = {};
      for (const user of getTotalUsers) {
        usersMap[user._id] = {
          fullName:
            user.details?.fullName ||
            `${user.details?.firstName || ""} ${user.details?.lastName || ""}`,
          departmentIds: user.departmentIds,
          branchIds: user.branchIds
        };
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
        fieldName: "userIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "users",
        fieldLabel: "Select users"
      },
      {
        fieldName: "departmentIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "departments",
        fieldLabel: "Select departments"
      },
      {
        fieldName: "branchIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "branches",
        fieldLabel: "Select branches"
      },
      {
        fieldName: "integrationTypes",
        fieldType: "select",
        multi: true,
        fieldQuery: "integrations",
        fieldOptions: INTEGRATION_TYPES,
        fieldLabel: "Select source"
      },
      {
        fieldName: "brandIds",
        fieldType: "select",
        fieldQuery: "allBrands",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        multi: true,
        fieldLabel: "Select brands"
      },
      {
        fieldName: "tagIds",
        fieldType: "select",
        fieldQuery: "tags",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${INBOX_TAG_TYPE}", "perPage": 1000}`,
        multi: true,
        fieldLabel: "Select tags"
      },
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATERANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      }
    ]
  },
  {
    templateType: "conversationsCountByTag",
    serviceType: "inbox",
    name: "Total conversations count by tag",
    chartTypes: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "table"
    ],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string
    ) => {
      const data: number[] = [];
      const labels: string[] = [];

      const matchfilter = {};

      const { dateRange, tagIds } = filter;

      let groupByQuery;

      if (checkFilterParam(tagIds)) {
        matchfilter["tagIds"] = { $in: tagIds };
      }

      if (dateRange) {
        const { startDate, endDate } = filter;
        const dateFilter = returnDateRange(dateRange, startDate, endDate);

        if (Object.keys(dateFilter).length) {
          matchfilter["createdAt"] = dateFilter;
        }
      }

      const query = checkFilterParam(tagIds) ? { _id: { $in: tagIds } } : {};

      const tags = await sendCoreMessage({
        subdomain,
        action: "tagFind",
        data: {
          ...query
        },
        isRPC: true,
        defaultValue: []
      });

      const tagsMap: { [key: string]: string } = {};

      for (const tag of tags) {
        tagsMap[tag._id] = tag.name;
      }

      groupByQuery = {
        $group: {
          _id: "$tagIds",
          conversationsCount: { $sum: 1 }
        }
      };

      const convosCountByTag = await models.Conversations.aggregate([
        {
          $match: { ...matchfilter, integrationId: { $exists: true } }
        },
        { $unwind: "$tagIds" },
        groupByQuery
      ]);

      if (convosCountByTag) {
        for (const convo of convosCountByTag) {
          data.push(convo.conversationsCount);
          labels.push(tagsMap[convo._id]);
        }
      }

      const title = "Total conversations count by tag";

      return { title, labels, data };
    },
    filterTypes: [
      {
        fieldName: "tagIds",
        fieldType: "select",
        fieldQuery: "tags",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${INBOX_TAG_TYPE}", "perPage": 1000}`,
        multi: true,
        fieldLabel: "Select tags"
      },
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATERANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      }
    ]
  },
  {
    templateType: "conversationsCountBySource",
    serviceType: "inbox",
    name: "Total conversations count by source",
    chartTypes: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "table"
    ],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string
    ) => {
      const data: number[] = [];
      const labels: string[] = [];

      const matchfilter = {};

      const { dateRange, status } = filter;

      const groupByQuery = {
        $group: {
          _id: "$integrationId",
          conversationsCount: { $sum: 1 }
        }
      };

      const integrationFindQuery = {};
      const integrationsDict = {};
      const sourcesDict = {};

      if (dateRange) {
        const { startDate, endDate } = filter;
        const dateFilter = returnDateRange(dateRange, startDate, endDate);

        if (Object.keys(dateFilter).length) {
          matchfilter["createdAt"] = dateFilter;
        }
      }

      // filter by status
      if (status && status !== "all") {
        if (status === "unassigned") {
          matchfilter["assignedUserId"] = null;
        } else {
          //open or closed
          matchfilter["status"] = status;
        }
      }

      const convosCountBySource = await models.Conversations.aggregate([
        {
          $match: { ...matchfilter, integrationId: { $exists: true } }
        },
        groupByQuery
      ]);

      const integrations = await models.Integrations.find({});

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

      const title = "Conversations count by source";
      return { title, labels, data };
    },
    filterTypes: [
      {
        fieldName: "status",
        fieldType: "select",
        multi: false,
        fieldOptions: STATUS_TYPES,
        fieldDefaultValue: "all",
        fieldLabel: "Select conversation status"
      },
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATERANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      }
    ]
  },
  {
    templateType: "conversationsCountByRep",
    serviceType: "inbox",
    name: "Total conversations count by rep",
    chartTypes: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "table"
    ],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string
    ) => {
      const data: number[] = [];
      const labels: string[] = [];

      const matchfilter = {};

      const { departmentIds, branchIds, userIds, brandIds, dateRange, tagIds } =
        filter;

      let groupByQuery;
      let userIdGroup;
      let departmentUsers;
      let filterUserIds: any = [];
      const integrationsDict = {};
      const integrationFindQuery = {};
      const filterStatus = filter.status;
      const title = "Total conversations count by rep";

      if (checkFilterParam(departmentIds)) {
        const findDepartmentUsers = await sendCoreMessage({
          subdomain,
          action: "users.find",
          data: {
            query: {
              departmentIds: { $in: filter.departmentIds },
              isActive: true
            }
          },
          isRPC: true,
          defaultValue: []
        });

        departmentUsers = findDepartmentUsers;
        filterUserIds = findDepartmentUsers.map(user => user._id);
      }

      if (checkFilterParam(branchIds)) {
        const findBranchUsers = await sendCoreMessage({
          subdomain,
          action: "users.find",
          data: {
            query: { branchIds: { $in: filter.branchIds }, isActive: true }
          },
          isRPC: true,
          defaultValue: []
        });

        filterUserIds.push(...findBranchUsers.map(user => user._id));
      }

      if (checkFilterParam(tagIds)) {
        matchfilter["tagIds"] = { $in: tagIds };
      }

      // if team members selected, go by team members
      if (checkFilterParam(userIds)) {
        filterUserIds = userIds;
      }

      if (dateRange) {
        const { startDate, endDate } = filter;
        const dateFilter = returnDateRange(dateRange, startDate, endDate);

        if (Object.keys(dateFilter).length) {
          matchfilter["createdAt"] = dateFilter;
        }
      }

      if (checkFilterParam(tagIds)) {
        matchfilter["tagIds"] = { $in: tagIds };
      }

      if (dateRange) {
        const { startDate, endDate } = filter;
        const dateFilter = returnDateRange(dateRange, startDate, endDate);

        if (Object.keys(dateFilter).length) {
          matchfilter["createdAt"] = dateFilter;
        }
      }

      // filter integrations by brands
      if (checkFilterParam(brandIds)) {
        integrationFindQuery["brandId"] = { $in: filter.brandIds };

        const integrations: any =
          await models.Integrations.find(integrationFindQuery);

        const integrationIds = integrations.map(i => i._id);

        matchfilter["integrationId"] = { $in: integrationIds };
      }

      // filter by source
      if (filter.integrationTypes && !filter.integrationTypes.includes("all")) {
        const { integrationTypes } = filter;

        integrationFindQuery["kind"] = { $in: integrationTypes };

        const integrations: any =
          await models.Integrations.find(integrationFindQuery);

        const integrationIds: string[] = [];

        for (const integration of integrations) {
          integrationsDict[integration._id] = integration.kind;
          integrationIds.push(integration._id);
        }

        matchfilter["integrationId"] = { $in: integrationIds };
      }

      if (filterStatus === "open" || filterStatus === "all") {
        matchfilter["assignedUserId"] =
          filter &&
          ((userIds && userIds.length) ||
            (departmentIds && departmentIds.length) ||
            (branchIds && branchIds.length))
            ? {
                $exists: true,
                $in: filterUserIds
              }
            : { $exists: true, $ne: null };

        userIdGroup = {
          $group: {
            _id: "$assignedUserId",
            conversationsCount: {
              $sum: 1
            }
          }
        };
      }
      if (filterStatus === "closed") {
        matchfilter["closedUserId"] =
          filter && (filter.userIds || filter.departmentIds || filter.branchIds)
            ? {
                $exists: true,
                $in: filterUserIds
              }
            : { $exists: true };

        userIdGroup = {
          $group: {
            _id: "$closedUserId",
            conversationsCount: { $sum: 1 }
          }
        };
      }

      if (filterStatus === "unassigned") {
        const totalUnassignedConvosCount =
          (await models.Conversations.countDocuments(matchfilter)) || 0;

        data.push(totalUnassignedConvosCount);
        labels.push("Total unassigned conversations");

        return { title, data, labels };
      }

      const usersWithConvosCount = await models.Conversations.aggregate([
        {
          $match: matchfilter
        },
        userIdGroup
      ]);

      const getUserIds: string[] = usersWithConvosCount?.map(r => r._id) || [];

      const getTotalUsers: IUserDocument[] = await sendCoreMessage({
        subdomain,
        action: "users.find",
        data: {
          query: { _id: { $in: getUserIds }, isActive: true }
        },
        isRPC: true,
        defaultValue: []
      });

      const usersMap = {};
      for (const user of getTotalUsers) {
        usersMap[user._id] = {
          fullName:
            user.details?.fullName ||
            `${user.details?.firstName || ""} ${user.details?.lastName || ""}`,
          departmentIds: user.departmentIds,
          branchIds: user.branchIds
        };
      }

      if (usersWithConvosCount) {
        for (const user of usersWithConvosCount) {
          if (!usersMap[user._id]) {
            continue;
          }

          data.push(user.conversationsCount);
          labels.push(usersMap[user._id].fullName);
        }
      }

      return { title, labels, data };
    },
    filterTypes: [
      {
        fieldName: "status",
        fieldType: "select",
        multi: false,
        fieldOptions: STATUS_TYPES,
        fieldDefaultValue: "all",
        fieldLabel: "Select conversation status"
      },
      {
        fieldName: "userIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "users",
        fieldLabel: "Select users"
      },
      {
        fieldName: "departmentIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "departments",
        fieldLabel: "Select departments"
      },
      {
        fieldName: "branchIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "branches",
        fieldLabel: "Select branches"
      },
      {
        fieldName: "integrationTypes",
        fieldType: "select",
        multi: true,
        fieldQuery: "integrations",
        fieldOptions: INTEGRATION_TYPES,
        fieldLabel: "Select source"
      },
      {
        fieldName: "brandIds",
        fieldType: "select",
        fieldQuery: "allBrands",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        multi: true,
        fieldLabel: "Select brands"
      },
      {
        fieldName: "tagIds",
        fieldType: "select",
        fieldQuery: "tags",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${INBOX_TAG_TYPE}", "perPage": 1000}`,
        multi: true,
        fieldLabel: "Select tags"
      },
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATERANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      }
    ]
  },
  {
    templateType: "conversationsCountByStatus",
    serviceType: "inbox",
    name: "Total conversations count by status",
    chartTypes: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "table"
    ],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string
    ) => {
      const data: number[] = [];
      const labels: string[] = [];

      const matchfilter = {};

      const { dateRange, tagIds } = filter;

      let groupByQuery;
      const integrationsDict = {};
      const integrationFindQuery = {};

      const title = "Conversations count by status";

      if (dateRange) {
        const { startDate, endDate } = filter;
        const dateFilter = returnDateRange(dateRange, startDate, endDate);

        if (Object.keys(dateFilter).length) {
          matchfilter["createdAt"] = dateFilter;
        }
      }
      // filter by tags
      if (checkFilterParam(tagIds)) {
        matchfilter["tagIds"] = { $in: tagIds };
      }

      // filter by source
      if (filter.integrationTypes && !filter.integrationTypes.includes("all")) {
        const { integrationTypes } = filter;

        integrationFindQuery["kind"] = { $in: integrationTypes };

        const integrations: any =
          await models.Integrations.find(integrationFindQuery);

        const integrationIds: string[] = [];

        for (const integration of integrations) {
          integrationsDict[integration._id] = integration.kind;
          integrationIds.push(integration._id);
        }

        matchfilter["integrationId"] = { $in: integrationIds };
      }

      groupByQuery = {
        $group: {
          _id: "$status",
          conversationsCount: { $sum: 1 }
        }
      };

      const convosCountByStatus = await models.Conversations.aggregate([
        {
          $match: matchfilter
        },
        groupByQuery
      ]);

      if (convosCountByStatus) {
        for (const convo of convosCountByStatus) {
          data.push(convo.conversationsCount);
          labels.push(convo._id);
        }
      }

      return { title, data, labels };
    },
    filterTypes: [
      {
        fieldName: "integrationTypes",
        fieldType: "select",
        multi: true,
        fieldQuery: "integrations",
        fieldOptions: INTEGRATION_TYPES,
        fieldLabel: "Select source"
      },
      {
        fieldName: "tagIds",
        fieldType: "select",
        fieldQuery: "tags",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${INBOX_TAG_TYPE}", "perPage": 1000}`,
        multi: true,
        fieldLabel: "Select tags"
      },
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATERANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      }
    ]
  },
  {
    templateType: "conversationsCount",
    serviceType: "inbox",
    name: "Conversations count",
    chartTypes: [
      "bar",
      "line",
      "pie",
      "doughnut",
      "radar",
      "polarArea",
      "table"
    ],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string
    ) => {
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
        tagIds
      } = filter;

      const dimensionX = dimension.x;

      let departmentUsers;
      let filterUserIds: any = [];
      const integrationsDict = {};
      let totalIntegrations;

      if (checkFilterParam(departmentIds)) {
        const findDepartmentUsers = await sendCoreMessage({
          subdomain,
          action: "users.find",
          data: {
            query: {
              departmentIds: { $in: filter.departmentIds },
              isActive: true
            }
          },
          isRPC: true,
          defaultValue: []
        });

        departmentUsers = findDepartmentUsers;
        filterUserIds = findDepartmentUsers.map(user => user._id);
      }

      if (checkFilterParam(branchIds)) {
        const findBranchUsers = await sendCoreMessage({
          subdomain,
          action: "users.find",
          data: {
            query: { branchIds: { $in: filter.branchIds }, isActive: true }
          },
          isRPC: true,
          defaultValue: []
        });

        filterUserIds.push(...findBranchUsers.map(user => user._id));
      }

      if (checkFilterParam(tagIds)) {
        matchfilter["tagIds"] = { $in: tagIds };
      }

      // if team members selected, go by team members
      if (checkFilterParam(userIds)) {
        filterUserIds = userIds;
      }

      if (dateRange) {
        const { startDate, endDate } = filter;
        const dateFilter = returnDateRange(dateRange, startDate, endDate);

        if (Object.keys(dateFilter).length) {
          matchfilter["createdAt"] = dateFilter;
        }
      }

      // filter by status
      if (filterStatus && filterStatus !== "all") {
        if (filterStatus === "unassigned") {
          matchfilter["assignedUserId"] = null;
        } else {
          //open or closed
          matchfilter["status"] = filterStatus;
        }
      }

      const integrationFindQuery = {};

      // filter integrations by brands
      if (brandIds && brandIds.length) {
        integrationFindQuery["brandId"] = { $in: filter.brandIds };

        const integrations: any =
          await models.Integrations.find(integrationFindQuery);

        const integrationIds = integrations.map(i => i._id);

        matchfilter["integrationId"] = { $in: integrationIds };
      }

      // filter by source
      if (filter.integrationTypes && !filter.integrationTypes.includes("all")) {
        const { integrationTypes } = filter;

        integrationFindQuery["kind"] = { $in: integrationTypes };

        const integrations: any =
          await models.Integrations.find(integrationFindQuery);

        totalIntegrations = integrations;

        const integrationIds: string[] = [];

        for (const integration of integrations) {
          integrationsDict[integration._id] = integration.kind;
          integrationIds.push(integration._id);
        }

        matchfilter["integrationId"] = { $in: integrationIds };
      }

      let userIdGroup;
      let groupByQuery;

      if (filterStatus === "open" || filterStatus === "all") {
        matchfilter["assignedUserId"] =
          filter &&
          ((userIds && userIds.length) ||
            (departmentIds && departmentIds.length) ||
            (branchIds && branchIds.length))
            ? {
                $exists: true,
                $in: filterUserIds
              }
            : { $exists: true, $ne: null };

        userIdGroup = {
          $group: {
            _id: "$assignedUserId",
            conversationsCount: {
              $sum: 1
            }
          }
        };
      }
      if (filterStatus === "closed") {
        matchfilter["closedUserId"] =
          filter && (filter.userIds || filter.departmentIds || filter.branchIds)
            ? {
                $exists: true,
                $in: filterUserIds
              }
            : { $exists: true };

        userIdGroup = {
          $group: {
            _id: "$closedUserId",
            conversationsCount: { $sum: 1 }
          }
        };
      }

      if (filterStatus === "unassigned") {
        const totalUnassignedConvosCount =
          (await models.Conversations.countDocuments(matchfilter)) || 0;

        data.push(totalUnassignedConvosCount);
        labels.push("Total unassigned conversations");

        return { title, data, labels };
      }

      // add dimensions
      if (dimensionX === "status") {
        groupByQuery = {
          $group: {
            _id: "$status",
            conversationsCount: { $sum: 1 }
          }
        };

        const convosCountByStatus = await models.Conversations.aggregate([
          {
            $match: matchfilter
          },
          groupByQuery
        ]);

        if (convosCountByStatus) {
          for (const convo of convosCountByStatus) {
            data.push(convo.conversationsCount);
            labels.push(convo._id);
          }
        }

        title = "Conversations count by status";
        const datasets = { title, data, labels };

        return datasets;
      }

      const usersWithConvosCount = await models.Conversations.aggregate([
        {
          $match: matchfilter
        },
        userIdGroup
      ]);

      const getUserIds: string[] = usersWithConvosCount?.map(r => r._id) || [];

      const getTotalUsers: IUserDocument[] = await sendCoreMessage({
        subdomain,
        action: "users.find",
        data: {
          query: { _id: { $in: getUserIds }, isActive: true }
        },
        isRPC: true,
        defaultValue: []
      });

      const usersMap = {};
      for (const user of getTotalUsers) {
        usersMap[user._id] = {
          fullName:
            user.details?.fullName ||
            `${user.details?.firstName || ""} ${user.details?.lastName || ""}`,
          departmentIds: user.departmentIds,
          branchIds: user.branchIds
        };
      }

      // department
      if (dimensionX === "department") {
        const departmentsDict = {};

        const departmentsQuery =
          departmentIds && departmentIds.length
            ? { query: { _id: { $in: departmentIds } } }
            : {};

        const departments = await sendCoreMessage({
          subdomain,
          action: "departments.find",
          data: departmentsQuery,
          isRPC: true,
          defaultValue: []
        });

        for (const department of departments) {
          departmentsDict[department._id] = {
            title: department.title,
            conversationsCount: 0
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
                title: departmentsDict[departmentId].title
              };
            }
          }

          title = "Conversations count by departments";

          for (const deptId of Object.keys(departmentsDict)) {
            labels.push(departmentsDict[deptId].title);
            data.push(departmentsDict[deptId].conversationsCount);
          }
        }

        return { title, labels, data };
      }

      // branch
      if (dimensionX === "branch") {
        const branchesDict = {};

        const branchesQuery =
          branchIds && branchIds.length
            ? { query: { _id: { $in: branchIds } } }
            : {};

        const branches = await sendCoreMessage({
          subdomain,
          action: "branches.find",
          data: branchesQuery,
          isRPC: true,
          defaultValue: []
        });

        for (const branch of branches) {
          branchesDict[branch._id] = {
            title: branch.title,
            conversationsCount: 0
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
                title: branchesDict[branchId].title
              };
            }
          }

          title = "Conversations count by departments";

          for (const branchId of Object.keys(branchesDict)) {
            labels.push(branchesDict[branchId].title);
            data.push(branchesDict[branchId].conversationsCount);
          }
        }

        return { title, labels, data };
      }

      //source
      if (dimensionX === "source") {
        const sourcesDict = {};

        groupByQuery = {
          $group: {
            _id: "$integrationId",
            conversationsCount: { $sum: 1 }
          }
        };

        const convosCountBySource = await models.Conversations.aggregate([
          {
            $match: { ...matchfilter, integrationId: { $exists: true } }
          },
          groupByQuery
        ]);

        const integrations = await models.Integrations.find({});

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

        const title = "Conversations count by source";
        return { title, labels, data };
      }

      //brand
      if (dimensionX === "brand") {
        const query =
          brandIds && brandIds.length ? { _id: { $in: brandIds } } : {};

        const brandsMap: { [brandId: string]: string } = {};

        const brands = await sendCoreMessage({
          subdomain,
          action: "brands.find",
          data: {
            query
          },
          isRPC: true,
          defaultValue: []
        });

        groupByQuery = {
          $group: {
            _id: "$integrationId",
            conversationsCount: { $sum: 1 }
          }
        };

        for (const brand of brands) {
          brandsMap[brand._id] = brand.name;
        }

        const convosCountBySource = await models.Conversations.aggregate([
          {
            $match: { ...matchfilter, integrationId: { $exists: true } }
          },
          groupByQuery
        ]);

        if (convosCountBySource && convosCountBySource.length) {
          const integrationsCountMap = {};
          const brandsCountMap = {};

          const integrationsMap = {};

          for (const convo of convosCountBySource) {
            integrationsCountMap[convo._id] = convo.conversationsCount;
          }

          const ingegrations =
            (await models.Integrations.find({
              _id: { $in: convosCountBySource.map(c => c._id) }
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

          const title = "Conversations count by brand";
          return { title, labels, data };
        }
      }

      //tag
      if (dimensionX === "tag") {
        const query = checkFilterParam(tagIds) ? { _id: { $in: tagIds } } : {};

        const tags = await sendCoreMessage({
          subdomain,
          action: "tagFind",
          data: {
            ...query
          },
          isRPC: true,
          defaultValue: []
        });

        const tagsMap: { [key: string]: string } = {};

        for (const tag of tags) {
          tagsMap[tag._id] = tag.name;
        }

        groupByQuery = {
          $group: {
            _id: "$tagIds",
            conversationsCount: { $sum: 1 }
          }
        };

        const convosCountByTag = await models.Conversations.aggregate([
          {
            $match: { ...matchfilter, integrationId: { $exists: true } }
          },
          { $unwind: "$tagIds" },
          groupByQuery
        ]);

        if (convosCountByTag) {
          for (const convo of convosCountByTag) {
            data.push(convo.conversationsCount);
            labels.push(tagsMap[convo._id]);
          }
        }

        const title = "Conversations count by tag";

        return { title, labels, data };
      }

      // frequency
      if (dimensionX === "frequency") {
        const convosCountByDateRange =
          (await models.Conversations.find(matchfilter)) || [];

        if (dateRange) {
          if (dateRange === "today" || dateRange === "yesterday") {
            labels.push(dateRange);
            data.push(convosCountByDateRange.length);
          }

          const getDateRange = returnDateRange(
            dateRange,
            filter.startDate,
            filter.endDate
          );

          const { $gte, $lte } = getDateRange;

          const dateRanges = returnDateRanges(
            dateRange,
            $gte,
            $lte,
            filter.customDateFrequencyType
          );

          const convosCountByGivenDateRanges =
            await models.Conversations.aggregate([
              // Match documents within the specified date ranges
              {
                $match: {
                  createdAt: {
                    $gte,
                    $lte
                  }
                }
              },
              // Project additional fields or reshape documents if needed
              // {
              //     $project: {
              //         // Projected fields
              //     }
              // },
              // Group documents by date range
              {
                $group: {
                  _id: {
                    $switch: {
                      branches: dateRanges.map((range, index) => {
                        return {
                          case: {
                            $and: [
                              { $gte: ["$createdAt", range.start] },
                              { $lte: ["$createdAt", range.end] }
                            ]
                          },
                          then: range.start
                        };
                      }),
                      default: -1
                    }
                  },
                  count: { $sum: 1 } // Calculate document count in each group
                  // Additional aggregations if needed
                }
              }
            ]);

          const getCountsArray =
            convosCountByGivenDateRanges?.map(c => c.count) || [];

          data.push(...getCountsArray);
          labels.push(...dateRanges.map(m => m.label));

          const title = `Conversations count of ${dateRange}`;

          return { title, labels, data };
        }
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
        fieldName: "customDateFrequencyType",
        fieldType: "select",

        logics: [
          {
            logicFieldName: "dateRange",
            logicFieldValue: "customDate"
          }
        ],
        multi: true,
        fieldQuery: "date",
        fieldOptions: CUSTOM_DATE_FREQUENCY_TYPES,
        fieldLabel: "Select frequency type"
      },
      {
        fieldName: "status",
        fieldType: "select",
        multi: false,
        fieldOptions: STATUS_TYPES,
        fieldDefaultValue: "all",
        fieldLabel: "Select conversation status"
      },

      {
        fieldName: "userIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "users",
        fieldLabel: "Select users"
      },
      {
        fieldName: "departmentIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "departments",
        fieldLabel: "Select departments"
      },
      {
        fieldName: "branchIds",
        fieldType: "select",
        multi: true,
        fieldQuery: "branches",
        fieldLabel: "Select branches"
      },
      {
        fieldName: "integrationTypes",
        fieldType: "select",
        multi: true,
        fieldQuery: "integrations",
        fieldOptions: INTEGRATION_TYPES,
        fieldLabel: "Select source"
      },
      {
        fieldName: "brandIds",
        fieldType: "select",
        fieldQuery: "allBrands",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        multi: true,
        fieldLabel: "Select brands"
      },
      {
        fieldName: "tagIds",
        fieldType: "select",
        fieldQuery: "tags",
        fieldValueVariable: "_id",
        fieldLabelVariable: "name",
        fieldQueryVariables: `{"type": "${INBOX_TAG_TYPE}", "perPage": 1000}`,
        multi: true,
        fieldLabel: "Select tags"
      },
      {
        fieldName: "dateRange",
        fieldType: "select",
        multi: true,
        fieldQuery: "date",
        fieldOptions: DATERANGE_TYPES,
        fieldLabel: "Select date range",
        fieldDefaultValue: "all"
      }
    ],
    dimensions: DIMENSION_OPTIONS
  }
];

const getChartResult = async ({ subdomain, data }) => {
  const models = await generateModels(subdomain);
  const { templateType, filter, dimension } = data;

  const template =
    chartTemplates.find(t => t.templateType === templateType) || ({} as any);

  return template.getChartResult(models, filter, dimension, subdomain);
};

export default {
  chartTemplates,
  reportTemplates,
  getChartResult
};
