import { composeWithTracker } from 'react-komposer';
import { Spinner } from '/imports/react-ui/common';
import { Common } from '../components';
import composer from './commonComposer';

export default composeWithTracker(
  composer({
    addMethodName: 'addInAppMessaging',
    editMethodName: 'editInAppMessaging',
  }),
  Spinner,
)(Common);
