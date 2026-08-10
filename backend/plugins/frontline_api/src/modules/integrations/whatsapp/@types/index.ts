import { Document } from 'mongoose';

export interface IWhatsappIntegration {
  kind: string;
  erxesApiId: string;
  phoneNumberId: string;
  whatsappBusinessAccountId?: string;
  displayPhoneNumber?: string;
  accessToken: string;
  appSecret?: string;
  verifyToken?: string;
  defaultCountryCode?: string;
  healthStatus?: string;
  error?: string;
}

export interface IWhatsappIntegrationDocument
  extends IWhatsappIntegration,
    Document {
  _id: string;
}

export interface IWhatsappCustomer {
  waId: string;
  erxesApiId?: string;
  primaryPhone?: string;
  firstName?: string;
  lastName?: string;
  integrationId: string;
}

export interface IWhatsappCustomerDocument
  extends IWhatsappCustomer,
    Document {
  _id: string;
}

export interface IWhatsappConversation {
  erxesApiId?: string;
  timestamp: Date;
  senderId: string;
  recipientId: string;
  integrationId: string;
  content?: string;
  lastCustomerMessageAt?: Date;
}

export interface IWhatsappConversationDocument
  extends IWhatsappConversation,
    Document {
  _id: string;
}

/** Mirrors `attachmentSchema` in erxes-api-shared/core-modules. */
export interface IWhatsappAttachment {
  url: string;
  name: string;
  type: string;
  size?: number;
  duration?: number;
}

export interface IWhatsappConversationMessage {
  mid: string;
  erxesApiMessageId?: string;
  content?: string;
  attachments?: IWhatsappAttachment[];
  conversationId: string;
  customerId?: string;
  userId?: string;
  deliveryStatus?: string;
  deliveryStatusRank?: number;
  errorMessage?: string;
  internal?: boolean;
  /** wamid of the message this one replies to. See the schema definition. */
  replyToMid?: string;
  // from inbox
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWhatsappConversationMessageDocument
  extends IWhatsappConversationMessage,
    Document {
  _id: string;
}

/**
 * The subset of Meta's webhook payload this module consumes.
 * Shape: entry[] -> changes[] -> value -> { messages[] | statuses[] }
 * https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components
 */
/**
 * An error Meta reports against a specific message, either on a `statuses[]`
 * entry that failed or on an inbound `messages[]` entry it could not render.
 * `error_data.details` is the human-readable specific — `title` is only the
 * generic code name, so details is preferred when present.
 * https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/status
 */
export interface IWhatsappWebhookError {
  code?: number;
  title?: string;
  message?: string;
  error_data?: { details?: string };
  href?: string;
}

export interface IWhatsappWebhookMedia {
  id: string;
  mime_type?: string;
  sha256?: string;
  caption?: string;
  filename?: string;
  /** Audio only: true for a voice note, false for an uploaded audio file. */
  voice?: boolean;
  /** Sticker only. */
  animated?: boolean;
}

/** Message types carrying a media id; see MEDIA_MESSAGE_TYPES. */
export type WhatsappMediaMessageType =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'sticker';

/**
 * `type` is deliberately a union of what we handle plus `string`: Meta adds new
 * message types without notice, and an unknown one must fall through to a
 * placeholder rather than fail to compile or be dropped.
 */
export type WhatsappMessageType =
  | WhatsappMediaMessageType
  | 'text'
  | 'location'
  | 'interactive'
  | 'button'
  | 'reaction'
  | (string & {});

export interface IWhatsappWebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: WhatsappMessageType;
  text?: { body: string };
  image?: IWhatsappWebhookMedia;
  video?: IWhatsappWebhookMedia;
  audio?: IWhatsappWebhookMedia;
  document?: IWhatsappWebhookMedia;
  sticker?: IWhatsappWebhookMedia;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  interactive?: {
    type?: string;
    button_reply?: { id?: string; title?: string };
    list_reply?: { id?: string; title?: string; description?: string };
  };
  button?: { text?: string; payload?: string };
  /** `emoji` is omitted when the user REMOVES their reaction. */
  reaction?: { message_id: string; emoji?: string };
  context?: { id?: string; from?: string; forwarded?: boolean };
  /**
   * Present when Meta could not render the inbound message (e.g. 131051 for a
   * type the platform does not support). The message still arrives, so this is
   * what distinguishes "unsupported" from a type we simply do not handle yet.
   * https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/unsupported
   */
  errors?: IWhatsappWebhookError[];
}

