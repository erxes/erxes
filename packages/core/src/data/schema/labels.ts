export const types = `
    type ContactLabel {
        name: String!
        forType: String!
        type: String
    }
`;

export const queries = `
    contactLabels(forType: String!, userId: String): [ContactLabel]
`;

const mutationParams = `
    name: String!
    forType: String!
`;

export const mutations = `
    saveContactLabel(${mutationParams}): ContactLabel 
    removeContactLabel(name: String!): ContactLabel
`;
