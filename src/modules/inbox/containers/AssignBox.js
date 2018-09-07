import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import AssignBox from '../components/assignBox/AssignBox';
import Alert from 'modules/common/utils/Alert';
import { queries, mutations } from '../graphql';
import { refetchSidebarConversationsOptions } from '../utils';

const AssignBoxContainer = props => {
  const { usersQuery, assignMutation, conversationsUnassign } = props;

  if (usersQuery.loading) {
    return null;
  }

  const assign = ({ conversationIds, assignedUserId }) => {
    assignMutation({
      variables: {
        conversationIds,
        assignedUserId
      }
    })
      .then(() => {
        Alert.success('The conversation Assignee has been renewed.');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const clear = conversationIds => {
    conversationsUnassign({
      variables: {
        _ids: [conversationIds]
      }
    })
      .then(() => {
        Alert.success('The conversation Assignee removed');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    assignees: usersQuery.users || [],
    assign,
    clear
  };

  return <AssignBox {...updatedProps} />;
};

AssignBoxContainer.propTypes = {
  targets: PropTypes.array,
  usersQuery: PropTypes.object,
  assignMutation: PropTypes.func,
  conversationsUnassign: PropTypes.func
};

export default compose(
  graphql(gql(queries.userList), { name: 'usersQuery' }),
  graphql(gql(mutations.conversationsAssign), {
    name: 'assignMutation',
    options: () => refetchSidebarConversationsOptions()
  }),
  graphql(gql(mutations.conversationsUnassign), {
    name: 'conversationsUnassign',
    options: () => refetchSidebarConversationsOptions()
  })
)(AssignBoxContainer);
