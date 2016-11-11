import { composeWithTracker } from 'react-komposer';
import { BrandForm } from '../components';

function composer({ brand }, onData) {
  onData(null, {
    brand,
  });
}

export default composeWithTracker(composer)(BrandForm);
