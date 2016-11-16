import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { composeWithTracker } from 'react-komposer';
import { Conversations } from '/imports/api/conversations/conversations';
import {
  changeStatus as method,
  markAsRead,
} from '/imports/api/conversations/methods';
import { Messages } from '/imports/api/conversations/messages';
import { Loader } from '/imports/react-ui/common';
import { Details } from '../components';

const attachmentPreview = new ReactiveVar({});

function composer({ id, channelId }, onData) {
  // conversation, messages subscriptions
  const conversationHandle = Meteor.subscribe('conversations.detail', id);
  const messagesHandle = Meteor.subscribe('conversations.messageList', id);

  // =============== actions
  const changeStatus = (conversationId, status, callback) => {
    method.call({ conversationIds: [conversationId], status }, callback);
  };

  const setAttachmentPreview = (previewObject) => {
    attachmentPreview.set(previewObject);
  };

  // subscriptions are ready
  if (conversationHandle.ready() && messagesHandle.ready()) {
    const conversation = Conversations.findOne(id);
    const messages = Messages.find({ conversationId: id }).fetch();

    // brand, tags, users subscriptions
    const brandHandle = Meteor.subscribe('brands.getById', conversation.brandId);
    const tagsHandle = Meteor.subscribe('tags.tagListByIds', conversation.tagIds || []);
    const usersHandle = Meteor.subscribe('users.list', {});

    if (brandHandle.ready() && tagsHandle.ready() && usersHandle.ready()) {
      // mark as read
      const readUserIds = conversation.readUserIds || [];

      if (!readUserIds.includes(Meteor.userId())) {
        markAsRead.call({ conversationId: id });
      }

      onData(
        null,
        {
          conversation,
          messages,
          channelId,
          changeStatus,
          setAttachmentPreview,
          attachmentPreview: attachmentPreview.get(),
        }
      );
    }
  }
}

export default composeWithTracker(composer, Loader)(Details);
