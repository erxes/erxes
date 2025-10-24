import { commonFilters, commonInputs, paginateTypes } from './common';

export const types = `

    enum CouponStatus {
        new
        in_use
        done
    }

    type Coupon @key(fields: "_id") @cacheControl(maxAge: 3) {

        _id: String

        ownerId: String
        campaignId: String
        code: String
        usageLimit: Int
        usageCount: Int
        status: CouponStatus
        redemptionLimitPerUser: Int
        usageLogs: [JSON]
        createdAt: Date

        campaign: CouponCampaign
    }

    type CouponMain {
        list: [Coupon],
        totalCount: Int
    }

    type OwnerCoupon {
        campaign: CouponCampaign,
        coupons: [Coupon],
        count: Int
    }
`;

export const queries = `
    coupon(_id: String): Coupon
    coupons(${commonFilters} ${paginateTypes}, fromDate:String, toDate:String): CouponMain
    couponsByOwner(ownerId: String!, status: String): [OwnerCoupon]    

    couponCheck(code:String, ownerId: String): String
`;

const couponParams = `
    ${commonInputs}
    customConfig: [JSON]
`;

export const mutations = `
    couponAdd(${couponParams}): [Coupon]
    couponsRemove(_ids: [String]): JSON
`;
