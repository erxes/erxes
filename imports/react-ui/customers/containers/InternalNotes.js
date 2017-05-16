import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { Customers } from '/imports/api/customers/customers';
import { createInternalNote, removeInternalNote } from '/imports/api/customers/methods';
import { InternalNotes } from '../components';

function composer({ customerId }, onData) {
  const internalNotes = Customers.findOne(customerId).internalNotes;
  if (internalNotes) {
    internalNotes.sort((a, b) => b.createdDate - a.createdDate);
  }
  onData(null, {
    internalNotes: internalNotes || [],
    createInternalNote: content => {
      createInternalNote.call({ customerId, internalNote: content });
    },
    removeInternalNote: internalNoteId => {
      removeInternalNote.call({ customerId, internalNoteId });
    },
  });
}

export default compose(getTrackerLoader(composer))(InternalNotes);
