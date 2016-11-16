import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { composeWithTracker } from 'react-komposer';
import { Conversations } from '/imports/api/conversations/conversations';
import {
  changeStatus as method,
  markAsRead,
} from '/imports/api/conversations/methods';
import { Comments } from '/imports/api/conversations/comments';
import { Loader } from '/imports/react-ui/common';
import { Details } from '../components';

const attachmentPreview = new ReactiveVar({});

function composer({ id, channelId }, onData) {
  // conversation, comments subscriptions
  const conversationHandle = Meteor.subscribe('conversations.detail', id);
  const commentsHandle = Meteor.subscribe('conversations.commentList', id);

  // =============== actions
  const changeStatus = (conversationId, status, callback) => {
    method.call({ conversationIds: [conversationId], status }, callback);
  };

  const setAttachmentPreview = (previewObject) => {
    attachmentPreview.set(previewObject);
  };

  // subscriptions are ready
  if (conversationHandle.ready() && commentsHandle.ready()) {
    const conversation = Conversations.findOne(id);
    const comments = Comments.find({ conversationId: id }).fetch();

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
          comments,
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
