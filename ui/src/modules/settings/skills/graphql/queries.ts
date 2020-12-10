const getSkillTypes = `
  query skillTypes($page: Int, $perPage: Int) {
    skillTypes(page: $page, perPage: $perPage) {
      _id
      name
    }
  }
`;

const skillTypesTotalCount = `
  query skillTypesTotalCount {
    skillTypesTotalCount
  }
`;

export default {
  getSkillTypes,
  skillTypesTotalCount
};
