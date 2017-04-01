import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import Alert from 'meteor/erxes-notifier';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Integrations } from '/imports/api/integrations/integrations';
import { InAppMessagingAvailability } from '../components';

const composer = (props, onData) => {
  const save = (doc) => {
    Meteor.call(
      'integrations.saveInAppMessagingAvailability',

      { _id: props.integrationId, doc },

      (error) => {
        if (error) return Alert.error(error.reason);

        return Alert.success('Successfully saved.');
      },
    );
  };

  const handler = Meteor.subscribe('integrations.getById', props.integrationId);

  if (!handler.ready()) {
    return null;
  }

  const integration = Integrations.findOne(props.integrationId);

  return onData(null, {
    prevOptions: integration.inAppData || {},
    save,
  });
};

export default compose(getTrackerLoader(
  composer,
  composerOptions({ spinner: true }),
))(InAppMessagingAvailability);
