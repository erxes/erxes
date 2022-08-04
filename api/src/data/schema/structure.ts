const commonContactInfoTypes = `
    phoneNumber: String
    email: String
    links: JSON
    coordinate: Coordinate
    image: Attachment
`;

export const types = `
    type Structure {
        _id: String!
        title: String
        supervisor: User
        description: String
        supervisorId: String
        code: String
        
        ${commonContactInfoTypes}
    }
    
    type Department {
        _id: String!
        title: String
        description: String
        parentId: String
        supervisorId: String
        supervisor: User
        code: String
        parent: Department
        children: [Department]
        childCount: Int
        users: [User]
        userCount: Int
        userIds: [String]
    }

    type Unit {
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

    type Branch {
        _id: String!
        title: String
        parentId: String
        supervisorId: String
        supervisor: User
        code: String
        users: [User]
        userIds: [String]
        parent: Branch
        children: [Branch]
        
        address: String
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
`;

export const queries = `
    departments(searchValue: String): [Department]
    departmentDetail(_id: String!): Department

    noDepartmentUsers(excludeId: String): [User]

    units(searchValue: String): [Unit]
    unitDetail(_id: String!): Unit

    branches(searchValue: String): [Branch]
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

    ${commonContactInfoParams}
`;

export const mutations = `
    structuresAdd(${commonStructureParams}): Structure
    structuresEdit(_id: String!, ${commonStructureParams}): Structure
    structuresRemove(_id: String!): JSON
    
    departmentsAdd(${commonDepartmentParams}): Department
    departmentsEdit(_id: String!, ${commonDepartmentParams}): Department
    departmentsRemove(_id: String!): JSON

    unitsAdd(${commonUnitParams}): Unit
    unitsEdit(_id: String!, ${commonUnitParams}): Unit
    unitsRemove(_id: String!): JSON

    branchesAdd(${commonBranchParams}): Branch
    branchesEdit(_id: String!, ${commonBranchParams}): Branch
    branchesRemove(_id: String!): JSON
`;
