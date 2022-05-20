const getLabels = `
  query getMiniPlanLabels($type:String){
    getMiniPlanLabels(type:$type){
      _id,
      type,
      color,
      title,
      status
    }
  }
`;

const getTimeframes = `
  query getTimeframes{
    getTimeframes{
      _id,
      name,
      description,
      startTime,
      endTime
    }
  }
`;

const units = `
  query units{
    units{
      _id,
      title
    }
  }
`;
const branches = `
  query dranches{
    dranches{
      _id,
      title
    }
  }
`;

const getSalesLogs = `
  query getSalesLogs{
    getSalesLogs{
          _id ,
      description,
      date,
      name,
      type,
      unitDetail{
        _id,
        title
      },
      createdUser{
        _id,
        username
      },
      createdAt,
      branchDetail{
        _id,
        title
      }
    }
  }
`;

const getDayPlanConfig = `
  query getDayPlanConfig($saleLogId: String){
    getDayPlanConfig(saleLogId: $saleLogId){
      _id,
      labelIds,
      dayConfigId
    }
  }
`;

const getMonthPlanConfig = `
  query getMonthPlanConfig($saleLogId: String){
    getMonthPlanConfig(saleLogId: $saleLogId){
      _id,
      labelIds,
      date
    }
  }
`;

const products = `
  query products{
    products{
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
  products,
  units
};
