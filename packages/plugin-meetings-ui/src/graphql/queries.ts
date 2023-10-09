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
  dealIds
   createdUser {
     _id
     username
     email
     details {
        fullName
      }
    }
  participantUser{
      _id
      isActive
      email
      details {
        fullName
        firstName
        lastName
        avatar
      }
    }
`;

export const meetingsFilterParamsDef = `
    companyId: $companyId,
    createdAtFrom : $createdAtFrom,
    createdAtTo: $createdAtTo,
    status: $status
    userId: $userId
    isPreviousSession: $isPreviousSession
    participantIds: $participantIds
    dealIds: $dealIds
    perPage: $perPage
    page: $page
    searchValue: $searchValue
`;

export const meetingsFilterParams = `
    $companyId: String,
    $createdAtFrom: String,
    $createdAtTo: String,
    $status: String
    $userId: String
    $isPreviousSession: Boolean
    $participantIds: [String]
    $dealIds: [String]
    $perPage: Int
    $page: Int
    $searchValue: String
`;

const meetings = `
query meetings(${meetingsFilterParams}){
  meetings(${meetingsFilterParamsDef}){
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
    method
    createdBy
    createdAt
    status
    companyId
    deals{
      _id
      boardId
      pipeline{
        _id
      }
      name
    }
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

const meetingsCount = `
query meetingsTotalCount{
 meetingsTotalCount
}`;

const meetingPinnedUsers = `
query meetingPinnedUsers {
  meetingPinnedUsers {
    pinnedUserIds
    userId
    pinnedUsersInfo{
      _id
      email
      details {
        fullName
      }
    }
  }
}`;

const deals = `
  query deals(
    $searchValue: String,
  ) {
    deals(
      search: $searchValue,
    ) {
      _id
      name
    }
  }
`;

export default {
  meetings,
  meetingDetail,
  meetingsCount,
  meetingPinnedUsers,
  deals
};
