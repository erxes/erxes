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
   createdUser {
     _id
     username
     details {
        fullName
      }
    }
  participantUser{
      _id
      details {
        fullName
        firstName
        lastName
      }
    }
`;

const meetings = `
query meetings($companyId: String, $status: String){
  meetings(companyId: $companyId, status: $status){
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
    participantUser{
      _id
      details {
        fullName
      }
    }
    createdUser {
        details {
          fullName
        }
      }
    topics{
      _id
      title
      description
      ownerId
    }
  }
}
`;

export default {
  meetings,
  meetingDetail
};
