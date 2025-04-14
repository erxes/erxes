const couponsAdd = `
    mutation couponAdd($campaignId: String, $customConfig: [JSON]) {
        couponAdd(campaignId: $campaignId, customConfig: $customConfig) {
            code
            status
        }
    }
`;

export default { couponsAdd };
