import type { IAttachment } from 'erxes-ui';
import type { ICustomerInline } from 'ui-modules';
import type { z } from 'zod';
import type {
  MESSAGE_DELIVERY_STATUS_SCHEMA,
  MESSAGE_EMBED_SCHEMA,
  MESSAGE_EXTRA_DATA_SCHEMA,
  MESSAGE_KIND_SCHEMA,
  MESSAGE_POLL_SCHEMA,
  MESSAGE_PROVIDER_DATA_SCHEMA,
  MESSAGE_REACTION_SCHEMA,
  MESSAGE_REPLY_TO_SCHEMA,
  MESSAGE_STICKER_SCHEMA,
  MESSAGE_SURVEY_SCHEMA,
  MESSAGE_SURVEY_STEP_SCHEMA,
  TELEGRAM_MESSAGE_DATA_SCHEMA,
} from '@/inbox/types/messageSchema';
import type {
  ConversationDetailQuery,
  ConversationMemberProgressQuery,
  ConversationsQuery,
  IntegrationInlineQuery,
} from '~/gql/graphql';

export type IConversation = NonNullable<
  NonNullable<NonNullable<ConversationsQuery['conversations']>['list']>[number]
>;

export type IConversationDetail = NonNullable<
  ConversationDetailQuery['conversationDetail']
>;

export type IConversationIntegration = NonNullable<
  IConversation['integration']
>;

/** The detail page loads the integration through `IntegrationInline`, so only its fields are guaranteed. */
export type IConversationContextIntegration = NonNullable<
  IntegrationInlineQuery['integrationDetail']
> &
  Partial<IConversationIntegration>;

type IConversationContextFields = Partial<
  Omit<IConversation, 'customer' | 'integration' | 'tagIds'>
> &
  Partial<Omit<IConversationDetail, 'customer' | 'integration' | 'tagIds'>>;

/** A list row, a conversation detail, or both merged, as the conversation context holds them. */
// The detail adds every email so staff can spot customers sharing one.
export type IConversationCustomer = ICustomerInline & { emails?: string[] };

export type IConversationContextValue = IConversationContextFields & {
  _id: string;
  customer?: IConversationCustomer;
  integration?: IConversationContextIntegration;
  loading?: boolean;
};

export type IConversationMemberProgress = NonNullable<
  NonNullable<
    ConversationMemberProgressQuery['conversationMemberProgress']
  >[number]
>;

export type IMessagePoll = z.output<typeof MESSAGE_POLL_SCHEMA>;
export type IMessageSurvey = z.output<typeof MESSAGE_SURVEY_SCHEMA>;
export type IMessageSurveyStep = z.output<typeof MESSAGE_SURVEY_STEP_SCHEMA>;
export type IMessageEmbed = z.output<typeof MESSAGE_EMBED_SCHEMA>;
export type IMessageSticker = z.output<typeof MESSAGE_STICKER_SCHEMA>;
export type IMessageReaction = z.output<typeof MESSAGE_REACTION_SCHEMA>;
export type ITelegramMessageData = z.output<
  typeof TELEGRAM_MESSAGE_DATA_SCHEMA
>;
export type IMessageExtraData = NonNullable<
  z.output<typeof MESSAGE_EXTRA_DATA_SCHEMA>
>;
export type IMessageForwardedSnapshot = NonNullable<
  IMessageExtraData['forwardedSnapshot']
>;
export type MessageKind = NonNullable<z.output<typeof MESSAGE_KIND_SCHEMA>>;
export type IMessageProviderData = NonNullable<
  z.output<typeof MESSAGE_PROVIDER_DATA_SCHEMA>
>;
export type IMessageReplyTo = NonNullable<
  z.output<typeof MESSAGE_REPLY_TO_SCHEMA>
>;
export type MessageDeliveryStatus = NonNullable<
  z.output<typeof MESSAGE_DELIVERY_STATUS_SCHEMA>
>;

/** A message as `toMessage` hands it to the renderers: nulls are undefined and JSON is parsed. */
export type IMessage = {
  contentType?: string;
  _id: string;
  mid?: string;
  conversationId?: string;
  userId?: string;
  customerId?: string;
  content: string;
  createdAt: string;
  attachments?: IAttachment[];
  formWidgetData?: unknown;
  extraData?: IMessageExtraData;
  internal?: boolean;
  botData?: unknown[];
  fromBot?: boolean;
  messageKind?: MessageKind;
  providerData?: IMessageProviderData;
  replyTo?: IMessageReplyTo;
  reactions?: IMessageReaction[];
  deliveryStatus?: MessageDeliveryStatus;
  expiresAt?: string;
};

export enum ConversationStatus {
  NEW = '',
  OPEN = 'open',
  CLOSED = 'closed',
}
