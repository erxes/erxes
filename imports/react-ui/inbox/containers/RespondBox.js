import { Meteor } from 'meteor/meteor';
import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { fromJS } from 'immutable';
import { queries } from '../graphql';
import { RespondBox } from '../components';

const RespondBoxContainer = props => {
  const { usersQuery } = props;

  const sendMessage = (message, callback) => {
    Meteor.call('conversations.addMessage', message, callback);
  };

  const teamMembers = [];

  for (let user of usersQuery.users || []) {
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
