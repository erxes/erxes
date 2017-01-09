import { composeWithTracker } from 'react-komposer';
import AuthLayout from '../components/AuthLayout.jsx';


function composer(props, onData) {
  onData(null, {});
}

export default composeWithTracker(composer)(AuthLayout);
