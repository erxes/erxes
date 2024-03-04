const commonParamDefs = `
  $brandName: String!
  $languageCode: String
  $color: String
  $logo: String
`;

const commonParams = `
  brandName: $brandName
  languageCode: $languageCode
  color: $color
  logo: $logo
`;

const addMessengerOnboarding = `
  mutation integrationsCreateMessengerOnboarding(${commonParamDefs}) {
    integrationsCreateMessengerOnboarding(${commonParams}) {
      _id
    }
  }
`;

const editMessengerOnboarding = `
  mutation integrationsEditMessengerOnboarding($_id: String!, $brandId: String!, ${commonParamDefs}) {
    integrationsEditMessengerOnboarding(_id: $_id, brandId:$brandId, ${commonParams}) {
      _id
    }
  }
`;

const commonUserParamsDef = `
  $username: String,
  $email: String,
  $details: UserDetails,
  $links: JSON,
  $channelIds: [String]
  $groupIds: [String]
  $brandIds: [String]
  $departmentIds: [String]
  $branchIds: [String]
  $customFieldsData: JSON
  $employeeId: String
`;

const commonUSerParams = `
  username: $username,
  email: $email,
  details: $details,
  links: $links,
  channelIds: $channelIds
  groupIds: $groupIds
  branchIds: $branchIds
  departmentIds: $departmentIds
  brandIds: $brandIds
  customFieldsData: $customFieldsData
  employeeId: $employeeId
`;

const usersEdit = `
  mutation usersEdit($_id: String!, ${commonUserParamsDef}) {
    usersEdit(_id: $_id, ${commonUSerParams}) {
      _id
    }
  }
`;

const organizationOnboardingDone = `
  mutation organizationOnboardingDone {
    organizationOnboardingDone
  }
`;

export default {
  addMessengerOnboarding,
  editMessengerOnboarding,
  organizationOnboardingDone,
  usersEdit,
};
