import { Meteor } from 'meteor/meteor';
import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { fromJS } from 'immutable';
import { mutate } from '/imports/react-ui/apollo-client';
import { Loader } from '/imports/react-ui/common';
import { queries, mutations } from '../graphql';
import { RespondBox } from '../components';

const RespondBoxContainer = props => {
  const { usersQuery } = props;

  if (usersQuery.loading) {
    return <Loader />;
  }

  const sendMessage = (message, callback) => {
    const cb = (error, messageId) => {
      // notify graphql subscription server that new message inserted
      mutate({ mutation: mutations.sendMessage, variables: { messageId } });

      callback(error, messageId);
    };

    Meteor.call('conversations.addMessage', message, cb);
  };

  const teamMembers = [];

  for (let user of usersQuery.users) {
    teamMembers.push({
      _id: user._id,
      name: user.username,
      title: user.details.position,
      avatar: user.details.avatar,
    });
  }

  const updatedProps = {
    ...props,
    sendMessage,
    teamMembers: fromJS(teamMembers),
  };

  return <RespondBox {...updatedProps} />;
};

RespondBoxContainer.propTypes = {
  object: PropTypes.object,
  usersQuery: PropTypes.object,
};

export default compose(graphql(gql(queries.userList), { name: 'usersQuery' }))(RespondBoxContainer);
