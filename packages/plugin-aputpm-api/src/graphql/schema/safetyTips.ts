export const types = `
    type SafetyTip {
        _id:String,
        name:String
        description:String
        kbCategoryId:String
        branchIds:[String]
        status:String
        createdAt:Date

        branches:JSON
        kbCategory:JSON
    }
`;

const commonParams = `
    name:String,
    branchIds:[String],
    kbCategoryIds:[String],
    sortDirection:Int
`;

export const queries = `
    safetyTips(${commonParams}):[SafetyTip]
    safetyTipsTotalCount(${commonParams}):Int
`;

const commonMutationParams = `
    name: String,
    description: String,
    branchIds: [String],
    kbCategoryId: String,
    status: String,
`;

export const mutations = `
    addSafetyTip(${commonMutationParams}):SafetyTip
    updateSafetyTip(_id:String,${commonMutationParams}):SafetyTip
    removeSafetyTip(_id:String):SafetyTip
`;
