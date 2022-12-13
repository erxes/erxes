const variables = `
    $cityId: String
    $name: String
    $code: String
    $center: String
`;

const fields = `
    cityId : $cityId
    name : $name
    code : $code
    center : $center
`;

const addMutation = `
    mutation districtsAdd(${variables}) {
        districtsAdd(${fields}) {
            _id
        }
    }
`;

const editMutation = `
    mutation districtsEdit($_id: String, ${variables}) {
        districtsEdit($_id: $_id, ${fields}) {
            _id
        }
    }
`;

const removeMutation = `
    mutation districtsRemove($_ids: [String]) {
        districtsRemove(_ids: $_ids)
    }
`;

export default {
  addMutation,
  editMutation,
  removeMutation
};
