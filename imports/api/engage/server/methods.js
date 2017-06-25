import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ErxesMixin } from '/imports/api/utils';
import { Messages } from '../engage';
import { MESSAGE_KINDS } from '../constants';
import { send } from '../utils';

// add messsage
export const messagesAdd = new ValidatedMethod({
  name: 'engage.messages.add',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check(doc, Messages.schema);
  },

  run({ doc }) {
    doc.createdUserId = this.userId;
    doc.createdDate = new Date();
    doc.deliveryReports = {};

    // create
    const messageId = Messages.insert(doc);

    // if manual and live then send immediately
    if (doc.kind === MESSAGE_KINDS.MANUAL && doc.isLive) {
      const message = Messages.findOne(messageId);

      send(message);
    }

    return messageId;
  },
});

// edit message
export const messagesEdit = new ValidatedMethod({
  name: 'engage.messages.edit',
  mixins: [ErxesMixin],

  validate({ id, doc }) {
    check(id, String);
    check(doc, Messages.schema);
  },

  run({ id, doc }) {
    return Messages.update(id, { $set: doc });
  },
});

// remove message
export const messagesRemove = new ValidatedMethod({
  name: 'engage.messages.remove',
  mixins: [ErxesMixin],

  validate(id) {
    check(id, String);
  },

  run(id) {
    return Messages.remove(id);
  },
});

// set live
export const messagesSetLive = new ValidatedMethod({
  name: 'engage.messages.setLive',
  mixins: [ErxesMixin],

  validate(id) {
    check(id, String);
  },

  run(id) {
    return Messages.update(id, { $set: { isLive: true, isDraft: false } });
  },
});

// set pause
export const messagesSetPause = new ValidatedMethod({
  name: 'engage.messages.setPause',
  mixins: [ErxesMixin],

  validate(id) {
    check(id, String);
  },

  run(id) {
    return Messages.update(id, { $set: { isLive: false } });
  },
});

// set live manual
export const messagesSetLiveManual = new ValidatedMethod({
  name: 'engage.messages.setLiveManual',
  mixins: [ErxesMixin],

  validate(id) {
    check(id, String);
  },

  run(id) {
    Messages.update(id, { $set: { isLive: true, isDraft: false } });

    const message = Messages.findOne(id);

    // if manual and live then send
    send(message);
  },
});
