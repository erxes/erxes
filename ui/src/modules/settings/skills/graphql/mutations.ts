const skillTypeAdd = `
  mutation createSkillType($name: String!) {
    createSkillType(name: $name) {
      _id
    }
  }
`;

const skillTypeEdit = `
  mutation updateSkillType($_id: String!, $name: String) {
    updateSkillType(_id: $_id, name: $name)
  }
`;

const skillTypeRemove = `
  mutation removeSkillType($_id: String!) {
    removeSkillType(_id: $_id)
  }
`;

const skillAdd = `
  mutation createSkill($name: String!, $typeId: String!, $memberIds: [String]) {
    createSkill(name: $name, typeId: $typeId, memberIds: $memberIds) {
      _id
    }
  }
`;

const skillRemove = `
  mutation removeSkill($_id: String!) {
    removeSkill(_id: $_id)
  }
`;

export default {
  skillTypeAdd,
  skillTypeEdit,
  skillTypeRemove,
  skillAdd,
  skillRemove
};
