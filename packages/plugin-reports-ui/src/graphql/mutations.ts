const report_params = `
  $name: String,
  $visibility: VisibilityType,
  $assignedUserIds: [String],
  $assignedDepartmentIds: [String],
  $tagIds: [String],
  $reportTemplateType: String
  $serviceName: String
  $charts: [JSON]
`;

const report_params_def = `
  name: $name,
  visibility: $visibility,
  assignedUserIds: $assignedUserIds,
  assignedDepartmentIds: $assignedDepartmentIds,
  tagIds: $tagIds,
  reportTemplateType: $reportTemplateType
  serviceName: $serviceName
  charts: $charts
`;
const report_chart_params = `
  $name: String,
  $chartType: String
  $layout: String
  $vizState: String
  $serviceName: String
  $templateType: String
  $filter: JSON
  $dimension: JSON
`;

const report_chart_params_def = `
  name: $name,
  chartType: $chartType
  layout: $layout
  vizState: $vizState
  filter: $filter
  dimension: $dimension
  serviceName: $serviceName
  templateType: $templateType
`;

const report_chart_fields = `
    name
    layout
`;

const commonFields = `
    $entity: String
    $stageId: String
    $pipelineId: String
    $boardId: String
    $contributionType: String
    $metric:String
    $goalTypeChoose: String
    $contribution: [String]
    $department:[String]
    $unit:[String]
    $branch:[String]
    $specificPeriodGoals:JSON
    $startDate:Date
    $endDate:Date
    $target:Float
    $segmentIds: [String] 
    $segmentRadio:Boolean
    $stageRadio:Boolean
    $periodGoal:String
    $teamGoalType:String
`;

const commonVariables = `
  entity:$entity
  stageId:$stageId
  pipelineId:$pipelineId
  boardId:$boardId
  contributionType:$contributionType
  metric:$metric
  goalTypeChoose:$goalTypeChoose
  contribution:$contribution
  department:$department
  unit:$unit
  branch:$branch
  specificPeriodGoals:$specificPeriodGoals
  startDate:$startDate
  endDate:$endDate
  target:$target
  segmentIds: $segmentIds
  segmentRadio:$segmentRadio
  stageRadio:$stageRadio
  periodGoal:$periodGoal
  teamGoalType:$teamGoalType
`;

const reportsAdd = `
mutation reportsAdd(${report_params}) {
  reportsAdd(${report_params_def}) {
    _id
    name
    visibility
    assignedUserIds
    assignedDepartmentIds
    tagIds
  }
}
`;

const reportsRemoveMany = `
mutation reportsRemoveMany($ids: [String]!) {
  reportsRemoveMany(ids: $ids)
}`;

const reportsEdit = `
mutation reportsEdit($_id: String!, ${report_params}) {
  reportsEdit(_id: $_id, ${report_params_def}) {
    name
    visibility
    assignedUserIds
    assignedDepartmentIds
    tagIds
  }
}
`;
const reportChartsEdit = `
mutation reportChartsEdit($_id: String!, ${report_chart_params}) {
  reportChartsEdit(_id: $_id, ${report_chart_params_def}) {
    ${report_chart_fields}
  }
}
`;
const reportChartsAdd = `
mutation reportChartsAdd($reportId: String!, ${report_chart_params}) {
  reportChartsAdd(reportId: $reportId, ${report_chart_params_def}) {
    ${report_chart_fields}
  }
}
`;
const reportChartsRemove = `
mutation reportChartsRemove($_id: String!){
  reportChartsRemove(_id: $_id)
}`;

const goalTypesAdd = `
  mutation goalsAdd(${commonFields}) {
    goalsAdd(${commonVariables}) {
      _id
      entity
      boardId
      pipelineId
      stageId
      contributionType
      metric
      goalTypeChoose
      contribution
      department
      unit
      branch
      specificPeriodGoals
      startDate
      endDate
      target
      segmentIds
      segmentRadio
      stageRadio
      periodGoal
      teamGoalType
    }
  }
`;

const goalTypesEdit = `
  mutation goalsEdit($_id: String!, ${commonFields}) {
    goalsEdit(_id: $_id, ${commonVariables}) {
      _id
      entity
      stageId
      pipelineId
      boardId
      contributionType
      metric
      goalTypeChoose
      contribution
      department
      unit
      branch
      specificPeriodGoals
      startDate
      endDate
      target
      segmentIds
      segmentRadio
      segmentRadio
      periodGoal
      teamGoalType
    }
  }
`;

const goalTypesRemove = `
  mutation goalsRemove($ goalTypeIds: [String]) {
    goalsRemove( goalTypeIds: $ goalTypeIds)
  }
`;

export default {
  reportsAdd,
  reportsRemoveMany,
  reportsEdit,
  reportChartsAdd,
  reportChartsEdit,
  reportChartsRemove,

  goalTypesAdd,
  goalTypesEdit,
  goalTypesRemove,
};
