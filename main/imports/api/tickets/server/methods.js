import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ErxesMixin } from '/imports/api/utils';
import { tagObject } from '/imports/api/tags/server/api';
import { Tickets } from '../tickets';


export const tag = new ValidatedMethod({
  name: 'tickets.tag',
  mixins: [ErxesMixin],

  validate: new SimpleSchema({
    ticketIds: {
      type: [String],
      regEx: SimpleSchema.RegEx.Id,
    },
    tagIds: {
      type: [String],
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),

  run({ ticketIds, tagIds }) {
    const tickets = Tickets.find({ _id: { $in: ticketIds } }).fetch();

    if (tickets.length !== ticketIds.length) {
      throw new Meteor.Error('tickets.tag.ticketNotFound',
        'Ticket not found.');
    }

    tagObject({ tagIds, objectIds: ticketIds, collection: Tickets });
  },
});
