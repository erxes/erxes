const skillTypes = `
  query skillTypes {
    skillTypes {
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

const skills = `
  query skills($typeId: String, $page: Int, $perPage: Int, $memberIds: [String]) {
    skills(typeId: $typeId, page: $page, perPage: $perPage, memberIds: $memberIds) {
      _id
      name
      typeId
      memberIds
    }
  }
`;

const skillsTotalCount = `
  query skillsTotalCount($typeId: String) {
    skillsTotalCount(typeId: $typeId)
  }
`;

export default {
  skills,
  skillsTotalCount,
  skillTypes,
  skillTypesTotalCount
};
