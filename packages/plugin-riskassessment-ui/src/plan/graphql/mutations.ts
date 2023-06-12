const commonPlanParams = `
    $name: String,
    $structureType: String,
    $structureTypeIds: [String],
    $configs: JSON
`;

const commonPlanParamsDef = `
    name: $name,
    structureType: $structureType,
    structureTypeIds: $structureTypeIds,
    configs: $configs
`;

const addPlan = `
    mutation AddRiskAssessmentPlan(${commonPlanParams}) {
      addRiskAssessmentPlan(${commonPlanParamsDef})
    }
`;

const updatePlan = `
    mutation UpdateRiskAssessmentPlan($id: String,${commonPlanParams}) {
      updateRiskAssessmentPlan(_id: $id,${commonPlanParamsDef})
    }
`;

const removePlan = `
    mutation RemoveRiskAssessmentPlan($id: String) {
      removeRiskAssessmentPlan(_id: $id)
    }
`;

const commonScheduleParams = `
    $planId: String,
    $indicatorId: String,
    $groupId: String,
    $date: String,
    $assignedUserIds: [String],
    $name: String,
    $customFieldsData: JSON
`;

const commonScheduleParamsDef = `
    planId: $planId,
    indicatorId: $indicatorId,
    groupId: $groupId,
    date: $date,
    assignedUserIds: $assignedUserIds,
    name: $name,
    customFieldsData: $customFieldsData
`;

const addSchedule = `
    mutation AddRiskAssessmentPlanSchedule(${commonScheduleParams}) {
      addRiskAssessmentPlanSchedule(${commonScheduleParamsDef})
    }
`;

const updateSchedule = `
    mutation UpdateRiskAssessmentPlanSchedule($_id:String,${commonScheduleParams}) {
      updateRiskAssessmentPlanSchedule(_id:$_id,${commonScheduleParamsDef})
    }
`;

const removeSchedule = `
    mutation RemoveRiskAssessmentPlanSchedule($id: String) {
      removeRiskAssessmentPlanSchedule(_id: $id)
    }
`;

export default {
  addPlan,
  updatePlan,
  removePlan,
  addSchedule,
  updateSchedule,
  removeSchedule
};
