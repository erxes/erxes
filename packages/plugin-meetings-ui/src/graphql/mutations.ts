const addMeeting = `
  mutation MeetingAdd($title: String, $description: String, $startDate: Date, $endDate: Date, $location: String, $createdBy: String, $status: String, $participantIds: [String], $companyId: String) {
  meetingAdd(title: $title, description: $description, startDate: $startDate, endDate: $endDate, location: $location, createdBy: $createdBy, status: $status, participantIds: $participantIds, companyId: $companyId) {
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

const remove = `
  mutation meetingRemove($_id: String!){
    meetingRemove(_id: $_id)
  }
  `;

const editMeeting = `
  mutation meetingEdit($_id: String!, $title: String, $description: String, $startDate: Date, $endDate: Date, $location: String, $status: String, $participantIds: [String], $companyId: String){
    meetingEdit(_id: $_id, title: $title, description: $description, startDate: $startDate, endDate: $endDate, location: $location,  status: $status, participantIds: $participantIds, companyId: $companyId){
      _id
    }
  }
  `;

const editMeetingStatus = `
  mutation meetingEdit($_id: String!, $status: String){
    meetingEdit(_id: $_id,  status: $status){
      _id
      status
    }
  }
  `;

const addTopic = `
  mutation MeetingTopicAdd($title: String, $description: String, $ownerId: String, $meetingId: String!) {
    meetingTopicAdd(title: $title, description: $description, ownerId: $ownerId, meetingId: $meetingId) {
      title
      description
      ownerId
  }
}`;

const editTopic = `
  mutation meetingTopicEdit($_id: String!, $title: String, $description: String, $ownerId: String, $meetingId: String!){
    meetingTopicEdit(_id: $_id, title: $title, description: $description, ownerId: $ownerId, meetingId: $meetingId){
      _id
    }
  }
  `;

export default {
  addTopic,
  editTopic,
  addMeeting,
  remove,
  editMeeting,
  editMeetingStatus
};
