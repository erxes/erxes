import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { ErxesMixin } from '/imports/api/utils';
import { Tickets } from './tickets';
import { TICKET_STATUSES } from './constants';
import { Comments, FormSchema } from './comments';

if (Meteor.isServer) {
  import { sendNotification } from '/imports/api/server/utils';
}

// all possible users they can get notifications
const ticketNotifReceivers = (ticket, currentUserId) => {
  let userIds = [];

  // assigned user can get notifications
  if (ticket.assignedUserId) {
    userIds.push(ticket.assignedUserId);
  }

  // participated users can get notifications
  if (ticket.participatedUserIds) {
    userIds = _.union(userIds, ticket.participatedUserIds);
  }

  // exclude current user
  userIds = _.without(userIds, currentUserId);

  return userIds;
};


export const addComment = new ValidatedMethod({
  name: 'tickets.addComment',
  mixins: [ErxesMixin],
  validate: FormSchema.validator(),

  run(_doc) {
    const doc = _doc;
    const ticket = Tickets.findOne(doc.ticketId);

    if (!ticket) {
      throw new Meteor.Error(
        'tickets.addComment.ticketNotFound',
        'Ticket not found'
      );
    }

    // normalize content, attachments
    const content = doc.content || '';
    const attachments = doc.attachments || [];

    doc.content = content;
    doc.attachments = attachments;

    // if there is not attachments and no content then throw content required
    // error
    if (attachments.length === 0 && !content.trim()) {
      throw new Meteor.Error(
        'tickets.addComment.contentRequired',
        'Content is required'
      );
    }

    // send notification
    if (Meteor.isServer) {
      const commentedUser = Meteor.users.findOne({ _id: this.userId });
      const title = `${commentedUser.details.fullName} commented on a ticket`;

      sendNotification({
        createdUser: this.userId,
        notifType: 'ticketAddComment',
        title,
        content: title,
        link: `/inbox/details/${ticket._id}`,
        receivers: ticketNotifReceivers(ticket, this.userId),
      });
    }

    return Comments.insert(_.extend({ userId: this.userId }, doc));
  },
});


export const assign = new ValidatedMethod({
  name: 'tickets.assign',
  mixins: [ErxesMixin],

  validate: new SimpleSchema({
    ticketIds: {
      type: [String],
      regEx: SimpleSchema.RegEx.Id,
    },

    assignedUserId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),

  run({ ticketIds, assignedUserId }) {
    const tickets = Tickets.find({ _id: { $in: ticketIds } }).fetch();

    if (tickets.length !== ticketIds.length) {
      throw new Meteor.Error(
        'tickets.assign.ticketNotFound',
        'Ticket not found.'
      );
    }

    if (Meteor.isServer && !Meteor.users.findOne(assignedUserId)) {
      throw new Meteor.Error(
        'tickets.assign.userNotFound',
        'User not found.'
      );
    }

    Tickets.update(
      { _id: { $in: ticketIds } },
      { $set: { assignedUserId } },
      { multi: true }
    );

    if (Meteor.isServer) {
      const updatedTickets = Tickets.find({ _id: { $in: ticketIds } }).fetch();

      // send notification
      _.each(updatedTickets, (ticket) => {
        const assignedUser = Meteor.users.findOne({ _id: assignedUserId });
        const content = `Ticket's assigned person changed to ${assignedUser.details.fullName}`;

        sendNotification({
          createdUser: this.userId,
          notifType: 'ticketAssigneeChange',
          title: content,
          content,
          link: `/inbox/details/${ticket._id}`,
          receivers: ticketNotifReceivers(ticket, this.userId),
        });
      });
    }
  },
});


export const unassign = new ValidatedMethod({
  name: 'tickets.unassign',
  mixins: [ErxesMixin],

  validate: new SimpleSchema({
    ticketIds: {
      type: [String],
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),

  run({ ticketIds }) {
    const tickets = Tickets.find({ _id: { $in: ticketIds } }).fetch();

    if (tickets.length !== ticketIds.length) {
      throw new Meteor.Error(
        'tickets.unassign.ticketNotFound',
        'Ticket not found.'
      );
    }

    Tickets.update(
      { _id: { $in: ticketIds } },
      { $unset: { assignedUserId: 1 } },
      { multi: true }
    );
  },
});


export const changeStatus = new ValidatedMethod({
  name: 'tickets.changeStatus',
  mixins: [ErxesMixin],

  validate: new SimpleSchema({
    ticketIds: {
      type: [String],
      regEx: SimpleSchema.RegEx.Id,
    },
    status: {
      type: String,
      allowedValues: TICKET_STATUSES.ALL_LIST,
    },
  }).validator(),

  run({ ticketIds, status }) {
    const tickets = Tickets.find({ _id: { $in: ticketIds } }).fetch();

    if (tickets.length !== ticketIds.length) {
      throw new Meteor.Error(
        'tickets.changeStatus.ticketNotFound',
        'Ticket not found.'
      );
    }

    Tickets.update(
      { _id: { $in: ticketIds } },
      { $set: { status } },
      { multi: true }
    );

    // send notification
    if (Meteor.isServer) {
      _.each(tickets, (ticket) => {
        const content = `Ticket's status changed to ${status}`;

        sendNotification({
          createdUser: this.userId,
          notifType: 'ticketStateChange',
          title: content,
          content,
          link: `/inbox/details/${ticket._id}`,
          receivers: ticketNotifReceivers(ticket, this.userId),
        });
      });
    }
  },
});


export const star = new ValidatedMethod({
  name: 'tickets.star',
  mixins: [ErxesMixin],

  validate: new SimpleSchema({
    ticketIds: {
      type: [String],
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),

  run({ ticketIds }) {
    const tickets = Tickets.find({ _id: { $in: ticketIds } }).fetch();

    if (tickets.length !== ticketIds.length) {
      throw new Meteor.Error(
        'tickets.star.ticketNotFound',
        'Ticket not found.'
      );
    }

    Meteor.users.update(
      this.userId,
      { $addToSet: { 'details.starredTicketIds': { $each: ticketIds } } }
    );
  },
});


export const unstar = new ValidatedMethod({
  name: 'tickets.unstar',
  mixins: [ErxesMixin],

  validate: new SimpleSchema({
    ticketIds: {
      type: [String],
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),

  run({ ticketIds }) {
    if (Meteor.isServer) {
      Meteor.users.update(
        this.userId,
        { $pull: { 'details.starredTicketIds': { $in: ticketIds } } }
      );
    } else {
      Meteor.users.update(
        this.userId,
        { $pull: { 'details.starredTicketIds': ticketIds } }
      );
    }
  },
});


// mark given ticket as read for current user
export const markAsRead = new ValidatedMethod({
  name: 'tickets.markAsRead',
  mixins: [ErxesMixin],

  validate({ ticketId }) {
    check(ticketId, String);
  },

  run({ ticketId }) {
    const ticket = Tickets.findOne({ _id: ticketId });

    if (ticket) {
      const readUserIds = ticket.readUserIds;

      // if current user is first one
      if (!readUserIds) {
        return Tickets.update(
          { _id: ticketId },
          { $set: { readUserIds: [this.userId] } }
        );
      }

      // if current user is not in read users list then add it
      if (!readUserIds.includes(this.userId)) {
        return Tickets.update(
          { _id: ticketId },
          { $push: { readUserIds: this.userId } }
        );
      }
    }

    return 'not affected';
  },
});
