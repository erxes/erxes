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

const skillRemove = `
  mutation removeSkill($_id: String!) {
    removeSkill
  }
`;

export default {
  skillTypeAdd,
  skillTypeEdit,
  skillTypeRemove,
  skillRemove
};
