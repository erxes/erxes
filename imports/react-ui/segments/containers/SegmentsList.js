import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import Segments from '/imports/api/customers/segments';
import { removeSegment } from '/imports/api/customers/methods';
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

export default compose(getTrackerLoader(composer), composerOptions({}))(SegmentsList);
