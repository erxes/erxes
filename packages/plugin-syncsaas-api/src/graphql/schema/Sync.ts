const commonTypes = `
        _id: String,
        name:String,
        description:String,
        categoryId:String
        subdomain:String,
        appToken:String,
        startDate:Date,
        expireDate:Date,
        checkApproved:Boolean,
        config:JSON
        
        organizationDetail:JSON
        contactsDetail:[ContactSyncedSaaS]
`;

export const types = `

    type SyncedSaaS  {
        ${commonTypes}
    }
    
    type ContactSyncedSaaS  {
        ${commonTypes},
        syncId:String,
        contactTypeId:String,
        contactStatus:String,
        syncedContactId:String
    }
`;

const commonQueryParams = `
    searchValue:String,
    dateFilters:JSON,
    customerId:String,
    customerIds:[String],
    excludeCustomerIds:[String]
    categoryId:String,
    status:String,
`;

export const queries = `
    syncedSaasList(${commonQueryParams}) :[SyncedSaaS]
    syncedSaasListTotalCount(${commonQueryParams}):Int
    SyncedSaasDetail(_id:String!):SyncedSaaS
    getSyncedSaas(subdomain:String,customerId:String,companyId:String):ContactSyncedSaaS
    searchContactFromSaas(contactType:String,syncId:String,email:String):JSON
`;

const commonMutationParams = `
    name:String,
    description:String,
    categoryId:String,
    subdomain:String,
    appToken:String,
    startDate:String,
    expireDate:String,
    checkApproved:Boolean,
`;

export const mutations = `
    addSaasSync(${commonMutationParams}):JSON
    editSaasSync(_id:String,${commonMutationParams}):JSON
    removeSaasSync(_id:String):JSON
    saveSyncedSaasConfig(_id:String,config:JSON):JSON
    syncSaasDealsAdd(syncId:String,dealData:JSON): JSON
    syncSaasContact(syncId:String, contactTypeId:String, contactType:String, syncContactId:String):JSON
`;
