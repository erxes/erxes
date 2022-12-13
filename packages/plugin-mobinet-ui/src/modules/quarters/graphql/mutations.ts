const variables = `
    $code: String!
    $name: String!
    $center: JSON
    $districtId: String
`;

const commonFields = `
    code: $code
    name: $name
    center: $center
    districtId: $districtId
`;

const addMutation = `
mutation QuartersAdd(${variables}) {
    quartersAdd(${commonFields}) {
      _id
    }
  }
`;

const editMutation = `
mutation QuartersEdit($_id: String!, ${variables}) {
    quartersEdit(_id: $_id, ${commonFields}) {
      _id
    }
  }
`;

const removeMutation = `
mutation QuartersRemove($_ids: [String]) {
    quartersRemove(_ids: $_ids)
  }
`;

export default {
  addMutation,
  editMutation,
  removeMutation
};
