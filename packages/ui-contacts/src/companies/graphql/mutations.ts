import { companyFields } from './queries';

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
  $businessType: String,
  $description: String,
  $isSubscribed: String,
  $links: JSON,
  $customFieldsData: JSON,
  $code: String,
  $location: String
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
  businessType: $businessType,
  description: $description,
  isSubscribed: $isSubscribed,
  links: $links,
  customFieldsData: $customFieldsData,
  code: $code,
  location: $location
`;

const companiesAdd = `
  mutation companiesAdd(${commonFields}) {
    companiesAdd(${commonVariables}) {
      ${companyFields}
    }
  }
`;

const companiesEdit = `
  mutation companiesEdit($_id: String!, ${commonFields}) {
    companiesEdit(_id: $_id, ${commonVariables}) {
      ${companyFields}
    }
  }
`;

export default {
  companiesAdd,
  companiesEdit
};
