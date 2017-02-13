import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import { fromJS } from 'immutable';
import { newMessage } from '/imports/react-ui/apollo-client';
import { KIND_CHOICES } from '/imports/api/integrations/constants';
import { RespondBox } from '../components';

function composer(props, onData) {
  const sendMessage = (message, callback) => {
    const cb = (error, messageId) => {
      const integration = props.conversation.integration();

      // if conversation is in app messaging then notify graphql subscription
      // server that new message inserted
      if (!error && integration.kind === KIND_CHOICES.IN_APP_MESSAGING) {
        newMessage(messageId);
      }

      callback(error, messageId);
    };

    Meteor.call('conversations.addMessage', message, cb);
  };

  const teamMembers = [];

  Meteor.users.find().forEach(user => (
    teamMembers.push({
      _id: user._id,
      name: user.username,
      fullName: user.details.fullName,
      avatar: user.details.avatar,
    })
  ));

  onData(null, {
    conversation: props.conversation,
    sendMessage,
    teamMembers: fromJS(teamMembers),
  });
}

export default composeWithTracker(composer)(RespondBox);
