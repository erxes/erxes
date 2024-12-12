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
`;

const scoreCampaigns = `
    query ScoreCampaigns(${queryParams}) {
      scoreCampaigns(${queryParamsDef}) {
        ${fields}
      }
      scoreCampaignsTotalCount(${queryParamsDef})
    }
`;

export default {
  scoreCampaigns
};
