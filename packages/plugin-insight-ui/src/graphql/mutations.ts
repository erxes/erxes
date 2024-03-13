// Goal Mutations

const goalParams = `
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

const goalVariables = `
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

const goalTypesAdd = `
  mutation goalsAdd(${goalParams}) {
    goalsAdd(${goalVariables}) {
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
  mutation goalsEdit($_id: String!, ${goalParams}) {
    goalsEdit(_id: $_id, ${goalVariables}) {
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

// Report Mutations

const reportParams = `
  $name: String,
  $sectionId: String
  $visibility: VisibilityType,
  $assignedUserIds: [String],
  $assignedDepartmentIds: [String],
  $tagIds: [String],
  $reportTemplateType: String,
  $serviceName: String,
  $charts: [JSON] 
`;

const reportVariables = `
  name: $name,
  sectionId : $sectionId
  visibility: $visibility,
  assignedUserIds: $assignedUserIds,
  assignedDepartmentIds: $assignedDepartmentIds,
  tagIds: $tagIds,
  reportTemplateType: $reportTemplateType,
  serviceName: $serviceName,
  charts: $charts
`;

const reportChartParams = `
  $name: String,
  $chartType: String
  $layout: String
  $vizState: String
  $serviceName: String
  $templateType: String
  $filter: JSON
  $dimension: JSON
`;

const reportChartVariables = `
  name: $name,
  chartType: $chartType
  layout: $layout
  vizState: $vizState
  filter: $filter
  dimension: $dimension
  serviceName: $serviceName
  templateType: $templateType
`;

const reportChartFields = `
  name
  layout
`;

const reportAdd = `
  mutation reportsAdd(${reportParams}) {
    reportsAdd(${reportVariables}) {
      _id
      name
      visibility
      assignedUserIds
      assignedDepartmentIds
      tagIds
    }
  }
`;

const reportEdit = `
  mutation reportsEdit($_id: String!, ${reportParams}) {
    reportsEdit(_id: $_id, ${reportVariables}) {
      name
      visibility
      assignedUserIds
      assignedDepartmentIds
      tagIds
    }
  }
`;

const reportsRemove = `
  mutation reportsRemoveMany($ids: [String]!) {
    reportsRemoveMany(ids: $ids)
  }
`;

const reportsDuplicate = `
  mutation reportsDuplicate($_id: String!) {
    reportsDuplicate(_id: $_id) {
      _id
    }
  }
`;

const reportChartsEditMany = `
mutation reportChartsEditMany($reportId: String!, ${reportParams}) {
  reportChartsEditMany(reportId: $reportId, ${reportVariables}) 
}
`;

const reportChartsAdd = `
  mutation reportChartsAdd($reportId: String!, ${reportChartParams}) {
    reportChartsAdd(reportId: $reportId, ${reportChartVariables}) {
      ${reportChartFields}
    }
  }
`;

const reportChartsEdit = `
  mutation reportChartsEdit($_id: String!, ${reportChartParams}) {
    reportChartsEdit(_id: $_id, ${reportChartVariables}) {
      ${reportChartFields}
    }
  }
`;

const reportChartsRemove = `
  mutation reportChartsRemove($_id: String!){
    reportChartsRemove(_id: $_id)
  }
`;

// Dashboard Mutations

const dashboardParams = `
  $name: String,
  $sectionId: String,
  $visibility: VisibilityType,
  $assignedUserIds: [String],
  $assignedDepartmentIds: [String],
  $serviceTypes: [String]
  $serviceNames: [String]
  $charts: [JSON] 
`;

const dashboardVariables = `
  name: $name,
  sectionId: $sectionId,
  visibility: $visibility,
  assignedUserIds: $assignedUserIds,
  assignedDepartmentIds: $assignedDepartmentIds,
  serviceTypes: $serviceTypes
  serviceNames: $serviceNames
  charts: $charts
`;

const dashboardAdd = `
  mutation dashboardAdd(${dashboardParams}) {
    dashboardAdd(${dashboardVariables}) {
      _id
    }
  }
`;

const dashboardAddTo = `
  mutation dashboardAddTo(${dashboardParams}) {
    dashboardAddTo(${dashboardVariables}) {
      _id
    }
  }
`;

const dashboardEdit = `
  mutation dashboardEdit($_id: String!, ${dashboardParams}) {
    dashboardEdit(_id: $_id, ${dashboardVariables}) {
      _id
    }
  }
`;

const dashboardRemove = `
  mutation dashboardRemove($id: String!) {
    dashboardRemove(_id: $id)
  }
`;

const dashboardDuplicate = `
  mutation dashboardDuplicate($_id: String!) {
    dashboardDuplicate(_id: $_id) {
      _id
    }
  }
`;

const dashboardChartsAdd = `
  mutation dashboardChartsAdd($dashboardId: String!, ${reportChartParams}) {
    dashboardChartsAdd(dashboardId: $dashboardId, ${reportChartVariables}) {
      ${reportChartFields}
    }
  }
`;

const dashboardChartsEdit = `
  mutation dashboardChartsEdit($_id: String!, ${reportChartParams}) {
    dashboardChartsEdit(_id: $_id, ${reportChartVariables}) {
      ${reportChartFields}
    }
  }
`;

const dashboardChartsRemove = `
  mutation dashboardChartsRemove($_id: String!){
    dashboardChartsRemove(_id: $_id)
  }
`;

// Section Mutations

const sectionAdd = `
  mutation sectionAdd($name: String, $type: String) {
    sectionAdd(name: $name, type: $type) {
      _id
      name
      type
      list
    }
  }
`;

const sectionRemove = `
  mutation sectionRemove($id: String!) {
    sectionRemove(_id: $id)
  }
`;

export default {
  goalTypesAdd,
  goalTypesEdit,
  goalTypesRemove,

  reportAdd,
  reportEdit,
  reportsRemove,
  reportsDuplicate,

  reportChartsAdd,
  reportChartsEdit,
  reportChartsEditMany,
  reportChartsRemove,

  dashboardAdd,
  dashboardAddTo,
  dashboardEdit,
  dashboardRemove,
  dashboardDuplicate,

  dashboardChartsAdd,
  dashboardChartsEdit,
  dashboardChartsRemove,

  sectionAdd,
  sectionRemove,
};
