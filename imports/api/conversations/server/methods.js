import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ErxesMixin } from '/imports/api/utils';
import { tagObject } from '/imports/api/tags/server/api';
import { Conversations } from '../conversations';


// eslint-disable-next-line import/prefer-default-export
export const tag = new ValidatedMethod({
  name: 'conversations.tag',
  mixins: [ErxesMixin],

  validate: new SimpleSchema({
    conversationIds: {
      type: [String],
      regEx: SimpleSchema.RegEx.Id,
    },
    tagIds: {
      type: [String],
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),

  run({ conversationIds, tagIds }) {
    const conversations = Conversations.find({ _id: { $in: conversationIds } }).fetch();

    if (conversations.length !== conversationIds.length) {
      throw new Meteor.Error('conversations.tag.conversationNotFound',
        'Conversation not found.');
    }

    tagObject({ tagIds, objectIds: conversationIds, collection: Conversations });
  },
});
