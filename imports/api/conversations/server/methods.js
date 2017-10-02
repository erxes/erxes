import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import strip from 'strip';

import { ErxesMixin } from '/imports/api/utils';
import { sendNotification, sendEmail } from '/imports/api/server/utils';
import { KIND_CHOICES } from '/imports/api/integrations/constants';
import { tweetReply } from '/imports/api/integrations/social/server/twitter';
import { facebookReply } from '/imports/api/integrations/social/server/facebook';
import { Messages, FormSchema } from '/imports/api/conversations/messages';
import {
  Conversations,
  ConversationIdsSchema,
  AssignSchema,
  ChangeStatusSchema,
} from '/imports/api/conversations/conversations';
import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';
import { conversationsChanged, messageInserted } from './apolloPubSubs';

/*
 * all possible users they can get notifications
 */
const conversationNotifReceivers = (conversation, currentUserId) => {
  let userIds = [];

  // assigned user can get notifications
  if (conversation.assignedUserId) {
    userIds.push(conversation.assignedUserId);
  }

  // participated users can get notifications
  if (conversation.participatedUserIds) {
    userIds = _.union(userIds, conversation.participatedUserIds);
  }

  // exclude current user
  userIds = _.without(userIds, currentUserId);

  return userIds;
};

const createMessage = (params) => {
  const messageId = Messages.insert(params);

  // notify graphl subscription
  messageInserted(messageId);

  return messageId;
}

/*
 * create new message from admin
 */
export const addMessage = new ValidatedMethod({
  name: 'conversations.addMessage',
  mixins: [ErxesMixin],
  validate: FormSchema.validator(),

  run(_doc) {
    const doc = _doc;
    const conversation = Conversations.findOne(doc.conversationId);

    if (!conversation) {
      throw new Meteor.Error(
        'conversations.addMessage.conversationNotFound',
        'Conversation not found',
      );
    }

    const integration = conversation.integration();

    // normalize content, attachments
    const content = doc.content || '';
    const attachments = doc.attachments || [];

    doc.content = content;
    doc.attachments = attachments;

    // if there is no attachments and no content then throw content required
    // error
    if (attachments.length === 0 && !strip(content)) {
      throw new Meteor.Error('conversations.addMessage.contentRequired', 'Content is required');
    }

    // setting conversation's content to last message
    Conversations.update({ _id: doc.conversationId }, { $set: { content } });

    const title = 'You have a new message.';

    // send notification
    sendNotification({
      createdUser: this.userId,
      notifType: 'conversationAddMessage',
      title,
      content,
      link: `/inbox/details/${conversation._id}`,
      receivers: conversationNotifReceivers(conversation, this.userId),
    });

    const userId = this.userId;

    // do not send internal message to third service integrations
    if (doc.internal) {
      return createMessage({ ...doc, userId });
    }

    // send reply to twitter
    if (integration.kind === KIND_CHOICES.TWITTER) {
      return tweetReply(conversation, strip(content));
    }

    const messageId = createMessage({ ...doc, userId });

    const customer = conversation.customer();

    // if conversation's integration kind is form then send reply to
    // customer's email
    const kind = integration.kind;
    const email = customer ? customer.email : '';

    if (kind === KIND_CHOICES.FORM && email) {
      sendEmail({
        to: customer.email,
        subject: 'Reply',
        template: {
          name: 'notification',
          data: {
            notification: {
              title: 'reply',
              content,
              date: new Date(),
            },
          },
        },
      });
    }

    // send reply to facebook
    if (integration.kind === KIND_CHOICES.FACEBOOK) {
      // when facebook kind is feed, assign commentId in extraData
      facebookReply(conversation, strip(content), messageId);
    }

    return messageId;
  },
});

const checkConversationsExistance = conversationIds => {
  const selector = { _id: { $in: conversationIds } };
  const conversations = Conversations.find(selector).fetch();

  if (conversations.length !== conversationIds.length) {
    throw new Meteor.Error('conversations.conversationNotFound', 'Conversation not found.');
  }

  return { selector, conversations };
};

/*
 * assign employee to conversation
 */
export const assign = new ValidatedMethod({
  name: 'conversations.assign',
  mixins: [ErxesMixin],
  validate: AssignSchema.validator(),

  run({ conversationIds, assignedUserId }) {
    // check conversations existance
    const { selector } = checkConversationsExistance(conversationIds);

    if (!Meteor.users.findOne(assignedUserId)) {
      throw new Meteor.Error('conversations.assign.userNotFound', 'User not found.');
    }

    Conversations.update(
      { _id: { $in: conversationIds } },
      { $set: { assignedUserId } },
      { multi: true },
    );

    // notify graphl subscription
    conversationsChanged(conversationIds, 'statusChanged');

    const updatedConversations = Conversations.find(selector).fetch();

    // send notification
    _.each(updatedConversations, conversation => {
      const content = 'Assigned user has changed';

      sendNotification({
        createdUser: this.userId,
        notifType: 'conversationAssigneeChange',
        title: content,
        content,
        link: `/inbox/details/${conversation._id}`,
        receivers: conversationNotifReceivers(conversation, this.userId),
      });
    });
  },
});

