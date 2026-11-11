import { createGenerateModels, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export interface MessagingIdentity {
  _id: string;
  tenant: string;
  appId: string;
  issuer: string;
  subject: string;
  displayName: string;
  active: boolean;
  eventSequence: number;
  deviceRevision: number;
}

const identitySchema = schemaWrapper(
  new Schema<MessagingIdentity>({
    tenant: { type: String, required: true, immutable: true },
    appId: { type: String, required: true, immutable: true },
    issuer: { type: String, required: true, immutable: true },
    subject: { type: String, required: true, immutable: true },
    displayName: { type: String, required: true },
    active: { type: Boolean, default: true },
    eventSequence: { type: Number, default: 0 },
    deviceRevision: { type: Number, default: 0 },
  }),
);

identitySchema.index(
  { tenant: 1, appId: 1, issuer: 1, subject: 1 },
  { unique: true },
);
identitySchema.index({ tenant: 1, appId: 1, active: 1, _id: 1 });

export type ConversationKind = 'DIRECT' | 'GROUP';
export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface MessagingConversation {
  _id: string;
  tenant: string;
  appId: string;
  kind: ConversationKind;
  directPair?: string;
  title?: string;
  lastSequence: number;
  revision: number;
  lastActivityAt: Date;
}

export interface MessagingMembership {
  _id: string;
  tenant: string;
  appId: string;
  conversationId: string;
  memberId: string;
  kind: ConversationKind;
  role: MemberRole;
  active: boolean;
  joinedSequence: number;
  lastReadSequence: number;
  unreadCount: number;
  lastActivityAt: Date;
  preference: 'ALL' | 'MENTIONS' | 'NONE';
  typingUntil?: Date;
}

export interface MessagingMessage {
  _id: string;
  tenant: string;
  appId: string;
  conversationId: string;
  senderId: string;
  clientMessageId: string;
  sequence: number;
  text: string;
  attachmentIds: string[];
  mentionMemberIds: string[];
  createdAt: Date;
}

const scopeFields = {
  tenant: { type: String, required: true, immutable: true },
  appId: { type: String, required: true, immutable: true },
} as const;

const conversationSchema = schemaWrapper(
  new Schema<MessagingConversation>({
    ...scopeFields,
    kind: {
      type: String,
      enum: ['DIRECT', 'GROUP'],
      required: true,
      immutable: true,
    },
    directPair: { type: String, immutable: true },
    title: String,
    lastSequence: { type: Number, default: 0 },
    revision: { type: Number, default: 0 },
    lastActivityAt: { type: Date, required: true },
  }),
);

// Staff oversight lists an app's conversations by recent activity.
conversationSchema.index({ tenant: 1, appId: 1, lastActivityAt: -1, _id: -1 });
conversationSchema.index(
  { tenant: 1, appId: 1, directPair: 1 },
  {
    unique: true,
    partialFilterExpression: { kind: 'DIRECT' },
  },
);

const membershipSchema = schemaWrapper(
  new Schema<MessagingMembership>({
    ...scopeFields,
    conversationId: { type: String, required: true, immutable: true },
    memberId: { type: String, required: true, immutable: true },
    kind: {
      type: String,
      enum: ['DIRECT', 'GROUP'],
      required: true,
      immutable: true,
    },
    role: { type: String, enum: ['OWNER', 'ADMIN', 'MEMBER'], required: true },
    active: { type: Boolean, default: true },
    joinedSequence: { type: Number, required: true },
    lastReadSequence: { type: Number, required: true },
    unreadCount: { type: Number, default: 0 },
    lastActivityAt: { type: Date, required: true },
    typingUntil: Date,
    preference: {
      type: String,
      enum: ['ALL', 'MENTIONS', 'NONE'],
      default: 'ALL',
    },
  }),
);

membershipSchema.index(
  { tenant: 1, appId: 1, conversationId: 1, memberId: 1 },
  { unique: true },
);
membershipSchema.index({
  tenant: 1,
  appId: 1,
  memberId: 1,
  active: 1,
  lastActivityAt: -1,
  conversationId: -1,
});

const messageSchema = schemaWrapper(
  new Schema<MessagingMessage>({
    ...scopeFields,
    conversationId: { type: String, required: true, immutable: true },
    senderId: { type: String, required: true, immutable: true },
    clientMessageId: { type: String, required: true, immutable: true },
    sequence: { type: Number, required: true, immutable: true },
    text: { type: String, default: '', maxlength: 8000 },
    attachmentIds: [String],
    mentionMemberIds: [String],
    createdAt: { type: Date, required: true },
  }),
);

messageSchema.index(
  { tenant: 1, appId: 1, conversationId: 1, sequence: 1 },
  { unique: true },
);
messageSchema.index(
  { tenant: 1, appId: 1, conversationId: 1, senderId: 1, clientMessageId: 1 },
  { unique: true },
);

export interface MessagingEvent {
  _id: string;
  tenant: string;
  appId: string;
  memberId: string;
  sequence: number;
  conversationId: string;
  kind: 'MESSAGE' | 'CHANGED' | 'READ';
  messageId?: string;
  expiresAt: Date;
  leaseUntil: Date;
  dispatchedAt?: Date;
}

const eventSchema = schemaWrapper(
  new Schema<MessagingEvent>({
    ...scopeFields,
    memberId: { type: String, required: true },
    sequence: { type: Number, required: true },
    conversationId: { type: String, required: true },
    kind: {
      type: String,
      enum: ['MESSAGE', 'CHANGED', 'READ'],
      required: true,
    },
    messageId: String,
    expiresAt: { type: Date, required: true },
    leaseUntil: { type: Date, default: () => new Date(0) },
    dispatchedAt: Date,
  }),
);
eventSchema.index(
  { tenant: 1, appId: 1, memberId: 1, sequence: 1 },
  { unique: true },
);
eventSchema.index({ tenant: 1, appId: 1, dispatchedAt: 1, leaseUntil: 1 });
eventSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export interface MessagingAttachment {
  _id: string;
  tenant: string;
  appId: string;
  conversationId: string;
  ownerId: string;
  name: string;
  mimeType: string;
  size: number;
  state: 'PENDING' | 'UPLOADING' | 'READY' | 'BOUND';
  objectKey: string;
  expiresAt: Date;
}

const attachmentSchema = schemaWrapper(
  new Schema<MessagingAttachment>({
    ...scopeFields,
    conversationId: { type: String, required: true },
    ownerId: { type: String, required: true },
    name: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    state: {
      type: String,
      enum: ['PENDING', 'UPLOADING', 'READY', 'BOUND'],
      default: 'PENDING',
    },
    objectKey: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  }),
);
attachmentSchema.index({ tenant: 1, appId: 1, expiresAt: 1, state: 1 });

export interface MessagingDevice {
  _id: string;
  tenant: string;
  appId: string;
  memberId: string;
  installationId: string;
  platform: 'IOS' | 'ANDROID';
  token: string;
  tokenHash: string;
  generation: string;
  active: boolean;
}

export interface MessagingDelivery {
  _id: string;
  tenant: string;
  appId: string;
  memberId: string;
  eventId: string;
  conversationId: string;
  messageId: string;
  installationId: string;
  state: 'PENDING' | 'SENT' | 'SKIPPED' | 'FAILED';
  attempts: number;
  dueAt: Date;
  leaseUntil: Date;
  leaseId?: string;
  expiresAt: Date;
}

const deviceSchema = schemaWrapper(
  new Schema<MessagingDevice>({
    ...scopeFields,
    memberId: { type: String, required: true },
    installationId: { type: String, required: true },
    platform: { type: String, enum: ['IOS', 'ANDROID'], required: true },
    token: { type: String, required: true },
    tokenHash: { type: String, required: true },
    generation: { type: String, required: true },
    active: { type: Boolean, default: true },
  }),
);
deviceSchema.index({
  tenant: 1,
  appId: 1,
  memberId: 1,
  installationId: 1,
  active: 1,
});
deviceSchema.index({ tenant: 1, appId: 1, tokenHash: 1 }, { unique: true });

const deliverySchema = schemaWrapper(
  new Schema<MessagingDelivery>({
    ...scopeFields,
    memberId: { type: String, required: true },
    eventId: { type: String, required: true },
    conversationId: { type: String, required: true },
    messageId: { type: String, required: true },
    installationId: { type: String, required: true },
    state: {
      type: String,
      enum: ['PENDING', 'SENT', 'SKIPPED', 'FAILED'],
      default: 'PENDING',
    },
    attempts: { type: Number, default: 0 },
    dueAt: { type: Date, default: Date.now },
    leaseUntil: { type: Date, default: () => new Date(0) },
    leaseId: String,
    expiresAt: { type: Date, required: true },
  }),
);
deliverySchema.index(
  { tenant: 1, appId: 1, eventId: 1, memberId: 1, installationId: 1 },
  { unique: true },
);
deliverySchema.index({
  tenant: 1,
  appId: 1,
  state: 1,
  dueAt: 1,
  leaseUntil: 1,
});
deliverySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const configureMessagingModels = () =>
  createGenerateModels((db) => ({
    Devices: db.model<MessagingDevice>(
      'communication_messaging_devices',
      deviceSchema,
    ),
    Deliveries: db.model<MessagingDelivery>(
      'communication_messaging_deliveries',
      deliverySchema,
    ),
    Attachments: db.model<MessagingAttachment>(
      'communication_messaging_attachments',
      attachmentSchema,
    ),
    Events: db.model<MessagingEvent>(
      'communication_messaging_events',
      eventSchema,
    ),
    Conversations: db.model<MessagingConversation>(
      'communication_messaging_conversations',
      conversationSchema,
    ),
    Memberships: db.model<MessagingMembership>(
      'communication_messaging_memberships',
      membershipSchema,
    ),
    Messages: db.model<MessagingMessage>(
      'communication_messaging_messages',
      messageSchema,
    ),
    Identities: db.model<MessagingIdentity>(
      'communication_messaging_identities',
      identitySchema,
    ),
  }));

let generate: ReturnType<typeof configureMessagingModels> | undefined;

export const generateMessagingModels = (tenant: string) => {
  generate ??= configureMessagingModels();
  return generate(tenant);
};

export type MessagingModels = Awaited<
  ReturnType<typeof generateMessagingModels>
>;
