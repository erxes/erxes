import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { PunchCard } from '../components';

function composer({ queryParams }, onData) {
  onData(null, {
    messages: {},
  });
}

export default compose(getTrackerLoader(composer), composerOptions({}))(PunchCard);
