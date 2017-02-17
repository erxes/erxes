import { composeWithTracker } from 'react-komposer';
import { Spinner } from '/imports/react-ui/common';
import { Chat } from '../components';
import composer from './commonComposer';

export default composeWithTracker(
  composer({
    addMethodName: 'addChat',
    editMethodName: 'editChat',
  }),
  Spinner,
)(Chat);
