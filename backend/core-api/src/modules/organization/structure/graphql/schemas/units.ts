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

    type CPUnitUserDetails {
        avatar: String
        fullName: String
        shortName: String
        position: String
    }

    type CPUnitUser {
        _id: String
        username: String
        email: String
        details: CPUnitUserDetails
    }

    type CPUnitDepartment {
        _id: String
        title: String
        code: String
        description: String
    }

    type CPUnit @cacheControl(maxAge: 3) {
        _id: String!
        title: String
        code: String
        description: String
        department: CPUnitDepartment
        users: [CPUnitUser]
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

    cpUnits(searchValue: String): [CPUnit]
`;
