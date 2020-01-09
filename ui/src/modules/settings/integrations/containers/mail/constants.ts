/**
 * Default field values for: Mail Optimistic UI
 */
const customerId = Math.round(Math.random() * -1000000);
const messageCustomerId = Math.round(Math.random() * -1000000);
const userId = Math.round(Math.random() * -1000000);
const messageId = Math.round(Math.random() * -1000000);
const createdAt = new Date();

const defaultMessageFields = {
  __typename: 'ConversationMessage',
  customerId: messageCustomerId,
  userId,
  createdAt,
  internal: false,
  fromBot: false,
  mentionedUserIds: [],
  attachments: null,
  isCustomerRead: false,
  messengerAppData: null,
  formWidgetData: null,
  user: null
};

const defaultCustomerFields = {
  __typename: 'Customer',
  _id: customerId,
  avatar: null,
  companies: null,
  customFieldsData: null,
  getMessengerCustomData: null,
  getTags: null,
  isUser: null,
  lastName: null,
  messengerData: null,
  primaryPhone: null,
  tagIds: null
};

const defaultMailFields = {
  __typename: 'MailData',
  threadId: '',
  messageId,
  reply: null,
  replyToMessageId: null,
  replyTo: null,
  references: null,
  headerId: null,
  accountId: Math.random()
};

export { defaultMessageFields, defaultCustomerFields, defaultMailFields };
