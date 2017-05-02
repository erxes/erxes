import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { createSegment, editSegment } from '/imports/api/customers/methods';
import { Customers } from '/imports/api/customers/customers';
import Segments from '/imports/api/customers/segments';
import { SegmentsForm } from '../components';

function composer(props, onData) {
  const handle = props.id ? Meteor.subscribe('customers.segmentById', props.id).ready() : true;

  const schema = Customers.simpleSchema().schema();
  const fields = Customers.getPublicFields().map(key => ({
    _id: key,
    title: schema[key].label || key,
    selectedBy: 'none',
  }));

  if (handle) {
    onData(null, {
      fields,
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

export default compose(getTrackerLoader(composer), composerOptions({}))(SegmentsForm);
