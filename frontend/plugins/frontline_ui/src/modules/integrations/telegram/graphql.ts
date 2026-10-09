import { gql } from '@apollo/client';

export const TELEGRAM_BOT_FIELDS = gql`
  fragment frontlineTelegramBotFields on TelegramBot {
    _id
    botId
    erxesApiId
    botUsername
    botName
    canJoinGroups
    canReadAllGroupMessages
    lastVerifiedAt
  }
`;
export const TELEGRAM_BOTS = gql`
  query frontlineTelegramSetupBots {
    telegramBots {
      ...frontlineTelegramBotFields
    }
  }
  ${TELEGRAM_BOT_FIELDS}
`;
export const TELEGRAM_ADD_BOT = gql`
  mutation frontlineTelegramSetupAddBot($token: String!) {
    telegramAddBot(token: $token) {
      ...frontlineTelegramBotFields
    }
  }
  ${TELEGRAM_BOT_FIELDS}
`;
export const TELEGRAM_UPDATE_BOT = gql`
  mutation frontlineTelegramSetupUpdateBot($_id: String!, $token: String) {
    telegramUpdateBot(_id: $_id, token: $token) {
      ...frontlineTelegramBotFields
    }
  }
  ${TELEGRAM_BOT_FIELDS}
`;
export const TELEGRAM_SET_WEBHOOK = gql`
  mutation frontlineTelegramSetupRegisterWebhook($_id: String!, $url: String!) {
    telegramSetWebhook(_id: $_id, url: $url)
  }
`;
export const TELEGRAM_DISCONNECT = gql`
  mutation frontlineTelegramSetupDisconnect($_id: String!) {
    telegramDisconnectBot(_id: $_id)
  }
`;
export const TELEGRAM_WEBHOOK_INFO = gql`
  query frontlineTelegramSetupWebhookInfo($_id: String!) {
    telegramBotWebhookInfo(_id: $_id) {
      url
      pendingUpdateCount
      lastErrorDate
      lastErrorMessage
      allowedUpdates
    }
  }
`;
export const TELEGRAM_CHATS = gql`
  query frontlineTelegramConversationChats($conversationIds: [String!]!) {
    telegramConversationChats(conversationIds: $conversationIds) {
      conversationId
      chatId
      chatType
      chatTitle
      messageThreadId
      topicName
    }
  }
`;

export interface TelegramBot {
  _id: string;
  botId: string;
  erxesApiId?: string;
  botUsername?: string;
  botName: string;
  canJoinGroups?: boolean;
  canReadAllGroupMessages?: boolean;
  lastVerifiedAt: string;
}
export interface TelegramWebhookInfo {
  url: string;
  pendingUpdateCount: number;
  lastErrorDate?: string;
  lastErrorMessage?: string;
  allowedUpdates?: string[];
}
export interface TelegramChat {
  conversationId: string;
  chatId: string;
  chatType: string;
  chatTitle?: string;
  messageThreadId: number;
  topicName?: string;
}

export const TELEGRAM_CHAT_MESSAGE_INSERTED = gql`
  subscription frontlineTelegramChatMessageInserted($userId: String!) {
    conversationClientMessageInserted(userId: $userId) {
      conversationId
    }
  }
`;
