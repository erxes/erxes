import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { InAppMessaging } from '../components';
import composer from './commonComposer';


export default compose(getTrackerLoader(
  composer({
    addMethodName: 'addInAppMessaging',
    editMethodName: 'editInAppMessaging',
  }),
  composerOptions({ spinner: true }),
))(InAppMessaging);
