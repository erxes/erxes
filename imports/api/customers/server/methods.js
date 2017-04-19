import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ErxesMixin } from '/imports/api/utils';
import { tagObject } from '/imports/api/tags/server/api';
import { Customers } from '../customers';

// eslint-disable-next-line import/prefer-default-export
export const tag = new ValidatedMethod({
  name: 'customers.tag',
  mixins: [ErxesMixin],

  validate: new SimpleSchema({
    customerIds: {
      type: [String],
      regEx: SimpleSchema.RegEx.Id,
    },
    tagIds: {
      type: [String],
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),

  run({ customerIds, tagIds }) {
    const conversations = Customers.find({ _id: { $in: customerIds } }).fetch();

    if (conversations.length !== customerIds.length) {
      throw new Meteor.Error('customers.tag.customerNotFound', 'Customer not found.');
    }

    tagObject({ tagIds, objectIds: customerIds, collection: Customers });
  },
});
