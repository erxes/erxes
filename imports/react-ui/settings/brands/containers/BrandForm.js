import { composeWithTracker } from 'react-komposer';
import { Spinner } from '/imports/react-ui/common';
import { BrandForm } from '../components';


function composer({ brand }, onData) {
  onData(null, {
    brand,
  });
}

export default composeWithTracker(composer, Spinner)(BrandForm);
