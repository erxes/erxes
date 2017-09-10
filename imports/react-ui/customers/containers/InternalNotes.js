import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import Alert from 'meteor/erxes-notifier';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { InternalNotes } from '../components';

function composer({ customer }, onData) {
  const internalNotes = [...customer.internalNotes];

  if (internalNotes) {
    internalNotes.sort((a, b) => b.createdDate - a.createdDate);
  }

  onData(null, {
    internalNotes: internalNotes || [],

    createInternalNote: content => {
      const doc = { customerId: customer._id, internalNote: content };
      Meteor.call('customers.createInternalNote', doc, () => {
        customer.refetch();
      });
    },

    removeInternalNote: internalNoteId => {
      const doc = { customerId: customer._id, internalNoteId };

      Meteor.call('customers.removeInternalNote', doc, error => {
        if (error) {
          return Alert.error(error.message);
        }

        customer.refetch();
      });
    },
  });
}

export default compose(getTrackerLoader(composer))(InternalNotes);
