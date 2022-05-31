const getLabels = `
  query getLabels($type:String) {
    getLabels(type:$type) {
      _id,
      type,
      color,
      title,
      status
    }
  }
`;

const getTimeframes = `
  query getTimeframes {
    getTimeframes {
      _id,
      name,
      description,
      startTime,
      endTime
    }
  }
`;

const units = `
  query units {
    units {
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

const getSalesLogs = `
  query getSalesLogs {
    getSalesLogs {
          _id ,
      description,
      date,
      name,
      type,
      unitDetail {
        _id,
        title
      },
      createdUser {
        _id,
        username
      },
      createdAt,
      branchDetail {
        _id,
        title
      }
    }
  }
`;

const getDayPlanConfig = `
  query getDayPlanConfig($salesLogId: String) {
    getDayPlanConfig(salesLogId: $salesLogId) {
      _id,
      labelIds,
      timeframeId
    }
  }
`;

const getMonthPlanConfig = `
  query getMonthPlanConfig($salesLogId: String) {
    getMonthPlanConfig(salesLogId: $salesLogId) {
      _id,
      labelIds,
      day
    }
  }
`;

const getYearPlanConfig = `
  query getYearPlanConfig($salesLogId: String) {
    getYearPlanConfig(salesLogId: $salesLogId) {
      _id,
      labelIds,
      month
    }
  }
`;

const products = `
  query products {
    products {
      _id,
      name
    }
  } 
`;

export default {
  getLabels,
  getTimeframes,
  branches,
  getSalesLogs,
  getMonthPlanConfig,
  getDayPlanConfig,
  getYearPlanConfig,
  products,
  units
};
