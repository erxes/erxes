import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { createInternalNote, removeInternalNote } from '/imports/api/customers/methods';
import { InternalNotes } from '../components';

function composer({ customer }, onData) {
  const internalNotes = customer.internalNotes;

  if (internalNotes) {
    internalNotes.sort((a, b) => b.createdDate - a.createdDate);
  }

  onData(null, {
    internalNotes: internalNotes || [],
    createInternalNote: content => {
      createInternalNote.call({ customerId: customer._id, internalNote: content });
    },
    removeInternalNote: internalNoteId => {
      removeInternalNote.call({ customerId: customer._id, internalNoteId });
    },
  });
}

export default compose(getTrackerLoader(composer))(InternalNotes);
