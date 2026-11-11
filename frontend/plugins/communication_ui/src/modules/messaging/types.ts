import type {
  CommunicationMessagingAdminAppListQuery,
  CommunicationMessagingAdminConversationDetailQuery,
  CommunicationMessagingAdminConversationListQuery,
  CommunicationMessagingAdminMessageListQuery,
  CommunicationMessagingAdminParticipantListQuery,
  CommunicationMessagingKind,
} from '~/gql/graphql';

export type MessagingKind = CommunicationMessagingKind;

export type AdminApp =
  CommunicationMessagingAdminAppListQuery['communicationMessagingAdminApps'][number];

export type AdminConversationItem =
  CommunicationMessagingAdminConversationListQuery['communicationMessagingAdminConversations']['items'][number];

export type AdminConversation =
  CommunicationMessagingAdminConversationDetailQuery['communicationMessagingAdminConversation'];

export type AdminMessage =
  CommunicationMessagingAdminMessageListQuery['communicationMessagingAdminMessages']['items'][number];

export type AdminAttachment = AdminMessage['attachments'][number];

export type AdminParticipant =
  CommunicationMessagingAdminParticipantListQuery['communicationMessagingAdminParticipants'][number];

export type SelectedConversation = { appKey: string; id: string };
