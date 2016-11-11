import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { composeWithTracker } from 'react-komposer';
import { Tickets } from '/imports/api/tickets/tickets';
import {
  changeStatus as method,
  markAsRead,
} from '/imports/api/tickets/methods';
import { Comments } from '/imports/api/tickets/comments';
import { Loader } from '/imports/react-ui/common';
import { Details } from '../components';

const attachmentPreview = new ReactiveVar({});

function composer({ id, channelId }, onData) {
  // ticket, comments subscriptions
  const ticketHandle = Meteor.subscribe('tickets.detail', id);
  const commentsHandle = Meteor.subscribe('tickets.commentList', id);

  // =============== actions
  const changeStatus = (ticketId, status, callback) => {
    method.call({ ticketIds: [ticketId], status }, callback);
  };

  const setAttachmentPreview = (previewObject) => {
    attachmentPreview.set(previewObject);
  };

  // subscriptions are ready
  if (ticketHandle.ready() && commentsHandle.ready()) {
    const ticket = Tickets.findOne(id);
    const comments = Comments.find({ ticketId: id }).fetch();

    // brand, tags, users subscriptions
    const brandHandle = Meteor.subscribe('brands.getById', ticket.brandId);
    const tagsHandle = Meteor.subscribe('tags.tagListByIds', ticket.tagIds || []);
    const usersHandle = Meteor.subscribe('users.list', {});

    if (brandHandle.ready() && tagsHandle.ready() && usersHandle.ready()) {
      // mark as read
      const readUserIds = ticket.readUserIds || [];

      if (!readUserIds.includes(Meteor.userId())) {
        markAsRead.call({ ticketId: id });
      }

      onData(
        null,
        {
          ticket,
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
