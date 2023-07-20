export const types = `
    type SyncedSaaS  {
        _id: String,
        name:String,
        description:String,
        subdomain:String,
        appToken:String,
        startDate:Date,
        expireDate:Date,

        organizationDetail:JSON
    }
`;

const commonQueryParams = `
    searchValue:String,
    dateFilters:JSON
`;

export const queries = `
    syncedSaasList(${commonQueryParams}) :[SyncedSaaS]
    syncedSaasListTotalCount(${commonQueryParams}):Int
    SyncedSaasDetail:SyncedSaaS
    getSyncedSaas(subdomain:String,customerId:String):SyncedSaaS
`;

const commonMutationParams = `
    name:String,
    description:String,
    subdomain:String,
    appToken:String,
    startDate:String,
    expireDate:String,
`;

export const mutations = `
    addSaasSync(${commonMutationParams}):JSON
    editSaasSync(_id:String,${commonMutationParams}):JSON
    removeSaasSync(_id:String):JSON
`;
