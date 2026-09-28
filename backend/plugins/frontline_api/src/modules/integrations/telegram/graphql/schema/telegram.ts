export const types = `
    type TelegramTokenValidation {
    valid: Boolean!
    botId: String
    botUsername: String
    botName: String
    canJoinGroups: Boolean
    canReadAllGroupMessages: Boolean
    error: String
    }
`;

export const queries = `
telegramValidateToken(token: String!): TelegramTokenValidation!
`;
