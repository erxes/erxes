import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { createSegment, editSegment } from '/imports/api/customers/methods';
import { Loader } from '/imports/react-ui/common';
import { Customers } from '/imports/api/customers/customers';
import Segments from '/imports/api/customers/segments';
import { SegmentsForm } from '../components';


function composer(props, onData) {
  const handle = props.id
    ? Meteor.subscribe('customers.segmentById', props.id).ready()
    : true;

  const schema = Customers.simpleSchema().schema();
  const fields = Object.keys(schema)
    .filter((key) => {
      // Can't accepts below types of fields
      const unacceptedTypes = ['Object', 'Array'];
      const isAcceptedType = unacceptedTypes.indexOf(schema[key].type.name) < 0;

      // Exclude the fields which is used for internal use
      const [parentFieldName] = key.split('.');
      const notInternalUseField = Customers.internalUseFields.indexOf(parentFieldName) < 0;

      return isAcceptedType && notInternalUseField;
    })
    .map(key => ({
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

export default composeWithTracker(composer, Loader)(SegmentsForm);
