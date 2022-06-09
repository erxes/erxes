const salesLogVariables = `
  $branchId: String,
  $description:String,
  $date:Date,
  $name:String,
  $type:String,
  $unitId:String
`;

const salesLogValues = `
  branchId: $branchId,
  date: $date,
  description: $description,
  name: $name,
  type: $type,
  unitId: $unitId
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
      unitDetail {
        _id
        title
      }
      unitId
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
  saveTimeframes,
  removeTimeframe,
  saveDayPlanConfig,
  removeSalesLog,
  saveMonthPlanConfig,
  saveYearPlanConfig
};
