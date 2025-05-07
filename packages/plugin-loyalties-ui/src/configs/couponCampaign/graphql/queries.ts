const couponCampaigns = `
  query couponCampaigns(
      $ids: [String]
      $searchValue: String
      $filterStatus: String
      $page: Int
      $sortDirection: Int
      $sortField: String
      $perPage: Int
  ) {
    couponCampaigns(
      _ids: $ids
      searchValue: $searchValue
      filterStatus: $filterStatus
      page: $page
      sortDirection: $sortDirection
      sortField: $sortField
      perPage: $perPage
    ) {
      _id
      createdAt
      createdBy
      modifiedAt
      modifiedBy
      title
      description
      startDate
      endDate
      finishDateOfUse
      attachment {
        url
        name
        type
        size
        duration
      }
      status
      kind
      value
      codeRule
      restrictions
      redemptionLimitPerUser
      
      buyScore
    }
  }
`;

const couponCampaign = `
  query CouponCampaign($_id: String) {
    couponCampaign(_id: $_id) {
      _id
      codeRule
    }
  }
`;

export default {couponCampaign, couponCampaigns };
