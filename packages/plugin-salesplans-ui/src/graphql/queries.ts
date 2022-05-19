const getMiniPlanLabels = `
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

const getMiniPlanDayConfigs = `
  query getMiniPlanDayConfigs{
    getMiniPlanDayConfigs{
      _id,
      name,
      description,
      startTime,
      endTime
    }
  }
`;

const getUnits = `
  query getUnits{
    getUnits{
      _id,
      title
    }
  }
`;
const getBranches = `
  query getBranches{
    getBranches{
      _id,
      title
    }
  }
`;

const getMiniPlanSalesLogs = `
  query getMiniPlanSalesLogs{
    getMiniPlanSalesLogs{
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

const getMiniPlanDayPlanConf = `
  query getMiniPlanDayPlanConf($saleLogId: String){
    getMiniPlanDayPlanConf(saleLogId: $saleLogId){
      _id,
      labelIds,
      dayConfigId
    }
  }
`;

const getMiniPlanMonthPlanConf = `
  query getMiniPlanMonthPlanConf($saleLogId: String){
    getMiniPlanMonthPlanConf(saleLogId: $saleLogId){
      _id,
      labelIds,
      date
    }
  }
`;

const getProducts = `
  query getProducts{
    getProducts{
      _id,
      name
    }
  } 
`;

export default {
  getMiniPlanLabels,
  getUnits,
  getBranches,
  getMiniPlanSalesLogs,
  getMiniPlanDayConfigs,
  getMiniPlanMonthPlanConf,
  getMiniPlanDayPlanConf,
  getProducts
};
