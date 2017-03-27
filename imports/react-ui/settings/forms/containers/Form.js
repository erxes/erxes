import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Form } from '../components';


function composer({ form }, onData) {
  onData(null, {
    form,
  });
}

export default compose(getTrackerLoader(composer), composerOptions({ spinner: true }))(Form);
