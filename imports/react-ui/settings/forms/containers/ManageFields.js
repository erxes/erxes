import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import { Spinner } from '/imports/react-ui/common';
import { addField as addFieldMethod } from '/imports/api/forms/methods';
import { ManageFields } from '../components';


function composer(props, onData) {
  const handler = Meteor.subscribe('forms.detail', props.formId);

  if (!handler.ready()) {
    return false;
  }

  const addField = (doc) => {
    addFieldMethod.call({ formId: props.formId, doc });
  };

  return onData(null, {
    addField,
  });
}

export default composeWithTracker(composer, Spinner)(ManageFields);
