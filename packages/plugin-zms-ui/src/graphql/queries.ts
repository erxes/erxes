const listDictionary = `
query GetDictionaries($parentId: String) {
  getDictionaries(parentId: $parentId) {
    _id
    parentId
    name
    code
    type
    isParent
    createdAt
    createdBy
  }
}
`;

const listZmsParent = `
query GetDictionaries($isParent: Boolean = true) {
  getDictionaries(isParent: $isParent) {
    name
    _id
    isParent
  }
}
`;

const totalCount = `
  query zmssTotalCount{
    zmssTotalCount
  }
`;

export default {
  listDictionary,
  totalCount,
  listZmsParent
};
