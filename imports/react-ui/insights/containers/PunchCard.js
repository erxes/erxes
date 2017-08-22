import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Messages } from '/imports/api/engage/engage';
import { Tags } from '/imports/api/tags/tags';
import { TAG_TYPES } from '/imports/api/tags/constants';
import { toggleBulk as commonToggleBulk } from '/imports/react-ui/common/utils';
import { PunchCard } from '../components';

function composer({ queryParams }, onData) {
  onData(null, {
    kind: 'kind',
    messages: {},
    tags: {},
  });
}

export default compose(getTrackerLoader(composer), composerOptions({}))(PunchCard);
