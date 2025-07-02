const couponCampaignAdd = `
    mutation CouponCampaignAdd(
        $title: String
        $description: String
        $startDate: Date
        $endDate: Date
        $finishDateOfUse: Date
        $numberFormat: String
        $attachment: AttachmentInput
        $status: String
        $kind: Kind
        $value: Float
        $codeRule: JSON
        $restrictions: JSON
        $redemptionLimitPerUser: Int
        $buyScore: Int
        $charSet: [String]
    ) {
        couponCampaignAdd(
            title: $title
            description: $description
            startDate: $startDate
            endDate: $endDate
            finishDateOfUse: $finishDateOfUse
            numberFormat: $numberFormat
            attachment: $attachment
            status: $status
            kind: $kind
            value: $value
            codeRule: $codeRule
            restrictions: $restrictions
            redemptionLimitPerUser: $redemptionLimitPerUser
            buyScore: $buyScore
            charSet: $charSet
        ) {
            createdAt
        }
    }
`;

const couponCampaignEdit = `
    mutation CouponCampaignEdit(
        $_id: String
        $title: String
        $description: String
        $startDate: Date
        $endDate: Date
        $finishDateOfUse: Date
        $numberFormat: String
        $attachment: AttachmentInput
        $status: String
        $kind: Kind
        $value: Float
        $codeRule: JSON
        $restrictions: JSON
        $redemptionLimitPerUser: Int
        $buyScore: Int
        $charSet: [String]
    ) {
        couponCampaignEdit(
            _id: $_id
            title: $title
            description: $description
            startDate: $startDate
            endDate: $endDate
            finishDateOfUse: $finishDateOfUse
            numberFormat: $numberFormat
            attachment: $attachment
            status: $status
            kind: $kind
            value: $value
            codeRule: $codeRule
            restrictions: $restrictions
            redemptionLimitPerUser: $redemptionLimitPerUser
            buyScore: $buyScore
            charSet: $charSet
        ) {
            modifiedAt
        }
    }
`;

const couponCampaignsRemove = `
    mutation couponCampaignsRemove($ids: [String]) {
        couponCampaignsRemove(_ids: $ids)
    }
`;

export default { couponCampaignAdd, couponCampaignEdit, couponCampaignsRemove };
