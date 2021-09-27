export const types = `
    type Department {
        _id: String!
        title: String
        description: String
        parentId: String
        parent: Department
        children: [Department]
        users: [User]
        userIds: [String]
    }

    type Unit {
        _id: String!
        title: String
        departmentId: String
        supervisorId: String
        description: String
        department: Department
        users: [User]
        userIds: [String]
    }
`;

export const queries = `
    departments(parentId: String): [Department]
    departmentDetail(_id: String!): Department

    units: [Unit]
    unitDetail(_id: String!): Unit
`;

const commonDepartmentParams = `
    title: String
    description: String
    parentId: String
    userIds: [String]
`;

const commonUnitParams = `
    title: String
    description: String
    supervisorId: String
    departmentId: String
    userIds: [String]
`;

export const mutations = `
    departmentsAdd(${commonDepartmentParams}): Department
    departmentsEdit(_id: String!, ${commonDepartmentParams}): Department
    departmentsRemove(_id: String!): JSON

    unitsAdd(${commonUnitParams}): Unit
    unitsEdit(_id: String!, ${commonUnitParams}): Unit
    unitsRemove(_id: String!): JSON
`;