export interface IWhatsappWebhookStatus {
  id: string;
  /**
   * `played` fires the first time a voice message is played and is documented
   * alongside sent/delivered/read/failed, so it must not be dropped.
   * https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/status
   */
  status: 'sent' | 'delivered' | 'read' | 'played' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: IWhatsappWebhookError[];
}

export interface IWhatsappWebhookValue {
  messaging_product: string;
  metadata: { display_phone_number?: string; phone_number_id: string };
  contacts?: Array<{ profile?: { name?: string }; wa_id: string }>;
  messages?: IWhatsappWebhookMessage[];
  statuses?: IWhatsappWebhookStatus[];
  /** Account-level problems, reported without any message attached. */
  errors?: IWhatsappWebhookError[];
}

export interface IWhatsappWebhookBody {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{ field?: string; value: IWhatsappWebhookValue }>;
  }>;
}

/**
 * Message templates, as returned by
 * `GET /{WABA_ID}/message_templates` and sent to `/{PHONE_NUMBER_ID}/messages`.
 * https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates
 */

/**
 * Only `APPROVED` templates may actually be sent; the rest are informational.
 * https://developers.facebook.com/docs/graph-api/reference/whats-app-business-account/message_templates/
 */
export type WhatsappTemplateStatus =
  | 'APPROVED'
  | 'IN_APPEAL'
  | 'PENDING'
  | 'REJECTED'
  | 'PENDING_DELETION'
  | 'DELETED'
  | 'DISABLED'
  | 'PAUSED'
  | 'LIMIT_EXCEEDED'
  | 'ARCHIVED'
  | (string & {});

export type WhatsappTemplateCategory =
  | 'UTILITY'
  | 'MARKETING'
  | 'AUTHENTICATION'
  | (string & {});

export type WhatsappTemplateComponentType =
  | 'HEADER'
  | 'BODY'
  | 'FOOTER'
  | 'BUTTONS';

/** A HEADER may carry media instead of text; BODY/FOOTER are always TEXT. */
export type WhatsappTemplateHeaderFormat =
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'DOCUMENT'
  | 'LOCATION'
  | (string & {});

export interface IWhatsappTemplateButton {
  type: string;
  text?: string;
  url?: string;
  phone_number?: string;
}

/**
 * One component of an approved template *definition*.
 *
 * `text` holds the approved copy with positional `{{1}}`, `{{2}}` placeholders;
 * the number of distinct placeholders is what the send call must supply.
 */
export interface IWhatsappTemplateComponent {
  type: WhatsappTemplateComponentType;
  format?: WhatsappTemplateHeaderFormat;
  text?: string;
  buttons?: IWhatsappTemplateButton[];
}

export interface IWhatsappTemplate {
  id: string;
  name: string;
  language: string;
  status: WhatsappTemplateStatus;
  category: WhatsappTemplateCategory;
  components: IWhatsappTemplateComponent[];
}

/**
 * Parameters supplied at SEND time. These are a different shape from the
 * template definition above: positional `{{n}}` placeholders are filled by
 * ARRAY ORDER within each component's `parameters[]`, not by name.
 * https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates
 */
export type IWhatsappTemplateParameter =
  | { type: 'text'; text: string }
  | { type: 'image'; image: { link: string } }
  | { type: 'video'; video: { link: string } }
  | { type: 'document'; document: { link: string; filename?: string } }
  | { type: 'payload'; payload: string }
  /**
   * `amount_1000` is the amount multiplied by 1000 (so $230.99 is 230990);
   * `fallback_value` is shown when the client cannot localise.
   */
  | {
      type: 'currency';
      currency: { fallback_value: string; code: string; amount_1000: number };
    }
  | { type: 'date_time'; date_time: { fallback_value: string } };

export interface IWhatsappTemplateSendComponent {
  type: 'header' | 'body' | 'button';
  /**
   * Required for buttons only; identifies which button the payload targets.
   * https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/components/
   */
  sub_type?: 'quick_reply' | 'url' | 'copy_code' | 'flow' | 'catalog' | 'mpm';
  /** Zero-based button position, sent as a STRING (`"0"`), not a number. */
  index?: string;
  parameters: IWhatsappTemplateParameter[];
}

/**
 * The template payload the inbox dispatches on `extraInfo.whatsappTemplate`.
 *
 * Deliberately mirrors the Cloud API's own `template` object so the handler
 * forwards it rather than translating a bespoke shape, which keeps the
 * positional-parameter contract in one place — the caller that knows the
 * template it picked.
 */
export interface IWhatsappTemplateDispatch {
  name: string;
  languageCode: string;
  components?: IWhatsappTemplateSendComponent[];
}
