import { composeWithTracker } from 'react-komposer';
import { Spinner } from '/imports/react-ui/common';
import { InAppMessaging } from '../components';
import composer from './commonComposer';

export default composeWithTracker(
  composer({
    addMethodName: 'addInAppMessaging',
    editMethodName: 'editInAppMessaging',
  }),
  Spinner,
)(InAppMessaging);
