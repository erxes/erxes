const commonTypes = `
        name: String
        description: String
        code: String
        parentId: String
        teamMemberIds:[String]
`;

const commonParams = `
     perPage: Int
     page: Int
     searchValue: String
`;

export const types = `
    type Operation  {
        _id: String,
        ${commonTypes}
        order:String
        createdAt: Date
        modifiedAt: Date
    }

    input IOperation {
        ${commonTypes}
    }


`;

export const queries = `
    operations(${commonParams}):[Operation]
    operation:Operation
    operationsTotalCount(${commonParams}):Int
`;

export const mutations = `
    addOperation(${commonTypes}):JSON
    updateOperation(_id:String,order:String,${commonTypes}):JSON
    removeOperation(ids:[String]):JSON
`;
