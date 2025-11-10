export const types = `
    type Note {
        _id: String
        content: String
        contentId: String
        createdBy: String
        mentions: [String]

        createdAt: String
        updatedAt: String
    }
`;

const createNoteParams = `
    content: String
    contentId: String
    mentions: [String]
`;

const updateNoteParams = `
    _id: String!
    content: String
    contentId: String
    mentions: [String]
`;

export const queries = `
    getNote(_id: String!): Note
`;

export const mutations = `
    createNote(${createNoteParams}): Note
    updateNote(${updateNoteParams}): Note
    deleteNote(_id: String!): JSON
`;
