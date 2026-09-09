export const types = `
    type Note {
        _id: String
        content: String
        contentId: String
        createdBy: String
        mentions: [String]
        attachments: [Attachment]
        isInternal: Boolean
        statusId: String

        createdAt: String
        updatedAt: String
    }
`;

const createNoteParams = `
    content: String
    contentId: String
    mentions: [String]
    attachments: [AttachmentInput]
    isInternal: Boolean
`;

const updateNoteParams = `
    _id: String!
    content: String
    contentId: String
    mentions: [String]
    attachments: [AttachmentInput]
    isInternal: Boolean
`;

export const queries = `
    ticketGetNote(_id: String!): Note
    cpTicketGetNotes(ticketId: String!): [Note]
`;

export const mutations = `
    ticketCreateNote(${createNoteParams}): Note
    ticketUpdateNote(${updateNoteParams}): Note
    ticketDeleteNote(_id: String!): JSON

    cpTicketCreateNote(content: String,contentId: String): Note
`;
