import {
  attachmentType,
  attachmentInput,
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
        workhours:JSON
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
        userCount: Int
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
        status:String

        address: String
        radius: Int
        hasChildren:Boolean
        workhours:JSON
        ${commonContactInfoTypes}
    }

    type Position @key(fields: "_id") @cacheControl(maxAge: 3){
        _id: String!
        title: String
        code: String
        order: String
        parentId: String
        parent: Position
        status: String
        children: [Position]
        users: [User]
        userIds: [String]
        userCount: Int
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
    
    type PositionListQueryResponse {
        list:[Position]
        totalCount: Int
        totalUsersCount:Int
    }
`;

const commonParams = `
    ids: [String]
    excludeIds: Boolean
    perPage: Int
    page: Int
    searchValue: String,
    status: String,
    onlyFirstLevel: Boolean,
    parentId: String
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
    
    positions(${commonParams},withoutUserFilter:Boolean): [Position]
    positionsMain(${commonParams}): PositionListQueryResponse
    positionDetail(_id: String): Position

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
    workhours: JSON
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
    workhours: JSON
    ${commonContactInfoParams}
`;

const commonPositionParams = `
    title: String
    code: String
    parentId: String
    userIds: [String]
    status: String
`;

export const mutations = `
    structuresAdd(${commonStructureParams}): Structure
    structuresEdit(_id: String!,${commonStructureParams}): Structure
    structuresRemove(_id: String!): JSON

    departmentsAdd(${commonDepartmentParams}): Department
    departmentsEdit(_id: String!,${commonDepartmentParams}): Department
    departmentsRemove(ids: [String!]): JSON

    unitsAdd(${commonUnitParams}): Unit
    unitsEdit(_id: String!, ${commonUnitParams}): Unit
    unitsRemove(ids:[String!]): JSON

    branchesAdd(${commonBranchParams}): Branch
    branchesEdit(_id: String!, ${commonBranchParams}): Branch
    branchesRemove(ids:[String!]): JSON

    positionsAdd(${commonPositionParams}):Position
    positionsEdit(_id: String!, ${commonPositionParams}):Position
    positionsRemove(ids:[String!]): JSON
`;
