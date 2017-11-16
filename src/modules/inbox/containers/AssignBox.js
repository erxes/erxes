import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import AssignBox from '../components/assignBox/AssignBox';
import Alert from 'modules/common/utils/Alert';
import { queries, mutations } from '../graphql';

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

  const assign = (targetIds, assignedUserId) => {
    conversationsAssign({
      variables: { conversationIds: [targetIds], assignedUserId }
    })
      .then(() => {
        Alert.success('The conversation Assignee has been renewed.');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const clear = conversationIds => {
    conversationsUnassign({ variables: { _ids: [conversationIds] } })
      .then(() => {
        Alert.success('The conversation');
      })
      .catch(e => {
        Alert.error(e.message);
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
  graphql(gql(mutations.conversationsAssign), { name: 'conversationsAssign' }),
  graphql(gql(mutations.conversationsUnassign), {
    name: 'conversationsUnassign'
  }),
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
