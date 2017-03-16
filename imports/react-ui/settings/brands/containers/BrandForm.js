import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { Spinner } from '/imports/react-ui/common';
import { BrandForm } from '../components';


function composer({ brand }, onData) {
  onData(null, {
    brand,
  });
}

export default compose(getTrackerLoader(composer, Spinner))(BrandForm);
