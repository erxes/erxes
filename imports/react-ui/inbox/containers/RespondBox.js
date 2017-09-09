import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { fromJS } from 'immutable';
import { mutate } from '/imports/react-ui/apollo-client';
import { RespondBox } from '../components';

function composer({ conversation }, onData) {
  const sendMessage = (message, callback) => {
    const cb = (error, messageId) => {
      // notify graphql subscription server that new message inserted
      mutate({
        mutation: `
          mutation sendMessage($messageId: String!) {
            insertMessage(messageId: $messageId) {
              _id
              content
            }
          }
        `,

        variables: {
          messageId,
        },
      });

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
    conversation,
    sendMessage,
    teamMembers: fromJS(teamMembers),
  });
}

export default compose(getTrackerLoader(composer))(RespondBox);
