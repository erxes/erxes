import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import Alert from 'meteor/erxes-notifier';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { InAppMessagingAppearance } from '../components';

const composer = (props, onData) => {
  const save = (doc) => {
    Meteor.call(
      'integrations.saveInAppMessagingApperance',

      { _id: props.integrationId, doc },

      (error) => {
        if (error) return Alert.error(error.reason);

        return Alert.success('Successfully saved.');
      },
    );
  };

  onData(null, {
    save,
  });
};

export default compose(getTrackerLoader(
  composer,
  composerOptions({ spinner: true }),
))(InAppMessagingAppearance);
