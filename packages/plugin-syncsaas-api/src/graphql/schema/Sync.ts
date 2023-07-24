export const types = `
    type SyncedSaaS  {
        _id: String,
        name:String,
        description:String,
        subdomain:String,
        appToken:String,
        startDate:Date,
        expireDate:Date,
        config:JSON

        organizationDetail:JSON
    }
`;

const commonQueryParams = `
    searchValue:String,
    dateFilters:JSON,
    customerId:String,
    customerIds:[String],
    excludedCustomerIds:[String]
`;

export const queries = `
    syncedSaasList(${commonQueryParams}) :[SyncedSaaS]
    syncedSaasListTotalCount(${commonQueryParams}):Int
    SyncedSaasDetail(_id:String!):SyncedSaaS
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
    saveSyncedSaasConfig(_id:String,config:JSON):JSON
`;
