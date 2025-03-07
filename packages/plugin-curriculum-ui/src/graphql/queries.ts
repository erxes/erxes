const list = `
  query listQuery($typeId: String) {
    curriculums(typeId: $typeId) {
      _id
      name
      expiryDate
      createdAt
      checked
      typeId
      currentType{
        _id
        name
      }
    }
  }
`;

const listCurriculumTypes = `
  query listCurriculumTypeQuery{
    curriculumTypes{
      _id
      name
    }
  }
`;

const totalCount = `
  query curriculumsTotalCount{
    curriculumsTotalCount
  }
`;

export default {
  list,
  totalCount,
  listCurriculumTypes,
};
