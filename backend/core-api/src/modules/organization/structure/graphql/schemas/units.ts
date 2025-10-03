import { commonParams } from './commonTypeDefs';

const commonUnitParams = `
    title: String
    description: String
    supervisorId: String
    code: String
    departmentId: String
    userIds: [String]
`;
export const UnitTypes = `
    type Unit @key(fields: "_id") @cacheControl(maxAge: 3) {
        _id: String!
        title: String
        departmentId: String
        supervisorId: String
        supervisor: User
        code: String
        description: String
        department: Department
        users: [User]
        userCount: Int
        userIds: [String]
    }

    type UnitListQueryResponse {
        list:[Unit]
        totalCount: Int
        pageInfo: PageInfo
    }
    
`;
export const mutations = `
    unitsAdd(${commonUnitParams}): Unit
    unitsEdit(_id: String!, ${commonUnitParams}): Unit
    unitsRemove(ids:[String!]): JSON
`;

export const queries = `
    units(searchValue: String): [Unit]
    unitsMain(${commonParams}): UnitListQueryResponse
    unitDetail(_id: String!): Unit
`;
