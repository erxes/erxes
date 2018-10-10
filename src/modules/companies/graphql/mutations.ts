const commonFields = `
  $names: [String],
  $avatar: String,
  $primaryName: String,
  $size: Int,
  $industry: String,
  $parentCompanyId: String,
  $email: String,
  $ownerId: String,
  $phone: String,
  $leadStatus: String,
  $lifecycleState: String,
  $businessType: String,
  $description: String,
  $doNotDisturb: String,
  $links: JSON
  $customFieldsData: JSON
`;

const commonVariables = `
  names: $names,
  avatar: $avatar,
  primaryName: $primaryName,
  size: $size,
  industry: $industry,
  parentCompanyId: $parentCompanyId,
  email: $email,
  ownerId: $ownerId,
  phone: $phone,
  leadStatus: $leadStatus,
  lifecycleState: $lifecycleState,
  businessType: $businessType,
  description: $description,
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
      avatar
      primaryName
      names
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
  companiesEditCustomers,
  companiesMerge,
  companiesRemove
};
