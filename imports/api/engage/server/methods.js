import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ErxesMixin } from '/imports/api/utils';
import { Messages } from '../engage';
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

    // if manual then send emails immediately
    if (!doc.isAuto) {
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
