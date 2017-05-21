import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { Brands } from '/imports/api/brands/brands';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Messenger } from '../components';
import { saveCallback } from './utils';

const composer = (props, onData) => {
  const brandsHandler = Meteor.subscribe('brands.list', 0);
  const brands = Brands.find().fetch();

  const save = doc => saveCallback({ doc }, 'addMessenger', 'editMessenger', props.integration);

  if (brandsHandler.ready()) {
    return onData(null, { brands, save });
  }

  return null;
};

export default compose(getTrackerLoader(composer, composerOptions({ spinner: true })))(Messenger);
