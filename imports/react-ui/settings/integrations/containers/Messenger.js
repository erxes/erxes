import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Messenger } from '../components';
import composer from './commonComposer';

export default compose(
  getTrackerLoader(
    composer({
      addMethodName: 'addMessenger',
      editMethodName: 'editMessenger',
    }),
    composerOptions({ spinner: true }),
  ),
)(Messenger);
