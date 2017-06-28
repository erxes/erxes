import { Brands } from '/imports/api/brands/brands';
import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { KbTopic } from '../components';
import { saveCallback } from './utils';

const composer = (props, onData) => {
  const brandsHandler = Meteor.subscribe('brands.list', 0);
  const brands = Brands.find().fetch();

  const save = doc => saveCallback({ doc }, 'addKbTopic', 'editKbTopic', props.integration);

  if (brandsHandler.ready()) {
    return onData(null, { brands, save });
  }

  return null;
};

export default compose(getTrackerLoader(composer), composerOptions({ spinner: true }))(KbTopic);
