const commonFields = `
  $names: [String],
  $avatar: String,
  $primaryName: String,
  $size: Int,
  $industry: String,
  $parentCompanyId: String,
  $emails: [String],
  $primaryEmail: String,
  $ownerId: String,
  $phones: [String],
  $primaryPhone: String,
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
  emails: $emails,
  primaryEmail: $primaryEmail,
  ownerId: $ownerId,
  phones: $phones,
  primaryPhone: $primaryPhone,
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
      emails
      primaryEmail
      ownerId
      phones
      primaryPhone
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
  companiesRemove,
  companiesMerge
};
