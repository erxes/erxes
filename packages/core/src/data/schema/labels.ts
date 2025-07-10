export const types = `
    type Label {
        name: String!
        forType: String!
        type: String
    }
`;

export const queries = `
    labels(forType: String!, userId: String): [Label]
`;

const mutationParams = `
    name: String!
    forType: String!
`;

export const mutations = `
    saveLabel(${mutationParams}): Label
    removeLabel(name: String!): Label
`;
