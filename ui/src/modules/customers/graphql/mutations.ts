const commonFields = `
  $avatar: String,
  $firstName: String,
  $lastName: String,
  $sex: Int,
  $birthDate:Date,
  $primaryEmail: String,
  $primaryPhone: String,
  $phones: [String],
  $emails: [String],
  $ownerId: String,
  $position: String,
  $department: String,
  $leadStatus: String,
  $hasAuthority: String,
  $description: String,
  $doNotDisturb: String,
  $links: JSON,
  $customFieldsData: JSON,
  $code: String
`;

const commonVariables = `
  avatar: $avatar,
  firstName: $firstName,
  lastName: $lastName,
  sex: $sex,
  birthDate: $birthDate,
  primaryEmail: $primaryEmail,
  primaryPhone: $primaryPhone,
  phones: $phones,
  emails: $emails,
  ownerId: $ownerId,
  position: $position,
  department: $department,
  leadStatus: $leadStatus,
  hasAuthority: $hasAuthority,
  description: $description,
  doNotDisturb: $doNotDisturb,
  links: $links,
  customFieldsData: $customFieldsData,
  code: $code
`;

const customersAdd = `
  mutation customersAdd($state: String, ${commonFields}) {
    customersAdd(state: $state, ${commonVariables}) {
      _id
      firstName
      primaryEmail
    }
  }
`;

const customersEdit = `
  mutation customersEdit($_id: String!, ${commonFields}) {
    customersEdit(_id: $_id, ${commonVariables}) {
      _id
      avatar
      firstName
      lastName
      primaryEmail
      primaryPhone
      code
      sex
      birthDate
      phones
      emails
      ownerId
      position
      department
      leadStatus
      hasAuthority
      description
      doNotDisturb
      links
    }
  }
`;

const customersRemove = `
  mutation customersRemove($customerIds: [String]) {
    customersRemove(customerIds: $customerIds)
  }
`;

const customersMerge = `
  mutation customersMerge($customerIds: [String], $customerFields: JSON) {
    customersMerge(customerIds: $customerIds, customerFields: $customerFields) {
      _id
    }
  }
`;

const customersChangeState = `
  mutation customersChangeState($_id: String!, $value: String!) {
    customersChangeState(_id: $_id, value: $value) {
      _id
    }
  }
`;

const customersVerify = `
  mutation customersVerify($verificationType: String!) {
    customersVerify(verificationType: $verificationType)
  }
`;

export default {
  customersAdd,
  customersEdit,
  customersRemove,
  customersChangeState,
  customersMerge,
  customersVerify
};
