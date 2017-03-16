import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { Spinner } from '/imports/react-ui/common';
import { Common } from '../components';
import composer from './commonComposer';


export default compose(getTrackerLoader(
  composer({
    addMethodName: 'addInAppMessaging',
    editMethodName: 'editInAppMessaging',
  }),
  Spinner,
))(Common);
