import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { queries, mutations } from '../graphql';

const withSaveAndEdit = Component => {
  const Container = props => {
    const {
      history,
      kind,
      messageId,
      usersQuery,
      engageMessageDetailQuery,
      addMutation,
      editMutation
    } = props;

    const message = engageMessageDetailQuery.engageMessageDetail || {};
    const users = usersQuery.users || [];

    const doMutation = (mutation, variables) => {
      mutation({
        variables
      })
        .then(() => {
          Alert.success('Congrats');
          history.push('/engage');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    // save
    const save = doc => {
      doc.kind = message.kind ? message.kind : kind;

      if (messageId) {
        return doMutation(editMutation, { ...doc, _id: messageId });
      }

      return doMutation(addMutation, doc);
    };

    const updatedProps = {
      ...props,
      save,
      users,
      message
    };

    return <Component {...updatedProps} />;
  };

  Container.propTypes = {
    messageId: PropTypes.string,
    history: PropTypes.object,
    kind: PropTypes.string,
    engageMessageDetailQuery: PropTypes.object,
    usersQuery: PropTypes.object,
    addMutation: PropTypes.func,
    editMutation: PropTypes.func
  };

  return withRouter(
    compose(
      graphql(gql(queries.engageMessageDetail), {
        name: 'engageMessageDetailQuery',
        options: ({ messageId }) => ({
          fetchPolicy: 'network-only',
          variables: {
            _id: messageId
          }
        })
      }),
      graphql(gql(queries.users), { name: 'usersQuery' }),
      graphql(gql(mutations.messagesAdd), { name: 'addMutation' }),
      graphql(gql(mutations.messagesEdit), { name: 'editMutation' })
    )(Container)
  );
};

export default withSaveAndEdit;
