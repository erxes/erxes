export const types = `
    input ForumDoc {
        title: String
        description: String
    }
`;

export const queries = `
    forums: JSON
`;

export const mutations = `
    forumsAdd(doc: ForumDoc!): JSON
`;
