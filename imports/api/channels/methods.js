import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { _ } from 'meteor/underscore';
import { ErxesMixin } from '/imports/api/utils';
import { Channels } from './channels';

const sendNotifications = (channelId, _memberIds, userId) => {
  const memberIds = _memberIds || [];
  const channel = Channels.findOne({ _id: channelId });

  if (Meteor.isServer) {
    const { sendNotification } = require('/imports/api/server/utils'); // eslint-disable-line
    const content = `You have invited to '${channel.name}' channel.`;

    sendNotification({
      createdUser: userId,
      notifType: 'channelMembersChange',
      title: content,
      content,
      link: `/inbox/${channel._id}`,

      // exclude current user
      receivers: _.without(memberIds, userId),
    });
  }
};

// channel add
export const add = new ValidatedMethod({
  name: 'channels.add',
  mixins: [ErxesMixin],

  validate({ doc }) {
    // check doc
    check(doc, Channels.schema);
  },

  run({ doc }) {
    const obj = _.extend({ userId: this.userId }, doc);

    const channelId = Channels.insert(obj);

    // send notification
    sendNotifications(channelId, doc.memberIds, this.userId);

    return channelId;
  },
});

// channel edit
export const edit = new ValidatedMethod({
  name: 'channels.edit',
  mixins: [ErxesMixin],

  validate({ id, doc }) {
    check(id, String);
    check(doc, Channels.schema);
  },

  run({ id, doc }) {
    const obj = Channels.findOne(id, { fields: { userId: 1 } });

    if (!obj) {
      throw new Meteor.Error('channels.edit.notFound', 'Channel not found');
    }

    _.extend(doc, { memberIds: doc.memberIds || [] });

    // add current user to members automatically
    if (doc.memberIds.indexOf(this.userId) === -1) {
      doc.memberIds.push(this.userId);
    }

    // update action
    Channels.update(id, { $set: doc });

    const updatedChannel = Channels.findOne(id);

    // send notification
    sendNotifications(id, updatedChannel.memberIds, this.userId);
  },
});

// channel remove
export const remove = new ValidatedMethod({
  name: 'channels.remove',
  mixins: [ErxesMixin],

  validate(id) {
    check(id, String);
  },

  run(id) {
    const obj = Channels.findOne(id, { fields: { userId: 1 } });

    if (!obj) {
      throw new Meteor.Error('channels.remove.notFound', 'Channel not found');
    }

    return Channels.remove(id);
  },
});
