import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { fromJS } from 'immutable';
import { queries, mutations } from '../graphql';
import { RespondBox } from '../components';

const RespondBoxContainer = props => {
  const { usersQuery, addMessageMutation } = props;

  const sendMessage = (variables, callback) => {
    addMessageMutation({ variables })
      .then(() => {
        callback();
      })
      .catch(e => {
        callback(e);
      });
  };

  const teamMembers = [];

  for (let user of usersQuery.users || []) {
    teamMembers.push({
      _id: user._id,
      name: user.username,
      title: user.details.position,
      avatar: user.details.avatar
    });
  }

  const updatedProps = {
    ...props,
    sendMessage,
    teamMembers: fromJS(teamMembers)
  };

  return <RespondBox {...updatedProps} />;
};

RespondBoxContainer.propTypes = {
  object: PropTypes.object,
  addMessageMutation: PropTypes.func,
  usersQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.userList), { name: 'usersQuery' }),
  graphql(gql(mutations.conversationMessageAdd), { name: 'addMessageMutation' })
)(RespondBoxContainer);
