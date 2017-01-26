import { composeWithTracker } from 'react-komposer';
import { Spinner } from '/imports/react-ui/common';
import { Form } from '../components';


function composer({ object }, onData) {
  onData(null, {
    object,
  });
}

export default composeWithTracker(composer, Spinner)(Form);
