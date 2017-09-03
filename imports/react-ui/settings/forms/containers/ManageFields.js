import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import Alert from 'meteor/erxes-notifier';
import { Fields, Forms } from '/imports/api/forms/forms';
import { ManageFields } from '../components';

function composer(props, onData) {
  const formId = props.formId;
  const formHandler = Meteor.subscribe('forms.detail', formId);
  const fieldsHandler = Meteor.subscribe('forms.fieldList', [formId]);

  if (!(formHandler.ready() && fieldsHandler.ready())) {
    return false;
  }

  const formsHandler = Meteor.subscribe('forms.list');
  const form = Forms.findOne(formId);

  // common callback
  const callback = error => {
    if (error) {
      return Alert.error(error.message);
    }

    return Alert.success('Congrats');
  };

  // create field
  const addField = doc => {
    Meteor.call('forms.addField', { formId: props.formId, doc }, callback);
  };

  // edit field
  const editField = (_id, doc) => {
    Meteor.call('forms.editField', { _id, doc }, callback);
  };

  // delete field
  const deleteField = _id => {
    if (confirm('Are you sure ?')) {
      // eslint-disable-line
      Meteor.call('forms.removeField', { _id }, callback);
    }
  };

  // update orders
  const onSort = fields => {
    const orderDics = [];

    _.each(fields, (field, index) => {
      orderDics.push({ _id: field._id, order: index });
    });

    Meteor.call('forms.updateFieldsOrder', { orderDics }, callback);
  };

  let formTitle = '';

  if (formsHandler.ready()) {
    formTitle = form.title;
  }

  return onData(null, {
    addField,
    editField,
    deleteField,
    onSort,
    formTitle,
    fields: Fields.find({ formId }, { sort: { order: 1 } }).fetch(),
  });
}

export default compose(getTrackerLoader(composer), composerOptions({}))(ManageFields);
