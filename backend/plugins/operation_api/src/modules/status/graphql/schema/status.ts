export const types = `
    type Status {
        _id: String!
        name: String!
        teamId: String!
        description: String
        color: String,
        order: Int
        type: Int
        createdAt: Date
        updatedAt: Date
    }

    input StatusInput {
        _id: String
        name: String!
        teamId: String!
        description: String
        color: String
        type: Int
        order: Int
    }
`;

export const queries = `
   getStatus(_id: String!): Status
   getStatusesChoicesByTeam(teamId: String!): JSON
   getStatusesByType(type: Int!, teamId: String!): [Status]
`;

export const mutations = `
    addStatus(name: String!, teamId: String!, description: String, color: String, order: Int, type: Int): Status
    updateStatus(_id: String!, name: String, description: String, color: String, order: Int, type: Int): Status
    deleteStatus(_id: String!): JSON
`;
