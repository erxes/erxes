import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Messages } from '/imports/api/engage/engage';
import { MessageList } from '../components';

const bulk = new ReactiveVar([]);

function composer({ type }, onData) {
  const messagesHandler = Meteor.subscribe('engage.messages.list', { type });
  Meteor.subscribe('users.list', {});
  Meteor.subscribe('customers.segments');

  // actions ===========
  const toggleBulk = (message, toAdd) => {
    let entries = bulk.get();

    // remove old entry
    entries = _.without(entries, _.findWhere(entries, { _id: message._id }));

    if (toAdd) {
      entries.push(message);
    }

    bulk.set(entries);
  };

  const emptyBulk = () => {
    bulk.set([]);
  };

  if (messagesHandler.ready()) {
    onData(null, {
      type,
      messages: Messages.find().fetch(),
      bulk: bulk.get(),
      toggleBulk,
      emptyBulk,
    });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(MessageList);
