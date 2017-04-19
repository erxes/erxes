import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';

import Alert from 'meteor/erxes-notifier';
import AlertsWrapper from '../components/AlertsWrapper.jsx';

function composer(props, onData) {
  onData(null, { alerts: Alert.Collections.Alerts.find().fetch() });
}

export default compose(getTrackerLoader(composer))(AlertsWrapper);
