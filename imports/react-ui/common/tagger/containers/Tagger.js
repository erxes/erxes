import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { TAG_TYPES } from '/imports/api/tags/constants';
import { Tags } from '/imports/api/tags/tags';
import { Customers } from '/imports/api/customers/customers';
import { Conversations } from '/imports/api/conversations/conversations';
import { Messages } from '/imports/api/engage/engage';
import Tagger from '../components/Tagger';

function composer(props, onData) {
  const { type } = props;

  function tag({ targetIds, tagIds }, callback) {
    const params = [{ targetIds, tagIds }, callback];

    let methodName = 'conversations.tag';

    if (type === TAG_TYPES.CUSTOMER) {
      methodName = 'customers.tag';
    }

    if (type === TAG_TYPES.ENGAGE_MESSAGE) {
      methodName = 'engage.messages.tag';
    }

    return Meteor.call(methodName, ...params);
  }

  let collection = Conversations;

  if (type === TAG_TYPES.CUSTOMER) {
    collection = Customers;
  }

  if (type === TAG_TYPES.ENGAGE_MESSAGE) {
    collection = Messages;
  }

  // TODO: Refactor this section. Why do we need full objects instead of ids?
  const targets = collection.find({ _id: { $in: props.targets } }).fetch();

  const tagsHandle = Meteor.subscribe('tags.tagList', type);

  if (tagsHandle.ready()) {
    const tags = Tags.find({ type }).fetch();

    onData(null, { tags, targets, tag, type });
  }
}

export default compose(getTrackerLoader(composer))(Tagger);
