const list = `
  query listQuery($typeId: String) {
    cmss(typeId: $typeId) {
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

const listCmsTypes = `
  query listCmsTypeQuery{
    cmsTypes{
      _id
      name
    }
  }
`;

const totalCount = `
  query cmssTotalCount{
    cmssTotalCount
  }
`;

export default {
  list,
  totalCount,
  listCmsTypes
};
