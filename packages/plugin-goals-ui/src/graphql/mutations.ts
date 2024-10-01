const commonFields = `
    $name: String
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
    $segmentIds: [String] 
    $segmentRadio:Boolean
    $stageRadio:Boolean
    $periodGoal:String
    $teamGoalType:String
    $pipelineLabels:JSON
    $productIds:[String]
    $companyIds:[String]
    $tagsIds:[String]
`;

const commonVariables = `
  name:$name
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
  segmentIds: $segmentIds
  segmentRadio:$segmentRadio
  stageRadio:$stageRadio
  periodGoal:$periodGoal
  pipelineLabels: $pipelineLabels
  productIds: $productIds
  companyIds: $companyIds
  tagsIds: $tagsIds
  teamGoalType:$teamGoalType
`;

const goalTypesAdd = `
  mutation goalsAdd(${commonFields}) {
    goalsAdd(${commonVariables}) {
      _id
      name
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
      segmentIds
      segmentRadio
      stageRadio
      periodGoal
      pipelineLabels
      productIds
      companyIds
      tagsIds
      teamGoalType
    }
  }
`;

const goalTypesEdit = `
  mutation goalsEdit($_id: String!, ${commonFields}) {
    goalsEdit(_id: $_id, ${commonVariables}) {
      _id
      name
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
      segmentIds
      segmentRadio
      segmentRadio
      periodGoal
      pipelineLabels
      productIds
      companyIds
      tagsIds
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
  goalTypesAdd,
  goalTypesEdit,
  goalTypesRemove
};
