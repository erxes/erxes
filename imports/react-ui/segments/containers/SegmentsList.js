import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import Segments from '/imports/api/customers/segments';
import { removeSegment } from '/imports/api/customers/methods';
import { Loader } from '/imports/react-ui/common';
import { SegmentsList } from '../components';


function composer(props, onData) {
  const segmentsHandle = Meteor.subscribe('customers.segments');

  if (segmentsHandle.ready()) {
    onData(null, {
      segments: Segments.find({}, { sort: { name: 1 } }).fetch(),
      removeSegment({ id }, callback) {
        removeSegment.call(id, callback);
      },
    });
  }
}

export default composeWithTracker(composer, Loader)(SegmentsList);
