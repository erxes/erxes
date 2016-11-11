import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import Tagger from '../components/Tagger.jsx';
import { TAG_TYPES } from '/imports/api/tags/constants';
import { Tags } from '/imports/api/tags/tags';
import { Tickets } from '/imports/api/tickets/tickets';
import { tagTicket } from '/imports/api/tickets/client/methods';


function composer(props, onData) {
  const { type } = props;

  function tag({ targetIds, tagIds }, callback) {
    switch (type) {
      case TAG_TYPES.CUSTOMER:
        return undefined;
      case TAG_TYPES.TICKET:
      default:
        return tagTicket({ ticketIds: targetIds, tagIds }, callback);
    }
  }

  const targets = Tickets.find({ _id: { $in: props.targets } }).fetch();

  const tagsHandle = Meteor.subscribe('tags.tagList', type);

  if (tagsHandle.ready()) {
    const tags = Tags.find({ type }).fetch();

    onData(null, { tags, targets, tag, type });
  }
}

export default composeWithTracker(composer)(Tagger);
