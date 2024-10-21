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
  $userId: String,
  $assignedUserIds: [String],
  $assignedDepartmentIds: [String],
  $tagIds: [String],
  $serviceType: String,
  $serviceName: String,
  $charts: [JSON] 
`;

const reportVariables = `
  name: $name,
  sectionId : $sectionId
  visibility: $visibility,
  userId: $userId,
  assignedUserIds: $assignedUserIds,
  assignedDepartmentIds: $assignedDepartmentIds,
  tagIds: $tagIds,
  serviceType: $serviceType,
  serviceName: $serviceName,
  charts: $charts
`;

const chartParams = `
  $name: String,
  $contentType: String
  $chartType: String
  $layout: String
  $vizState: String
  $serviceName: String
  $templateType: String
  $filter: JSON
  $dimension: JSON
`;

const chartVariables = `
  name: $name,
  contentType: $contentType
  chartType: $chartType
  layout: $layout
  vizState: $vizState
  filter: $filter
  dimension: $dimension
  serviceName: $serviceName
  templateType: $templateType
`;

const chartFields = `
  name
  layout
`;

const reportAdd = `
  mutation reportAdd(${reportParams}) {
    reportAdd(${reportVariables}) {
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
  mutation reportEdit($_id: String!, ${reportParams}) {
    reportEdit(_id: $_id, ${reportVariables}) {
      _id
    }
  }
`;

const reportRemove = `
  mutation reportRemove($id: String!) {
    reportRemove(_id: $id)
  }
`;

const reportDuplicate = `
  mutation reportDuplicate($_id: String!) {
    reportDuplicate(_id: $_id) {
      _id
    }
  }
`;

const chartsEditMany = `
mutation chartsEditMany($contentId: String!, $contentType: String! ${reportParams}) {
  chartsEditMany(contentId: $contentId, contentType: $contentType, ${reportVariables}) 
}
`;

const chartsAdd = `
  mutation chartsAdd($contentId: String!, ${chartParams}) {
    chartsAdd(contentId: $contentId, ${chartVariables}) {
      ${chartFields}
    }
  }
`;

const chartsEdit = `
  mutation chartsEdit($_id: String!, ${chartParams}) {
    chartsEdit(_id: $_id, ${chartVariables}) {
      ${chartFields}
    }
  }
`;

const chartsRemove = `
  mutation chartsRemove($_id: String!){
    chartsRemove(_id: $_id)
  }
`;

const chartDuplicate = `
  mutation chartDuplicate($_id: String!) {
    chartDuplicate(_id: $_id) {
      _id
    }
  }
`;

// Dashboard Mutations

const dashboardParams = `
  $name: String,
  $sectionId: String,
  $visibility: VisibilityType,
  $userId: String,
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
  userId: $userId,
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
  reportRemove,
  reportDuplicate,

  chartsAdd,
  chartsEdit,
  chartsEditMany,
  chartsRemove,
  chartDuplicate,

  dashboardAdd,
  dashboardAddTo,
  dashboardEdit,
  dashboardRemove,
  dashboardDuplicate,

  sectionAdd,
  sectionRemove,
};
