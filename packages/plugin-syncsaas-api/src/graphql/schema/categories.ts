const commonTypes = `
    _id:String,
    name:String,
    description:String,
    parentId:String,
    code:String,
    order:String,
    count:Int,
    isRoot:Boolean,
`;

export const types = `

    type SyncSaasCategory  {
        ${commonTypes}
    }

`;

const commonQueryParams = `
    ids:[String],
    excludeIds:[String],
    searchValue:String,
`;

export const queries = `
    syncedSaasCategories(${commonQueryParams}) :[SyncSaasCategory]
    syncedSaasCategoriesTotalCount(${commonQueryParams}):Int
`;

const commonMutationParams = `
    name:String,
    description:String,
    parentId:String,
    code:String
`;

export const mutations = `
    addCategorySyncSaas(${commonMutationParams}):JSON
    editCategorySaasSync(_id:String,${commonMutationParams}):JSON
    removeCategorySaasSync(_id:String):JSON
`;
