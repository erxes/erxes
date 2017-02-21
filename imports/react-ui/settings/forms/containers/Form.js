import { composeWithTracker } from 'react-komposer';
import { Spinner } from '/imports/react-ui/common';
import { Form } from '../components';


function composer({ form }, onData) {
  onData(null, {
    form,
  });
}

export default composeWithTracker(composer, Spinner)(Form);
