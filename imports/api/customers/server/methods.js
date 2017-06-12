import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ErxesMixin } from '/imports/api/utils';
import { tagObject } from '/imports/api/tags/server/api';
import { TagSchema } from '/imports/api/tags/utils';
import { Customers } from '../customers';

export const tag = new ValidatedMethod({
  name: 'customers.tag',
  mixins: [ErxesMixin],
  validate: TagSchema.validator(),

  run({ targetIds, tagIds }) {
    const conversations = Customers.find({ _id: { $in: targetIds } }).fetch();

    if (conversations.length !== targetIds.length) {
      throw new Meteor.Error('customers.tag.customerNotFound', 'Customer not found.');
    }

    tagObject({ tagIds, objectIds: targetIds, collection: Customers });
  },
});
