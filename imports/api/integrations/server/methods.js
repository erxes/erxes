import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ErxesMixin } from '/imports/api/utils';
import { Conversations } from '/imports/api/conversations/conversations';
import { Messages } from '/imports/api/conversations/messages';
import { Customers } from '/imports/api/customers/customers';
import { Channels } from '/imports/api/channels/channels';
import { Integrations, messengerSchema, formSchema } from '../integrations';
import { KIND_CHOICES } from '../constants';

// add messenger
export const addMessenger = new ValidatedMethod({
  name: 'integrations.addMessenger',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check(doc, { name: String, brandId: String });
  },

  run({ doc }) {
    return Integrations.insert(Object.assign(doc, { kind: KIND_CHOICES.MESSENGER }));
  },
});

// edit messenger
export const editMessenger = new ValidatedMethod({
  name: 'integrations.editMessenger',
  mixins: [ErxesMixin],

  validate({ _id, doc }) {
    check(_id, String);
    check(doc, { name: String, brandId: String });
  },

  run({ _id, doc }) {
    return Integrations.update({ _id }, { $set: doc });
  },
});

const generateFormDoc = (mainDoc, formDoc) =>
  Object.assign(mainDoc, {
    kind: KIND_CHOICES.FORM,
    formData: formDoc,
  });

// add form
export const addForm = new ValidatedMethod({
  name: 'integrations.addForm',
  mixins: [ErxesMixin],

  validate({ mainDoc, formDoc }) {
    check(mainDoc, { name: String, brandId: String, formId: String });
    check(formDoc, formSchema);
  },

  run({ mainDoc, formDoc }) {
    return Integrations.insert(generateFormDoc(mainDoc, formDoc));
  },
});

// edit form
export const editForm = new ValidatedMethod({
  name: 'integrations.editForm',
  mixins: [ErxesMixin],

  validate({ _id, mainDoc, formDoc }) {
    check(_id, String);
    check(mainDoc, { name: String, brandId: String, formId: String });
    check(formDoc, formSchema);
  },

  run({ _id, mainDoc, formDoc }) {
    return Integrations.update({ _id }, { $set: generateFormDoc(mainDoc, formDoc) });
  },
});

// integration remove
export const remove = new ValidatedMethod({
  name: 'integrations.remove',
  mixins: [ErxesMixin],

  validate(id) {
    check(id, String);
  },

  run(id) {
    // check whether or not used in channels
    if (Channels.find({ integrationIds: { $in: [id] } }).count() > 0) {
      throw new Meteor.Error(
        'integrations.remove.usedInChannel',
        'You cannot delete this integration. It belongs to other channel.',
      );
    }

    // conversations
    const conversations = Conversations.find({ integrationId: id }).fetch();
    const conversationIds = conversations.map(c => c._id);

    // remove messages
    Messages.remove({ conversationId: { $in: conversationIds } });

    // remove conversations
    Conversations.remove({ integrationId: id });

    // remove customers
    Customers.remove({ integrationId: id });

    return Integrations.remove(id);
  },
});

export const saveMessengerApperance = new ValidatedMethod({
  name: 'integrations.saveMessengerApperance',
  mixins: [ErxesMixin],

  validate({ _id, doc }) {
    check(_id, String);
    check(doc, { color: String, wallpaper: Match.Optional(String) });
  },

  run({ _id, doc }) {
    return Integrations.update({ _id }, { $set: { uiOptions: doc } });
  },
});

export const saveMessengerAvailability = new ValidatedMethod({
  name: 'integrations.saveMessengerAvailability',
  mixins: [ErxesMixin],

  validate({ _id, doc }) {
    check(_id, String);
    check(doc, messengerSchema);
  },

  run({ _id, doc }) {
    return Integrations.update({ _id }, { $set: { messengerData: doc } });
  },
});
