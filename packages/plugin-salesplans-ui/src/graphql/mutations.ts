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
    description:$description,
    name:$name,
    type:$type,
    unitId:$unitId
`;

const removeLabel = `
  mutation removeLabel($_id:String){
    removeLabel(_id: $_id)
  }
`;

const saveLabels = `
mutation saveLabels($update: [LabelInput], $add: [AddLabelInput]){
  saveLabels(update: $update, add: $add)
}
`;

const createSalesLog = `
mutation createSalesLog(${salesLogVariables}){
  createSalesLog(${salesLogValues}){
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
}`;

const saveTimeframes = `
 mutation saveTimeframes($update: [DayConfigInput], $add: [AddDayConfigInput]){
  saveTimeframes(update: $update, add: $add)
 }
`;
const removeTimeframe = `
mutation removeTimeframe($_id: String){
  removeTimeframe(_id: $_id)
}`;

const saveDayPlanConfig = `
mutation saveDayPlanConfig($saleLogId: String, $dayConfigs: JSON){
  saveDayPlanConfig(saleLogId: $saleLogId, dayConfigs: $dayConfigs)
}
`;

const removeSalesLog = `
  mutation removeSalesLog($_id:String){
    removeSalesLog(_id: $_id)
  }
`;

const saveMonthPlanConfig = `
  mutation saveMonthPlanConfig ($saleLogId: String, $date: Date $dayConfigs: JSON){
    saveMonthPlanConfig(saleLogId: $saleLogId, date: $date, dayConfigs: $dayConfigs)
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
  saveMonthPlanConfig
};
