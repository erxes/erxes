import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { fromJS } from 'immutable';
import { newMessage } from '/imports/react-ui/apollo-client';
import { KIND_CHOICES } from '/imports/api/integrations/constants';
import { RespondBox } from '../components';

function composer(props, onData) {
  const sendMessage = (message, callback) => {
    const cb = (error, messageId) => {
      const integration = props.conversation.integration();

      // if conversation is messenger then notify graphql subscription
      // server that new message inserted
      if (!error && integration.kind === KIND_CHOICES.MESSENGER) {
        newMessage(messageId);
      }

      callback(error, messageId);
    };

    Meteor.call('conversations.addMessage', message, cb);
  };

  const teamMembers = [];

  Meteor.users.find().forEach(user =>
    teamMembers.push({
      _id: user._id,
      name: user.username,
      title: user.details.position,
      avatar: user.details.avatar,
    }),
  );

  onData(null, {
    conversation: props.conversation,
    sendMessage,
    teamMembers: fromJS(teamMembers),
  });
}

export default compose(getTrackerLoader(composer))(RespondBox);
