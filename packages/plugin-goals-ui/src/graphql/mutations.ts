const commonFields = `
    $entity: String
    $contributionType: String
    $chooseBoard: String
    $frequency:String
    $metric:String
    $goalType: String
    $contribution:String
    $startDate:String
    $endDate:String
    $target:String
`;

const commonVariables = `
  entity:$entity
  contributionType:$contributionType
  chooseBoard:$chooseBoard
  frequency:$frequency
  metric:$metric
  goalType:$goalType
  contribution:$contribution
  startDate:$startDate
  endDate:$endDate
  target:$target

`;

const goalTypesAdd = `
  mutation goalsAdd(${commonFields}) {
    goalsAdd(${commonVariables}) {
      _id
      entity
      contributionType
      chooseBoard 
      frequency
      metric
      goalType
      contribution
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
      contributionType
      chooseBoard 
      frequency
      metric
      goalType
      contribution
      startDate
      endDate
      target
    }
  }
`;

// const goalTypesRemove = `
//   mutation goalsRemove($_id: String) {
//     goalsRemove(_id: $_id)
//   }
// `;

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
