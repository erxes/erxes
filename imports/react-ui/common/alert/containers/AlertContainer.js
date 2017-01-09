import { composeWithTracker } from 'react-komposer';

import Alert from 'meteor/erxes-notifier';
import AlertsWrapper from '../components/AlertsWrapper.jsx';


function composer(props, onData) {
  onData(null, { alerts: Alert.Collections.Alerts.find().fetch() });
}

export default composeWithTracker(composer)(AlertsWrapper);
