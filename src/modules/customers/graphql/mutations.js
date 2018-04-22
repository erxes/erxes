const commonFields = `
  $firstName: String,
  $lastName: String,
  $email: String,
  $phone: String,
  $ownerId: String,
  $position: String,
  $department: String,
  $leadStatus: String,
  $lifecycleState: String,
  $hasAuthority: String,
  $description: String,
  $doNotDisturb: String,
  $links: JSON
  $customFieldsData: JSON
`;

const commonVariables = `
  firstName: $firstName,
  lastName: $lastName,
  email: $email,
  phone: $phone,
  ownerId: $ownerId,
  position: $position,
  department: $department,
  leadStatus: $leadStatus,
  lifecycleState: $lifecycleState,
  hasAuthority: $hasAuthority,
  description: $description,
  doNotDisturb: $doNotDisturb,
  links: $links
  customFieldsData: $customFieldsData
`;

const customersAdd = `
  mutation customersAdd(${commonFields}) {
    customersAdd(${commonVariables}) {
      _id
    }
  }
`;

const customersEdit = `
  mutation customersEdit($_id: String!, ${commonFields}) {
    customersEdit(_id: $_id, ${commonVariables}) {
      firstName
      lastName
      email
      phone
      ownerId
      position
      department
      leadStatus
      lifecycleState
      hasAuthority
      description
      doNotDisturb
      links {
        linkedIn
        twitter
        facebook
        github
        youtube
        website
      }
    }
  }
`;

const customersAddCompany = `
  mutation customersAddCompany($_id: String!, $name: String!, $website: String) {
    customersAddCompany(_id: $_id, name: $name, website: $website) {
      _id
    }
  }
`;

const customersEditCompanies = `
  mutation customersEditCompanies($_id: String!, $companyIds: [String]) {
    customersEditCompanies(_id: $_id, companyIds: $companyIds) {
      companies {
        _id
        name
        website
      }
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

export default {
  customersAdd,
  customersEdit,
  customersAddCompany,
  customersEditCompanies,
  customersRemove,
  customersMerge
};
