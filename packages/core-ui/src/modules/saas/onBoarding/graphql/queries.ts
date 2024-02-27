const getOnboardingSteps = `
  query getOnboardingSteps {
    getOnboardingSteps
  }
`;

const commonParamsDef = `
  $channelId: String,
  $brandId: String,
  $kind: String,
  $perPage: Int,
  $page: Int,
  $searchValue: String
  $status: String
`;

const commonParams = `
  channelId: $channelId,
  brandId: $brandId,
  kind: $kind,
  perPage: $perPage,
  page: $page,
  searchValue: $searchValue
  status: $status
`;

const integrations = `
  query integrations(${commonParamsDef}) {
    integrations(${commonParams}) {
      _id
      name
      brandId
      languageCode
      isActive
      uiOptions
      isConnected
      channels {
        _id
        name
      }
      brand {
        _id
        name
        code
      }
    }
  }
`;

const userDetail = `
  query userDetail($_id: String) {
    userDetail(_id: $_id) {
      _id
      username
      email
      isActive
      status
      groupIds
      branchIds
      departmentIds

      details {
        firstName
        lastName
        avatar
      }
    }
  }
`;

export default {
  getOnboardingSteps,
  integrations,
  userDetail,
};
