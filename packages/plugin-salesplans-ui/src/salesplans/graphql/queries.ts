const labels = `
  query labels($type: String) {
    labels(type: $type) {
      _id,
      type,
      color,
      title,
      status
    }
  }
`;

const timeframes = `
  query timeframes {
    timeframes {
      _id,
      name,
      description,
      startTime,
      endTime
    }
  }
`;

const departments = `
  query departments {
    departments {
      _id,
      title
    }
  }
`;
const branches = `
  query branches {
    branches {
      _id,
      title
    }
  }
`;

const salesLogs = `
  query salesLogs {
    salesLogs {
      _id,
      name,
      description,
      type,
      date,
      status,
      labels,
      departmentId,
      departmentDetail {
        _id,
        title
      },
      branchId,
      branchDetail {
        _id,
        title
      },
      createdUser {
        _id,
        username
      }
    }
  }
`;

const salesLogDetail = `
  query salesLogDetail($salesLogId: String) {
    salesLogDetail(salesLogId: $salesLogId) {
      _id,
      name,
      description,
      type,
      date,
      departmentId,
      branchId,
      createdUser {
        _id,
        username
      },
      createdAt
    }
  }
`;

const dayPlanConfig = `
  query dayPlanConfig($salesLogId: String) {
    dayPlanConfig(salesLogId: $salesLogId) {
      _id,
      labelIds,
      timeframeId
    }
  }
`;

const monthPlanConfig = `
  query monthPlanConfig($salesLogId: String) {
    getMonthPlanConfig(salesLogId: $salesLogId) {
      _id,
      labelIds,
      day
    }
  }
`;

const yearPlanConfig = `
  query yearPlanConfig($salesLogId: String) {
    yearPlanConfig(salesLogId: $salesLogId) {
      _id,
      labelIds,
      month
    }
  }
`;

export default {
  labels,
  timeframes,
  departments,
  branches,
  salesLogs,
  salesLogDetail,
  monthPlanConfig,
  dayPlanConfig,
  yearPlanConfig
};
