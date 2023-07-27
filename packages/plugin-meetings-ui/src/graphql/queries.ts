const list = `
  query listQuery($typeId: String) {
    meetingss(typeId: $typeId) {
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

const listMeetingsTypes = `
  query listMeetingsTypeQuery{
    meetingsTypes{
      _id
      name
    }
  }
`;

const totalCount = `
  query meetingssTotalCount{
    meetingssTotalCount
  }
`;

export default {
  list,
  totalCount,
  listMeetingsTypes
};
