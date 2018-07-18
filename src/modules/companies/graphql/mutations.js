const commonFields = `
  $similarNames: [String],
  $displayName: String,
  $size: Int,
  $industry: String,
  $plan: String,
  $parentCompanyId: String,
  $email: String,
  $ownerId: String,
  $phone: String,
  $leadStatus: String,
  $lifecycleState: String,
  $businessType: String,
  $description: String,
  $employees: Int,
  $doNotDisturb: String,
  $links: JSON
  $customFieldsData: JSON
`;

const commonVariables = `
  similarNames: $similarNames,
  displayName: $displayName,
  size: $size,
  industry: $industry,
  plan: $plan,
  parentCompanyId: $parentCompanyId,
  email: $email,
  ownerId: $ownerId,
  phone: $phone,
  leadStatus: $leadStatus,
  lifecycleState: $lifecycleState,
  businessType: $businessType,
  description: $description,
  employees: $employees,
  doNotDisturb: $doNotDisturb,
  links: $links
  customFieldsData: $customFieldsData
`;

const companiesAdd = `
  mutation companiesAdd(${commonFields}) {
    companiesAdd(${commonVariables}) {
      _id
    }
  }
`;

const companiesEdit = `
  mutation companiesEdit($_id: String!, ${commonFields}) {
    companiesEdit(_id: $_id, ${commonVariables}) {
      displayName
      similarNames
      size
      industry
      plan
      parentCompanyId
      email
      ownerId
      phone
      leadStatus
      lifecycleState
      businessType
      description
      employees
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

const companiesAddCustomer = `
  mutation companiesAddCustomer($_id: String!, $name: String!, $email: String) {
    companiesAddCustomer(_id: $_id, name: $name, email: $email) {
      _id
    }
  }
`;

const companiesEditCustomers = `
  mutation companiesEditCustomers($_id: String!, $customerIds: [String]) {
    companiesEditCustomers(_id: $_id, customerIds: $customerIds) {
      _id
    }
  }
`;

const companiesRemove = `
  mutation companiesRemove($companyIds: [String]) {
    companiesRemove(companyIds: $companyIds)
  }
`;

const companiesMerge = `
  mutation companiesMerge($companyIds: [String], $companyFields: JSON) {
    companiesMerge(companyIds: $companyIds, companyFields: $companyFields) {
      _id
    }
  }
`;

export default {
  companiesAdd,
  companiesEdit,
  companiesAddCustomer,
  companiesEditCustomers,
  companiesRemove,
  companiesMerge
};
