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
  goalTypesAdd,
  goalTypesEdit,
  goalTypesRemove
};
