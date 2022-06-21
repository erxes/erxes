const salesLogVariables = `
  $name: String,
  $description: String,
  $date: Date,
  $type: String,
  $branchId: String,
  $departmentId: String
`;

const salesLogValues = `
  name: $name,
  description: $description,
  date: $date,
  type: $type,
  branchId: $branchId,
  departmentId: $departmentId
`;

const salesLogDocumentVariables = `
  $_id: String,
  $name: String,
  $description: String,
  $date: Date,
  $type: String,
  $branchId: String,
  $departmentId: String
`;

const salesLogDocumentValues = `
  _id: $_id,
  name: $name,
  description: $description,
  date: $date,
  type: $type,
  branchId: $branchId,
  departmentId: $departmentId
`;

const removeLabel = `
  mutation removeLabel($_id: String) {
    removeLabel(_id: $_id)
  }
`;

const saveLabels = `
  mutation saveLabels($update: [LabelInput], $add: [AddLabelInput]) {
    saveLabels(update: $update, add: $add){
      _id
    }
  }
`;

const createSalesLog = `
  mutation createSalesLog(${salesLogVariables}) {
    createSalesLog(${salesLogValues}) {
      _id
      branchDetail {
        _id
        title
      }
      branchId
      createdAt
      createdBy
      createdUser {
        _id
        username
      }
      date
      description
      name
      status
      type
      departmentDetail {
        _id
        title
      }
      departmentId
    }
  }
`;

const updateSalesLog = `
  mutation updateSalesLog(${salesLogDocumentVariables}) {
    updateSalesLog(${salesLogDocumentValues}) {
      _id
      branchDetail {
        _id
        title
      }
      branchId
      date
      description
      name
      status
      type
      departmentDetail {
        _id
        title
      }
      departmentId
    }
  }
`;

const saveTimeframes = `
  mutation saveTimeframes($update: [TimeframeInput], $add: [AddTimeframeInput]) {
    saveTimeframes(update: $update, add: $add){
      _id
    }
  }
`;

const removeTimeframe = `
  mutation removeTimeframe($_id: String) {
    removeTimeframe(_id: $_id)
  }
`;

const saveDayPlanConfig = `
  mutation saveDayPlanConfig($salesLogId: String, $data: JSON) {
    saveDayPlanConfig(salesLogId: $salesLogId, data: $data)
    {
      _id
    }
  }
`;

const removeSalesLog = `
  mutation removeSalesLog($_id: String) {
    removeSalesLog(_id: $_id)
  }
`;

const saveMonthPlanConfig = `
  mutation saveMonthPlanConfig ($salesLogId: String, $day: Date, $data: JSON){
    saveMonthPlanConfig(salesLogId: $salesLogId, day: $day, data: $data){
      _id
    }
  }
`;

const saveYearPlanConfig = `
  mutation saveYearPlanConfig ($salesLogId: String, $data: JSON){
    saveYearPlanConfig(salesLogId: $salesLogId, data: $data){
      _id
    }
  }
`;

export default {
  removeLabel,
  saveLabels,
  createSalesLog,
  updateSalesLog,
  saveTimeframes,
  removeTimeframe,
  saveDayPlanConfig,
  removeSalesLog,
  saveMonthPlanConfig,
  saveYearPlanConfig
};
