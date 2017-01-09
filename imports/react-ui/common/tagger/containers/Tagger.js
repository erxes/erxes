import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import Tagger from '../components/Tagger.jsx';
import { Spinner } from '../..';
import { TAG_TYPES } from '/imports/api/tags/constants';
import { Tags } from '/imports/api/tags/tags';
import { Customers } from '/imports/api/customers/customers';
import { Conversations } from '/imports/api/conversations/conversations';
import { tagConversation } from '/imports/api/conversations/client/methods';


function composer(props, onData) {
  const { type } = props;

  function tag({ targetIds, tagIds }, callback) {
    switch (type) {
      case TAG_TYPES.CUSTOMER:
        return Meteor.call('customers.tag', { customerIds: targetIds, tagIds }, callback);
      case TAG_TYPES.CONVERSATION:
      default:
        return tagConversation({ conversationIds: targetIds, tagIds }, callback);
    }
  }

  // TODO: Refactor this section. Why do we need full objects instead of ids?
  const collection = type === TAG_TYPES.CUSTOMER ? Customers : Conversations;
  const targets = collection.find({ _id: { $in: props.targets } }).fetch();

  const tagsHandle = Meteor.subscribe('tags.tagList', type);

  if (tagsHandle.ready()) {
    const tags = Tags.find({ type }).fetch();

    onData(null, { tags, targets, tag, type });
  }
}

export default composeWithTracker(composer, Spinner)(Tagger);
