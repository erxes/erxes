import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { TAG_TYPES } from '/imports/api/tags/constants';
import { Tags } from '/imports/api/tags/tags';
import { Customers } from '/imports/api/customers/customers';
import { Conversations } from '/imports/api/conversations/conversations';
import Tagger from '../components/Tagger';

function composer(props, onData) {
  const { type } = props;

  function tag({ targetIds, tagIds }, callback) {
    switch (type) {
      case TAG_TYPES.CUSTOMER:
        return Meteor.call('customers.tag', { customerIds: targetIds, tagIds }, callback);
      case TAG_TYPES.CONVERSATION:
      default:
        return Meteor.call('conversations.tag', { conversationIds: targetIds, tagIds }, callback);
    }
  }

  const tagsHandle = Meteor.subscribe('tags.tagList', type);

  if (tagsHandle.ready()) {
    const collection = type === TAG_TYPES.CUSTOMER ? Customers : Conversations;
    const targets = collection
      .find({ _id: { $in: props.targets } }, { fields: { tagIds: 1 } })
      .fetch();

    const tags = Tags.find({ type }).fetch();

    onData(null, { tags, targets, tag, type });
  }
}

export default compose(getTrackerLoader(composer))(Tagger);
