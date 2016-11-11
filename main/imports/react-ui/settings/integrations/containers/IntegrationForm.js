import { composeWithTracker } from 'react-komposer';
import { IntegrationForm } from '../components';


function composer(props, onData) {
  // todo save data
  const save = () => {};

  onData(null, { save });
}

export default composeWithTracker(composer)(IntegrationForm);
