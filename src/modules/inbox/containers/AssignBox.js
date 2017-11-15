import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import AssignBox from '../components/assignBox/AssignBox';
import { queries } from '../graphql';

const AssignBoxContainer = props => {
  const {
    usersQuery,
    conversationsQuery,
    conversationsAssign,
    conversationsUnassign
  } = props;

  if (usersQuery.loading || conversationsQuery.loading) {
    return null;
  }

  const assign = ({ targetIds, assignedUserId }, callback) => {
    const params = { conversationIds: targetIds, assignedUserId };

    conversationsAssign({ params })
      .then(() => {
        callback();
      })
      .catch(e => {
        callback(e);
      });
  };

  const clear = (conversationIds, callback) => {
    conversationsUnassign({ conversationIds })
      .then(() => {
        callback();
      })
      .catch(e => {
        callback(e);
      });
  };

  const updatedProps = {
    ...props,
    targets: conversationsQuery.conversations,
    assignees: usersQuery.users,
    assign,
    clear
  };

  return <AssignBox {...updatedProps} />;
};

AssignBoxContainer.propTypes = {
  targets: PropTypes.array,
  usersQuery: PropTypes.object,
  conversationsQuery: PropTypes.object,
  conversationsAssign: PropTypes.func,
  conversationsUnassign: PropTypes.func
};

export default compose(
  graphql(gql(queries.userList), { name: 'usersQuery' }),
  graphql(gql(queries.conversationList), {
    name: 'conversationsQuery',
    options: ({ targets }) => ({
      variables: {
        params: {
          ids: targets
        }
      }
    })
  })
)(AssignBoxContainer);
