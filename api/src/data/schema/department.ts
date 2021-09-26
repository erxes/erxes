export const types = `
    type Department {
        _id: String!
        title: String
        description: String
        parentId: String
        users: [User]
        userIds: [String]
    }
`;

export const queries = `
    departments(parentId: String): [Department]
    departmentDetail(_id: String!): Department
`;

const commonParams = `
    title: String
    description: String
    parentId: String
    userIds: [String]
`;

export const mutations = `
    departmentsAdd(${commonParams}): Department
    departmentsEdit(_id: String!, ${commonParams}): Department
    departmentsRemove(_id: String!): JSON
`;
