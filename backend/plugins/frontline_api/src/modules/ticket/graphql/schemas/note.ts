export const types = `
    type TicketNoteClientPortalAuthor {
        _id: String
        fullName: String
        email: String
        avatar: String
    }

    type Note {
        _id: String
        content: String
        contentId: String
        createdBy: String
        mentions: [String]
        statusId: String
        """
        "note" for internal team notes, "comment" for the thread the ticket
        requester reads and answers in the client portal.
        """
        type: String
        """
        Set only when the note was written by a client portal user.
        """
        clientPortalAuthor: TicketNoteClientPortalAuthor

        createdAt: Date
        updatedAt: Date
    }
`;

const createNoteParams = `
    content: String
    contentId: String
    mentions: [String]
    type: String
`;

const updateNoteParams = `
    _id: String!
    content: String
    contentId: String
    mentions: [String]
`;

export const queries = `
    ticketGetNote(_id: String!): Note
    ticketGetNotes(contentId: String!, type: String): [Note]
    cpTicketGetNotes(ticketId: String!): [Note]
`;

export const mutations = `
    ticketCreateNote(${createNoteParams}): Note
    ticketUpdateNote(${updateNoteParams}): Note
    ticketDeleteNote(_id: String!): JSON

    cpTicketCreateNote(content: String,contentId: String): Note
`;
