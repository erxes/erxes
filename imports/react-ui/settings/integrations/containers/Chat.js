import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Chat } from '../components';
import composer from './commonComposer';

export default compose(getTrackerLoader(
  composer({
    addMethodName: 'addChat',
    editMethodName: 'editChat',
  }),
  composerOptions({ spinner: true }),
))(Chat);
