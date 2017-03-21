import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { Spinner } from '/imports/react-ui/common';
import { Form } from '../components';


function composer({ object }, onData) {
  onData(null, {
    object,
  });
}

export default compose(getTrackerLoader(composer), Spinner)(Form);
