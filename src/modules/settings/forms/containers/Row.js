import { compose } from 'react-komposer';
// import Alert from 'meteor/erxes-notifier';
import { Row } from '../components';

// TODO
function composer({ refetch }, onData) {
  const duplicateForm = id => {
    // if (!confirm('Are you sure ?')) return;
    //
    // Meteor.call('forms.duplicate', { id }, error => {
    //   if (error) {
    //     return Alert.error(error.reason || error.message);
    //   }
    //
    //   refetch();
    //
    //   return Alert.success('Form has duplicated.');
    // });
  };

  onData(null, {
    duplicateForm,
  });
}

export default compose(composer)(Row);
