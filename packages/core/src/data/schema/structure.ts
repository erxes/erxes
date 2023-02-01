import {
  attachmentType,
  attachmentInput
} from '@erxes/api-utils/src/commonTypeDefs';
const commonContactInfoTypes = `

    phoneNumber: String
    email: String
    links: JSON
    coordinate: Coordinate
    image: Attachment
`;

export const types = `
    ${attachmentType}
    ${attachmentInput}

    type Structure {
        _id: String!
        title: String
        supervisor: User
        description: String
        supervisorId: String
        code: String

        ${commonContactInfoTypes}
    }

    type Department @key(fields: "_id") @cacheControl(maxAge: 3) {
        _id: String!
        title: String
        description: String
        parentId: String
        supervisorId: String
        supervisor: User
        code: String
        order:String
        parent: Department
        children: [Department]
        childCount: Int
        users: [User]
        userCount: Int
        userIds: [String]
    }

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
        userIds: [String]
    }

    type Branch @key(fields: "_id") @cacheControl(maxAge: 3){
        _id: String!
        title: String
        parentId: String
        supervisorId: String
        supervisor: User
        code: String
        order:String
        users: [User]
        userIds: [String]
        userCount: Int
        parent: Branch
        children: [Branch]

        address: String
        radius: Int
        ${commonContactInfoTypes}
    }

    type Coordinate {
        longitude: String
        latitude: String
    }

    input CoordinateInput {
        longitude: String
        latitude: String
    }

    type BranchListQueryResponse {
        list:[Branch]
        totalCount: Int
        totalUsersCount:Int
    }

    type DepartmentListQueryResponse {
        list:[Department]
        totalCount: Int
        totalUsersCount:Int
    }
        type UnitListQueryResponse {
        list:[Unit]
        totalCount: Int
        totalUsersCount:Int
    }

`;

const commonParams = `
    perPage:Int
    page:Int
    searchValue: String,
    status:String,
`;

export const queries = `
    departments(${commonParams},withoutUserFilter:Boolean): [Department]
    departmentsMain(${commonParams},withoutUserFilter:Boolean):DepartmentListQueryResponse
    departmentDetail(_id: String!): Department

    noDepartmentUsers(excludeId: String): [User]

    units(searchValue: String): [Unit]
    unitsMain(${commonParams}): UnitListQueryResponse
    unitDetail(_id: String!): Unit

    branches(${commonParams},withoutUserFilter:Boolean): [Branch]
    branchesMain(${commonParams},withoutUserFilter:Boolean): BranchListQueryResponse
    branchDetail(_id: String!): Branch

    structureDetail: Structure
`;

const commonContactInfoParams = `
    phoneNumber: String
    email: String
    links: JSON
    coordinate: CoordinateInput
    image: AttachmentInput
`;

const commonStructureParams = `
    title: String!
    description: String
    supervisorId: String
    code: String
    website: String

    ${commonContactInfoParams}
`;

const commonDepartmentParams = `
    title: String
    description: String
    supervisorId: String
    code: String
    parentId: String
    userIds: [String]
`;

const commonUnitParams = `
    title: String
    description: String
    supervisorId: String
    code: String
    departmentId: String
    userIds: [String]
`;

const commonBranchParams = `
    title: String
    address: String
    supervisorId: String
    code: String
    parentId: String
    userIds: [String]
    radius: Int

    ${commonContactInfoParams}
`;

export const mutations = `
    structuresAdd(${commonStructureParams}): Structure
    structuresEdit(_id: String!, ${commonStructureParams}): Structure
    structuresRemove(_id: String!): JSON

    departmentsAdd(${commonDepartmentParams}): Department
    departmentsEdit(_id: String!, ${commonDepartmentParams}): Department
    departmentsRemove(ids: [String!]): JSON

    unitsAdd(${commonUnitParams}): Unit
    unitsEdit(_id: String!, ${commonUnitParams}): Unit
    unitsRemove(ids:[String!]): JSON

    branchesAdd(${commonBranchParams}): Branch
    branchesEdit(_id: String!, ${commonBranchParams}): Branch
    branchesRemove(ids:[String!]): JSON
`;
