import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import Alert from 'meteor/erxes-notifier';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Row } from '../components';

function composer(props, onData) {
  const duplicateForm = id => {
    if (!confirm('Are you sure ?')) return;

    Meteor.call('forms.duplicate', { id }, error => {
      if (error) {
        return Alert.error(error.reason || error.message);
      }

      return Alert.success('Form has duplicated.');
    });
  };

  onData(null, {
    duplicateForm,
  });
}

export default compose(getTrackerLoader(composer), composerOptions({ spinner: true }))(Row);
