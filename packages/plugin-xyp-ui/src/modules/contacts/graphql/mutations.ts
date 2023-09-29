const remove = `
  mutation xypRemove($_id: String!){
    xypRemove(_id: $_id)
  }
  `;

const edit = `
  mutation xypDataUpdate($_id:String!,$contentType: String, $contentTypeId: String, $data: JSON){
    xypDataUpdate(_id: $_id,contentType: $contentType, contentTypeId: $contentTypeId, data: $data){
      _id
    }
  }`;

const add = `
  mutation xypDataAdd($contentType: String, $contentTypeId: String, $data: JSON){
    xypDataAdd(contentType: $contentType, contentTypeId: $contentTypeId, data: $data) {
      _id
      data
    }
  }
  `;
const customerEdit = `
mutation customersEdit($_id: String!, $avatar: String, $firstName: String, $lastName: String, $middleName: String, $sex: Int, $birthDate: Date, $primaryEmail: String, $primaryPhone: String, $phones: [String], $emails: [String], $ownerId: String, $position: String, $department: String, $leadStatus: String, $hasAuthority: String, $description: String, $isSubscribed: String, $links: JSON, $customFieldsData: JSON, $code: String, $emailValidationStatus: String, $phoneValidationStatus: String) {
  customersEdit(
    _id: $_id
    avatar: $avatar
    firstName: $firstName
    lastName: $lastName
    middleName: $middleName
    sex: $sex
    birthDate: $birthDate
    primaryEmail: $primaryEmail
    primaryPhone: $primaryPhone
    phones: $phones
    emails: $emails
    ownerId: $ownerId
    position: $position
    department: $department
    leadStatus: $leadStatus
    hasAuthority: $hasAuthority
    description: $description
    isSubscribed: $isSubscribed
    links: $links
    customFieldsData: $customFieldsData
    code: $code
    emailValidationStatus: $emailValidationStatus
    phoneValidationStatus: $phoneValidationStatus
  ) {
    _id
    firstName
    middleName
    lastName
    avatar
    sex
    birthDate
    primaryEmail
    emails
    primaryPhone
    phones
    state
    visitorContactInfo
    modifiedAt
    position
    department
    leadStatus
    hasAuthority
    description
    isSubscribed
    code
    emailValidationStatus
    phoneValidationStatus
    score
    isOnline
    lastSeenAt
    sessionCount
    links
    ownerId
    owner {
      _id
      details {
        fullName
        __typename
      }
      __typename
    }
    integrationId
    createdAt
    remoteAddress
    location
    customFieldsData
    trackedData
    tagIds
    getTags {
      _id
      name
      colorCode
      __typename
    }
    __typename
  }
}`;
export default {
  add,
  remove,
  edit,
  customerEdit
};
