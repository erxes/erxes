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
    mutation UpdateRiskAssessmentPlan($_id: String,${commonPlanParams}) {
      updateRiskAssessmentPlan(_id: $_id,${commonPlanParamsDef})
    }
`;

const removePlan = `
    mutation RemoveRiskAssessmentPlan($ids: [String]) {
      removeRiskAssessmentPlan(ids: $ids)
    }
`;

const duplicatePlan = `
  mutation DuplicateRiskAssessmentPlan($id: String) {
    duplicateRiskAssessmentPlan(_id: $id) {
      _id
    }
  }
`;

const changeStatus = `
mutation ChangeStatusRiskAssessmentPlan($_id: String, $status: String) {
  changeStatusRiskAssessmentPlan(_id: $_id, status: $status) {
    _id
  }
}
`;

const forceStartPlan = `
  mutation ForceStartRiskAssessmentPlan($id: String) {
    forceStartRiskAssessmentPlan(_id: $id) {
      _id
    }
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
  duplicatePlan,
  changeStatus,
  forceStartPlan,
  addSchedule,
  updateSchedule,
  removeSchedule
};
