const coupons = `
    query coupons(
        $searchValue: String
        $page: Int
        $perPage: Int
        $sortDirection: Int
        $sortField: String
        $status: String
        $campaignId: String
        $fromDate: String
        $toDate: String
    ) {
    coupons(
        searchValue: $searchValue
        page: $page
        perPage: $perPage
        sortDirection: $sortDirection
        sortField: $sortField
        status: $status
        campaignId: $campaignId
        fromDate: $fromDate
        toDate: $toDate
    ) {
        list {
            _id
            ownerId
            code
            usageLimit
            usageCount
            status
            redemptionLimitPerUser
            usageLogs
            createdAt

            campaign {
                title
            }
        }
        totalCount
      }
    }
`;

export default { coupons };
