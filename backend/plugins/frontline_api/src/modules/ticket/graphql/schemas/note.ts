export const types = `
    type TicketNote {
        _id: String
        content: String
        contentId: String
        createdBy: String
        mentions: [String]
        attachments: [Attachment]
        isInternal: Boolean
        statusId: String
        mailMessageId: String

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
    ticketGetNote(_id: String!): TicketNote
    ticketGetNotes(contentId: String!, isInternal: Boolean): [TicketNote]
    cpTicketGetNotes(ticketId: String!): [TicketNote]
`;

export const mutations = `
    ticketCreateNote(${createNoteParams}): TicketNote
    ticketUpdateNote(${updateNoteParams}): TicketNote
    ticketDeleteNote(_id: String!): JSON

    cpTicketCreateNote(content: String, contentId: String): TicketNote
`;
