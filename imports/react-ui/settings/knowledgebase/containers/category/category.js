import { Brands } from '/imports/api/brands/brands';
import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { KbCategory } from '../../components';
import { saveCallback } from '../utils';

console.log('KbCategory 2: ', KbCategory);

const composer = (props, onData) => {
  const save = doc => saveCallback({ doc }, 'addKbCategory', 'editKbCategory', props.integration);
  return onData(null, { save });
};

export default compose(getTrackerLoader(composer), composerOptions({ spinner: true }))(KbCategory);