/*
 * unassign employee from conversation
 */
export const unassign = new ValidatedMethod({
  name: 'conversations.unassign',
  mixins: [ErxesMixin],
  validate: ConversationIdsSchema.validator(),

  run({ conversationIds }) {
    // check conversations existance
    checkConversationsExistance(conversationIds);

    Conversations.update(
      { _id: { $in: conversationIds } },
      { $unset: { assignedUserId: 1 } },
      { multi: true },
    );

    // notify graphl subscription
    conversationsChanged(conversationIds, 'statusChanged');
  },
});

/*
 * change conversation status. closed, open etc...
 */
export const changeStatus = new ValidatedMethod({
  name: 'conversations.changeStatus',
  mixins: [ErxesMixin],
  validate: ChangeStatusSchema.validator(),

  run({ conversationIds, status }) {
    // check conversations existance
    const { conversations } = checkConversationsExistance(conversationIds);

    Conversations.update({ _id: { $in: conversationIds } }, { $set: { status } }, { multi: true });

    // notify graphl subscription
    conversationsChanged(conversationIds, 'statusChanged');

    // send notification
    _.each(conversations, conversation => {
      // if associated integration's notify customer config is setted as true
      // send email to customer, when conversation close
      if (status === CONVERSATION_STATUSES.CLOSED) {
        const customer = conversation.customer();
        const integration = conversation.integration();
        const messengerData = integration.messengerData || {};
        const notifyCustomer = messengerData.notifyCustomer || false;

        if (notifyCustomer && customer.email) {
          // send email to customer
          sendEmail({
            to: customer.email,
            subject: 'Conversation detail',
            template: {
              name: 'conversationDetail',
              data: {
                conversationDetail: {
                  title: 'Conversation detail',
                  messages: Messages.find({ conversationId: conversation._id }).fetch(),
                  date: new Date(),
                },
              },
            },
          });
        }
      }

      const content = 'Conversation status has changed.';

      sendNotification({
        createdUser: this.userId,
        notifType: 'conversationStateChange',
        title: content,
        content,
        link: `/inbox/details/${conversation._id}`,
        receivers: conversationNotifReceivers(conversation, this.userId),
      });
    });
  },
});

/*
 * add given conversation to current user's starred list
 */
export const star = new ValidatedMethod({
  name: 'conversations.star',
  mixins: [ErxesMixin],
  validate: ConversationIdsSchema.validator(),

  run({ conversationIds }) {
    // check conversations existance
    checkConversationsExistance(conversationIds);

    Meteor.users.update(this.userId, {
      $addToSet: {
        'details.starredConversationIds': { $each: conversationIds },
      },
    });
  },
});

/*
 * remove given conversation from current user's starred list
 */
export const unstar = new ValidatedMethod({
  name: 'conversations.unstar',
  mixins: [ErxesMixin],
  validate: ConversationIdsSchema.validator(),

  run({ conversationIds }) {
    // check conversations existance
    checkConversationsExistance(conversationIds);

    Meteor.users.update(this.userId, {
      $pull: { 'details.starredConversationIds': { $in: conversationIds } },
    });
  },
});

/*
 * add or remove user from given conversations's participated list
 */
export const toggleParticipate = new ValidatedMethod({
  name: 'conversations.toggleParticipate',
  mixins: [ErxesMixin],
  validate: ConversationIdsSchema.validator(),

  run({ conversationIds }) {
    // check conversations existance
    const { selector } = checkConversationsExistance(conversationIds);

    const extendSelector = {
      ...selector,
      participatedUserIds: { $in: [this.userId] },
    };

    // not previously added
    if (Conversations.find(extendSelector).count() === 0) {
      Conversations.update(
        selector,
        { $addToSet: { participatedUserIds: this.userId } },
        { multi: true },
      );
    } else {
      // remove
      Conversations.update(
        selector,
        { $pull: { participatedUserIds: { $in: [this.userId] } } },
        { multi: true },
      );
    }

    // notify graphl subscription
    conversationsChanged(conversationIds, 'participatedStateChanged');
  },
});

/*
 * mark given conversation as read for current user
 */
export const markAsRead = new ValidatedMethod({
  name: 'conversations.markAsRead',
  mixins: [ErxesMixin],

  validate({ conversationId }) {
    check(conversationId, String);
  },

  run({ conversationId }) {
    const conversation = Conversations.findOne({ _id: conversationId });

    if (conversation) {
      const readUserIds = conversation.readUserIds;

      // if current user is first one
      if (!readUserIds) {
        return Conversations.update(
          { _id: conversationId },
          { $set: { readUserIds: [this.userId] } },
        );
      }

      // if current user is not in read users list then add it
      if (!readUserIds.includes(this.userId)) {
        return Conversations.update(
          { _id: conversationId },
          { $push: { readUserIds: this.userId } },
        );
      }
    }

    return 'not affected';
  },
});
