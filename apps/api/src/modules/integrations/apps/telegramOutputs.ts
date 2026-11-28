import type { DataField } from '@erxes/core-contract';

const FROM: DataField[] = [
  { key: 'fromId', label: 'Sender id', type: 'text', recordType: 'user' },
  { key: 'fromUsername', label: 'Sender username', type: 'text' },
  { key: 'firstName', label: 'First name', type: 'text' },
  { key: 'lastName', label: 'Last name', type: 'text' },
  { key: 'languageCode', label: 'Language', type: 'text' },
  { key: 'fromIsBot', label: 'Sender is a bot', type: 'boolean' },
  { key: 'fromIsPremium', label: 'Sender has Telegram Premium', type: 'boolean' },
];

export const CHAT: DataField[] = [
  { key: 'chatId', label: 'Chat id', type: 'text', recordType: 'chat' },
  { key: 'chatType', label: 'Chat type (private, group, supergroup, channel)', type: 'text' },
  { key: 'chatTitle', label: 'Chat title', type: 'text' },
  { key: 'chatUsername', label: 'Chat username', type: 'text' },
];

const CONTEXT: DataField[] = [
  { key: 'threadId', label: 'Topic id', type: 'text' },
  { key: 'albumId', label: 'Album id', type: 'text' },
  { key: 'senderChatId', label: 'Sent as chat id', type: 'text' },
  { key: 'senderChatTitle', label: 'Sent as chat', type: 'text' },
  { key: 'authorSignature', label: 'Author signature', type: 'text' },
  { key: 'replyToMessageId', label: 'Reply to message id', type: 'text', recordType: 'message' },
  { key: 'replyToText', label: 'Reply to text', type: 'text' },
  { key: 'replyToFromId', label: 'Reply to sender id', type: 'text', recordType: 'user' },
  { key: 'quoteText', label: 'Quoted text', type: 'text' },
  { key: 'forwardType', label: 'Forwarded from (user, hidden_user, chat, channel)', type: 'text' },
  { key: 'forwardDate', label: 'Forwarded message sent at', type: 'date' },
  { key: 'forwardFromId', label: 'Forwarded from person id', type: 'text' },
  { key: 'forwardFromName', label: 'Forwarded from person', type: 'text' },
  { key: 'forwardChatId', label: 'Forwarded from chat id', type: 'text' },
  { key: 'forwardChatTitle', label: 'Forwarded from chat', type: 'text' },
  { key: 'forwardMessageId', label: 'Forwarded message id', type: 'text' },
];

const ENTITIES: DataField[] = [
  { key: 'hashtags', label: 'Hashtags', type: 'list' },
  { key: 'mentions', label: 'Mentions (@username)', type: 'list' },
  { key: 'links', label: 'Links', type: 'list' },
  { key: 'emails', label: 'Emails', type: 'list' },
];

const MEDIA: DataField[] = [
  { key: 'fileId', label: 'File id', type: 'text' },
  { key: 'fileUniqueId', label: 'File unique id', type: 'text' },
  { key: 'fileName', label: 'File name', type: 'text' },
  { key: 'mimeType', label: 'File type', type: 'text' },
  { key: 'fileSize', label: 'File size (bytes)', type: 'number' },
  { key: 'duration', label: 'Duration (seconds)', type: 'number' },
  { key: 'width', label: 'Width', type: 'number' },
  { key: 'height', label: 'Height', type: 'number' },
  { key: 'audioPerformer', label: 'Audio performer', type: 'text' },
  { key: 'audioTitle', label: 'Audio title', type: 'text' },
  { key: 'stickerEmoji', label: 'Sticker emoji', type: 'text' },
  { key: 'stickerSet', label: 'Sticker set', type: 'text' },
];

const CONTENT: DataField[] = [
  { key: 'latitude', label: 'Latitude', type: 'number' },
  { key: 'longitude', label: 'Longitude', type: 'number' },
  { key: 'livePeriod', label: 'Live location period (seconds)', type: 'number' },
  { key: 'venueTitle', label: 'Venue name', type: 'text' },
  { key: 'venueAddress', label: 'Venue address', type: 'text' },
  { key: 'pollId', label: 'Poll id', type: 'text' },
  { key: 'pollQuestion', label: 'Poll question', type: 'text' },
  { key: 'pollType', label: 'Poll type (regular, quiz)', type: 'text' },
  { key: 'pollOptions', label: 'Poll options', type: 'list' },
  { key: 'diceEmoji', label: 'Dice emoji', type: 'text' },
  { key: 'diceValue', label: 'Dice value', type: 'number' },
  { key: 'webAppData', label: 'Mini app data', type: 'text' },
  { key: 'webAppButton', label: 'Mini app button', type: 'text' },
];

