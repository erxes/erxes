const addMeeting = `
  mutation MeetingAdd($title: String, $description: String, $startDate: Date, $endDate: Date, $location: String, $createdBy: String, $status: String, $participantIds: [String]) {
  meetingAdd(title: $title, description: $description, startDate: $startDate, endDate: $endDate, location: $location, createdBy: $createdBy, status: $status, participantIds: $participantIds) {
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
  mutation meetingssRemove($_id: String!){
    meetingssRemove(_id: $_id)
  }
  `;

const editMeeting = `
  mutation meetingssEdit($_id: String!, $name:String, $expiryDate:Date, $checked:Boolean, $typeId:String){
    meetingssEdit(_id: $_id, name: $name, expiryDate:$expiryDate, checked:$checked, typeId:$typeId){
      _id
    }
  }
  `;

const addType = `
  mutation typesAdd($name: String!){
    meetingsTypesAdd(name:$name){
      name
      _id
    }
  }
  `;

const removeType = `
  mutation typesRemove($_id:String!){
    meetingsTypesRemove(_id:$_id)
  }
`;

const editType = `
  mutation typesEdit($_id: String!, $name:String){
    meetingsTypesEdit(_id: $_id, name: $name){
      _id
    }
  }
`;

export default {
  addMeeting,
  remove,
  editMeeting,
  addType,
  removeType,
  editType
};
