const commonPlanParams = `
    $name: String,
    $structureType: String,
    $structureTypeId:String,
    $configs: JSON
    $startDate:String,
    $closeDate:String,
    $createDate:String,
    $tagId:String
`;

const commonPlanParamsDef = `
    name: $name,
    structureType: $structureType,
    structureTypeId:$structureTypeId,
    configs: $configs,
    startDate:$startDate,
    closeDate:$closeDate,
    createDate:$createDate,
    tagId:$tagId
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
    $structureTypeId: String,
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
    structureTypeId: $structureTypeId,
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
