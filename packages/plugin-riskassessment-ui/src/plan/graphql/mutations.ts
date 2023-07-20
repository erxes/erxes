const commonPlanParams = `
    $name: String,
    $structureType: String,
    $configs: JSON
`;

const commonPlanParamsDef = `
    name: $name,
    structureType: $structureType,
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
    mutation RemoveRiskAssessmentPlan($ids: [String]) {
      removeRiskAssessmentPlan(ids: $ids)
    }
`;

const commonScheduleParams = `
    $planId: String,
    $indicatorId: String,
    $groupId: String,
    $startDate: String,
    $endDate: String,
    $assignedUserIds: [String],
    $structureTypeIds: [String],
    $name: String,
    $customFieldsData: JSON
`;

const commonScheduleParamsDef = `
    name: $name,
    planId: $planId,
    indicatorId: $indicatorId,
    groupId: $groupId,
    startDate: $startDate,
    endDate: $endDate,
    assignedUserIds: $assignedUserIds,
    structureTypeIds: $structureTypeIds,
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
