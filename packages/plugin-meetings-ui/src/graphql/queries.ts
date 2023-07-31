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

const meetingFields = `
  _id
  title
  description
  startDate
  endDate
  location
  createdBy
  createdAt
  status
  companyId
  participantIds
`;

const meetings = `
query meetings{
  meetings{
  ${meetingFields}
  }
}`;
const meetingDetail = `
query MeetingDetail($_id: String!) {
  meetingDetail(_id: $_id) {
    _id
    title
    description
    startDate
    endDate
    location
    createdBy
    createdAt
    status
    companyId
    participantIds
  }
}
`;

export default {
  list,
  listMeetingsTypes,
  meetings,
  meetingDetail
};
