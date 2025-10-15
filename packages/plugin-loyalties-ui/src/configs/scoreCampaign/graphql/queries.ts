const queryParams = `
  $page: Int,
  $perPage: Int,
  $searchValue: String,
  $status: String
`;

const queryParamsDef = `
  page: $page,
  perPage: $perPage,
  searchValue: $searchValue,
  status: $status
`;

const fields = `
  _id
  title
  description
  add
  subtract
  createdAt
  createdUserId
  status
  ownerType
  fieldGroupId
  fieldName
  fieldId
  serviceName
  additionalConfig

  restrictions
  onlyClientPortal
`;

const scoreCampaigns = `
  query ScoreCampaigns(${queryParams}) {
    scoreCampaigns(${queryParamsDef}) {
      ${fields}
    }
    scoreCampaignsTotalCount(${queryParamsDef})
  }
`;

const GET_SERVICES_QUERY = `
  query ScoreCampaignServices {
    scoreCampaignServices
  }
`;

const scoreCampaign = `
  query ScoreCampaign($_id: String) {
    scoreCampaign(_id: $_id) {
      ${fields}
    }
  }
`;

export default {
  scoreCampaigns,
  GET_SERVICES_QUERY,
  scoreCampaign,
};
