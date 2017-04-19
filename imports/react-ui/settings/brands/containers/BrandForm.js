import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { BrandForm } from '../components';

function composer({ brand }, onData) {
  onData(null, {
    brand,
  });
}

export default compose(getTrackerLoader(composer), composerOptions({ spinner: true }))(BrandForm);
