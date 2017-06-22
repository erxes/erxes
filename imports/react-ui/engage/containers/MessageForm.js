import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Messages } from '/imports/api/engage/engage';
import { MessageForm } from '../components';

function composer({ messageId, kind }, onData) {
  const handler = Meteor.subscribe('engage.messages.detail', messageId || '');

  // wait for detail subscription
  if (!handler.ready()) {
    return null;
  }

  const message = Messages.findOne({ _id: messageId });

  onData(null, { kind: message ? message.kind : kind });
}

export default compose(getTrackerLoader(composer), composerOptions({}))(MessageForm);
