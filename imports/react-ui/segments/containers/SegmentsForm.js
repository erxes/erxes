import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { createSegment, editSegment } from '/imports/api/customers/methods';
import { Loader } from '/imports/react-ui/common';
import Segments from '/imports/api/customers/segments';
import { SegmentsForm } from '../components';


function composer(props, onData) {
  const handle = props.id
    ? Meteor.subscribe('customers.segmentById', props.id).ready()
    : true;

  if (handle) {
    onData(null, {
      segment: Segments.findOne(props.id),
      create({ doc }, callback) {
        createSegment.call(doc, callback);
      },
      edit({ id, doc }, callback) {
        editSegment.call({ id, doc }, callback);
      },
    });
  }
}

export default composeWithTracker(composer, Loader)(SegmentsForm);
