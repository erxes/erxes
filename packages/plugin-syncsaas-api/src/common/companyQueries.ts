const companyDetail = `
    query CompanyDetail($id: String!) {
      companyDetail(_id: $id) {
        _id
      }
    }
`;

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
        _id
        primaryEmail
    }
  }
`;

const companiesQuery = `
  query Companies($searchValue: String) {
    companies(searchValue: $searchValue) {
        _id
        avatar
        createdAt
        primaryEmail
        primaryPhone
        businessType
        names
    }
  }
`;

export { companyDetail, companiesAdd, companiesQuery };
