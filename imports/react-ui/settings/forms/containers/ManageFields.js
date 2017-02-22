import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import Alert from 'meteor/erxes-notifier';
import { Spinner } from '/imports/react-ui/common';
import { Fields } from '/imports/api/forms/forms';
import {
  addField as addFieldMethod,
  editField as editFieldMethod,
} from '/imports/api/forms/methods';
import { ManageFields } from '../components';


function composer(props, onData) {
  const formId = props.formId;
  const formHandler = Meteor.subscribe('forms.detail', formId);
  const fieldsHandler = Meteor.subscribe('forms.fieldList', [formId]);

  if (!(formHandler.ready() && fieldsHandler.ready())) {
    return false;
  }

  const callback = (error) => {
    if (error) {
      return Alert.error(error.message);
    }

    return Alert.success('Congrats');
  };

  const addField = (doc) => {
    addFieldMethod.call({ formId: props.formId, doc }, callback);
  };

  const editField = (_id, doc) => {
    editFieldMethod.call({ _id, doc }, callback);
  };

  return onData(null, {
    addField,
    editField,
    fields: Fields.find({ formId }).fetch(),
  });
}

export default composeWithTracker(composer, Spinner)(ManageFields);
