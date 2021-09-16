export const types = `
    type Department {
        _id: String!
        title: String
        description: String
        users: [User]
        userIds: [String]
    }

    type DepartmentListResponse {
        list: [Department]
        totalCount: Int
    }
`;

export const queries = `
    departments(perPage: Int, page: Int): DepartmentListResponse
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