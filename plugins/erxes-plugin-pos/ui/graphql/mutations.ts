const commonFields = `
    $name: String,
    $description: String
`;

const commonVariables = `
    name: $name,
    description: $description,
`;


const addPos = `
  mutation addPos(${commonFields}) {
    addPos(${commonVariables}){
        _id
        name
        description
    }
  }
`;

const editPos = `
  mutation editPos($_id: String, ${commonFields}) {
    editPos(_id: $_id, ${commonVariables}){
        _id
        name
        description
    }
  }
`;

export default {
    addPos,
    editPos
};
