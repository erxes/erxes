import { Meteor } from 'meteor/meteor';
import { Brands } from '/imports/api/brands/brands';
import { Forms } from '/imports/api/forms/forms';
import { composeWithTracker } from 'react-komposer';
import { Spinner } from '/imports/react-ui/common';
import { Form } from '../components';
import { saveCallback } from './utils';

const composer = (props, onData) => {
  const brandsHandler = Meteor.subscribe('brands.list', 0);
  const formsHandler = Meteor.subscribe('forms.list');

  const brands = Brands.find().fetch();
  const forms = Forms.find().fetch();

  const save = doc =>
    saveCallback(doc, 'addForm', 'editForm', props.integration);

  if (brandsHandler.ready() && formsHandler.ready()) {
    return onData(null, { brands, forms, save });
  }

  return null;
};

export default composeWithTracker(
  composer,
  Spinner,
)(Form);
