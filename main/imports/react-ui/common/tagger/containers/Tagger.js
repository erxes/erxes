import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import Tagger from '../components/Tagger.jsx';
import { Spinner } from '../..';
import { TAG_TYPES } from '/imports/api/tags/constants';
import { Tags } from '/imports/api/tags/tags';
import { Conversations } from '/imports/api/conversations/conversations';
import { tagConversation } from '/imports/api/conversations/client/methods';


function composer(props, onData) {
  const { type } = props;

  function tag({ targetIds, tagIds }, callback) {
    switch (type) {
      case TAG_TYPES.CUSTOMER:
        return undefined;
      case TAG_TYPES.CONVERSATION:
      default:
        return tagConversation({ conversationIds: targetIds, tagIds }, callback);
    }
  }

  const targets = Conversations.find({ _id: { $in: props.targets } }).fetch();

  const tagsHandle = Meteor.subscribe('tags.tagList', type);

  if (tagsHandle.ready()) {
    const tags = Tags.find({ type }).fetch();

    onData(null, { tags, targets, tag, type });
  }
}

export default composeWithTracker(composer, Spinner)(Tagger);