export const MESSAGE_OUTPUTS: DataField[] = [
  { key: 'messageId', label: 'Message id', type: 'text', recordType: 'message' },
  { key: 'date', label: 'Sent at', type: 'date' },
  { key: 'text', label: 'Text or caption', type: 'text' },
  { key: 'messageKind', label: 'Kind (text, photo, document, …)', type: 'text' },
  { key: 'command', label: 'Command, without the /', type: 'text' },
  { key: 'commandArgs', label: 'Text after the command', type: 'text' },
  ...CHAT,
  ...FROM,
  ...CONTEXT,
  ...ENTITIES,
  ...MEDIA,
  ...CONTENT,
];

export const EDITED_OUTPUTS: DataField[] = [
  ...MESSAGE_OUTPUTS,
  { key: 'editedAt', label: 'Edited at', type: 'date' },
];

export const CONTACT_OUTPUTS: DataField[] = [
  ...MESSAGE_OUTPUTS,
  { key: 'phoneNumber', label: 'Phone number', type: 'text' },
  { key: 'contactFirstName', label: 'Contact first name', type: 'text' },
  { key: 'contactLastName', label: 'Contact last name', type: 'text' },
  { key: 'contactUserId', label: 'Contact Telegram id', type: 'text' },
];

export const PAYMENT_OUTPUTS: DataField[] = [
  ...MESSAGE_OUTPUTS,
  { key: 'currency', label: 'Currency', type: 'text' },
  { key: 'totalAmount', label: 'Amount (smallest unit)', type: 'number' },
  { key: 'invoicePayload', label: 'Invoice payload', type: 'text' },
  { key: 'paymentChargeId', label: 'Telegram charge id', type: 'text' },
  { key: 'providerChargeId', label: 'Provider charge id', type: 'text' },
  { key: 'payerName', label: 'Payer name', type: 'text' },
  { key: 'payerPhone', label: 'Payer phone', type: 'text' },
  { key: 'payerEmail', label: 'Payer email', type: 'text' },
];

export const BUTTON_OUTPUTS: DataField[] = [
  { key: 'callbackQueryId', label: 'Button press id', type: 'text', recordType: 'button_press' },
  { key: 'data', label: 'Button data', type: 'text' },
  { key: 'messageId', label: 'Message id', type: 'text', recordType: 'message' },
  { key: 'messageText', label: 'Message text', type: 'text' },
  { key: 'inlineMessageId', label: 'Inline message id', type: 'text' },
  { key: 'chatInstance', label: 'Chat instance', type: 'text' },
  ...CHAT,
  ...FROM,
];

export const INLINE_OUTPUTS: DataField[] = [
  { key: 'inlineQueryId', label: 'Query id', type: 'text' },
  { key: 'query', label: 'Query text', type: 'text' },
  { key: 'offset', label: 'Offset', type: 'text' },
  { key: 'chatType', label: 'Chat type', type: 'text' },
  { key: 'latitude', label: 'Latitude', type: 'number' },
  { key: 'longitude', label: 'Longitude', type: 'number' },
  ...FROM,
];

export const POLL_OUTPUTS: DataField[] = [
  { key: 'pollId', label: 'Poll id', type: 'text' },
  { key: 'optionIds', label: 'Chosen options (empty when the vote is taken back)', type: 'list' },
  { key: 'voterChatId', label: 'Voted as chat id', type: 'text' },
  { key: 'voterChatTitle', label: 'Voted as chat', type: 'text' },
  ...FROM,
];

export const JOIN_OUTPUTS: DataField[] = [
  { key: 'date', label: 'Asked at', type: 'date' },
  { key: 'bio', label: 'Bio', type: 'text' },
  { key: 'userChatId', label: 'Private chat id, to message them', type: 'text' },
  { key: 'inviteLink', label: 'Invite link', type: 'text' },
  { key: 'inviteLinkName', label: 'Invite link name', type: 'text' },
  ...CHAT,
  ...FROM,
];

export const MEMBER_OUTPUTS: DataField[] = [
  { key: 'date', label: 'Changed at', type: 'date' },
  { key: 'memberId', label: 'Member id', type: 'text' },
  { key: 'memberUsername', label: 'Member username', type: 'text' },
  { key: 'memberFirstName', label: 'Member first name', type: 'text' },
  { key: 'memberLastName', label: 'Member last name', type: 'text' },
  { key: 'memberLanguage', label: 'Member language', type: 'text' },
  { key: 'memberIsBot', label: 'Member is a bot', type: 'boolean' },
  { key: 'memberTitle', label: 'Member custom title', type: 'text' },
  { key: 'status', label: 'Status now', type: 'text' },
  { key: 'oldStatus', label: 'Status before', type: 'text' },
  { key: 'until', label: 'Restricted or banned until', type: 'date' },
  { key: 'inviteLink', label: 'Invite link used', type: 'text' },
  { key: 'inviteLinkName', label: 'Invite link name', type: 'text' },
  { key: 'viaJoinRequest', label: 'Joined by an approved request', type: 'boolean' },
  ...CHAT,
  ...FROM,
];
