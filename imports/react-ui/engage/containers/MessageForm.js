import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Brands } from '/imports/api/brands/brands';

import { Messages } from '/imports/api/engage/engage';
import { MessageForm } from '../components';

function composer({ messageId, kind }, onData) {
  const messagesHandler = Meteor.subscribe('engage.messages.detail', messageId || '');
  const brandsHandler = Meteor.subscribe('brands.list');

  // wait for detail subscription
  if (!messagesHandler.ready() || !brandsHandler.ready()) {
    return null;
  }

  const message = Messages.findOne({ _id: messageId });
  const brands = Brands.find().fetch();

  onData(null, { kind: message ? message.kind : kind, brands });
}

export default compose(getTrackerLoader(composer), composerOptions({}))(MessageForm);
