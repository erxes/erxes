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

const removeMiniPlanLabels = `
  mutation miniPlanRemoveLabel($_id:String){
    miniPlanRemoveLabel(_id: $_id)
  }
`;

const saveMiniPlanLabel = `
mutation miniPlanSaveLabel($update: [LabelInput], $add: [AddLabelInput]){
  miniPlanSaveLabel(update: $update, add: $add)
}
`;

const saveSalesLog = `
mutation miniPlanSave(${salesLogVariables}){
  miniPlanSave(${salesLogValues})
}`;

const miniPlanSaveDayConfig = `
 mutation miniPlanSaveDayConfig($update: [DayConfigInput], $add: [AddDayConfigInput]){
  miniPlanSaveDayConfig(update: $update, add: $add)
 }
`;
const miniPlanRemoveDayConfig = `
mutation miniPlanRemoveDayConfig($_id: String){
  miniPlanRemoveDayConfig(_id: $_id)
}`;

const miniPlanSaveDayPlan = `
mutation miniPlanSaveDayPlan($saleLogId: String, $dayConfigs: JSON){
  miniPlanSaveDayPlan(saleLogId: $saleLogId, dayConfigs: $dayConfigs)
}
`;

const miniPlanRemove = `
  mutation miniPlanRemove($_id:String){
    miniPlanRemove(_id: $_id)
  }
`;

const miniPlanSaveMonthPlan = `
  mutation miniPlanSaveMonthPlan ($saleLogId: String, $date: Date $dayConfigs: JSON){
    miniPlanSaveMonthPlan(saleLogId: $saleLogId, date: $date, dayConfigs: $dayConfigs)
  }
`;

export default {
  removeMiniPlanLabels,
  saveMiniPlanLabel,
  saveSalesLog,
  miniPlanSaveDayConfig,
  miniPlanRemoveDayConfig,
  miniPlanSaveDayPlan,
  miniPlanSaveMonthPlan,
  miniPlanRemove
};
