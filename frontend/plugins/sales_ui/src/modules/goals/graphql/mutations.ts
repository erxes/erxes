import { gql } from "@apollo/client";

export const goalsAdd = gql`
  mutation GoalsAdd(
  $name: String
  $entity: String
  $stageId: String
  $pipelineId: String
  $boardId: String
  $contributionType: String
  $metric: String
  $goalTypeChoose: String
  $contribution: [String]
  $department: [String]
  $unit: [String]
  $branch: [String]
  $specificPeriodGoals: JSON
  $startDate: Date
  $endDate: Date
  $segmentCount: Float
  $pipelineLabels: JSON
  $productIds: [String]
  $companyIds: [String]
  $tagsIds: [String]
  $segmentIds: [String]
  $periodGoal: String
  $segmentRadio: Boolean
  $stageRadio: Boolean
  $teamGoalType: String
) {
  goalsAdd(
    name: $name
    entity: $entity
    stageId: $stageId
    pipelineId: $pipelineId
    boardId: $boardId
    contributionType: $contributionType
    metric: $metric
    goalTypeChoose: $goalTypeChoose
    contribution: $contribution
    department: $department
    unit: $unit
    branch: $branch
    specificPeriodGoals: $specificPeriodGoals
    startDate: $startDate
    endDate: $endDate
    segmentCount: $segmentCount
    pipelineLabels: $pipelineLabels
    productIds: $productIds
    companyIds: $companyIds
    tagsIds: $tagsIds
    segmentIds: $segmentIds
    periodGoal: $periodGoal
    segmentRadio: $segmentRadio
    stageRadio: $stageRadio
    teamGoalType: $teamGoalType
  ) {
    _id
    name
  }
}
`;

export const goalsEdit = gql`
  mutation goalsEdit(
    $id: String!
    $name: String
    $entity: String
    $stageId: String
    $pipelineId: String
    $boardId: String
    $contributionType: String
    $metric: String
    $goalTypeChoose: String
    $contribution: [String]
    $department: [String]
    $unit: [String]
    $branch: [String]
    $specificPeriodGoals: JSON
    $startDate: Date
    $endDate: Date
    $segmentIds: [String]
    $segmentRadio: Boolean
    $stageRadio: Boolean
    $periodGoal: String
    $teamGoalType: String
    $pipelineLabels: JSON
    $productIds: [String]
    $companyIds: [String]
    $tagsIds: [String]
  ) {
    goalsEdit(
      _id: $id
      name: $name
      entity: $entity
      stageId: $stageId
      pipelineId: $pipelineId
      boardId: $boardId
      contributionType: $contributionType
      metric: $metric
      goalTypeChoose: $goalTypeChoose
      contribution: $contribution
      department: $department
      unit: $unit
      branch: $branch
      specificPeriodGoals: $specificPeriodGoals
      startDate: $startDate
      endDate: $endDate
      segmentIds: $segmentIds
      segmentRadio: $segmentRadio
      stageRadio: $stageRadio
      periodGoal: $periodGoal
      pipelineLabels: $pipelineLabels
      productIds: $productIds
      companyIds: $companyIds
      tagsIds: $tagsIds
      teamGoalType: $teamGoalType
    ) {
      _id
      name
      entity
    }
  }
`;

export const goalsRemove = gql`
  mutation goalsRemove($ids: [String!]!) {
    goalsRemove(goalTypeIds: $ids)
  }
`;

export default {
  goalsAdd,
  goalsEdit,
  goalsRemove
};
