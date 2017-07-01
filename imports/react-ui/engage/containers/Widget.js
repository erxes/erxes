import { compose } from 'react-komposer';
import Alert from 'meteor/erxes-notifier';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { EmailTemplates } from '/imports/api/emailTemplates/emailTemplates';
import { Widget } from '../components';

function composer(props, onData) {
  Meteor.subscribe('emailTemplates.list');

  // save
  const save = (doc, callback) => {
    doc.isAuto = false;
    doc.isLive = true;

    return Meteor.call('engage.messages.add', { doc }, error => {
      if (error) {
        return Alert.error(error.reason || error.message);
      }

      Alert.success('Form is successfully saved.');
      callback();
    });
  };

  onData(null, {
    emailTemplates: EmailTemplates.find({}).fetch(),
    save,
    ...props,
  });
}

export default compose(getTrackerLoader(composer), composerOptions({}))(Widget);
