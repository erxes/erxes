import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Messages } from '/imports/api/engage/engage';
import { Tags } from '/imports/api/tags/tags';
import { TAG_TYPES } from '/imports/api/tags/constants';
import { toggleBulk as commonToggleBulk } from '/imports/react-ui/common/utils';
import { MessageList } from '../components';

const bulk = new ReactiveVar([]);

function composer({ queryParams }, onData) {
  const messagesHandler = Meteor.subscribe('engage.messages.list', queryParams);

  Meteor.subscribe('users.list', {});
  Meteor.subscribe('customers.segments');
  Meteor.subscribe('tags.tagList', TAG_TYPES.ENGAGE_MESSAGE);

  // actions ===========
  const toggleBulk = (message, toAdd) => commonToggleBulk(bulk, message, toAdd);
  const emptyBulk = () => bulk.set([]);

  if (messagesHandler.ready()) {
    onData(null, {
      type: queryParams.type,
      messages: Messages.find().fetch(),
      tags: Tags.find({ type: TAG_TYPES.ENGAGE_MESSAGE }).fetch(),
      bulk: bulk.get(),
      toggleBulk,
      emptyBulk,
    });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(MessageList);
