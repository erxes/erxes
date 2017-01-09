import { composeWithTracker } from 'react-komposer';
import { BrandForm } from '../components';
import { Spinner } from '/imports/react-ui/common';


function composer({ brand }, onData) {
  onData(null, {
    brand,
  });
}

export default composeWithTracker(composer, Spinner)(BrandForm);
