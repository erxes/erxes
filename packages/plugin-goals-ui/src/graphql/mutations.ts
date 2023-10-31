const commonFields = `
    $entity: String
    $stageId: String
    $pipelineId: String
    $boardId: String
    $contributionType: String
    $frequency:String
    $metric:String
    $goalType: String
    $contribution: [String]
    $department:String
    $unit:String
    $branch:String
    $specificPeriodGoals:JSON
    $startDate:String
    $endDate:String
    $target:String
`;

const commonVariables = `
  entity:$entity
  stageId:$stageId
  pipelineId:$pipelineId
  boardId:$boardId
  contributionType:$contributionType
  frequency:$frequency
  metric:$metric
  goalType:$goalType
  contribution:$contribution
  department:$department
  unit:$unit
  branch:$branch
  specificPeriodGoals:$specificPeriodGoals
  startDate:$startDate
  endDate:$endDate
  target:$target

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
      frequency
      metric
      goalType
      contribution
      department
      unit
      branch
      specificPeriodGoals
      startDate
      endDate
      target
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
      frequency
      metric
      goalType
      contribution
      department
      unit
      branch
      specificPeriodGoals
      startDate
      endDate
      target
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
