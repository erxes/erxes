import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { queries, mutations } from '../graphql';
import { crudMutationsOptions } from '../utils';

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

    const messenger = message.messenger || {};
    const email = message.email || {};
    const scheduleDate = message.scheduleDate || {};

    const updatedProps = {
      ...props,
      save,
      users,
      message: {
        ...message,
        // excluding __type auto fields
        messenger: {
          brandId: messenger.brandId || '',
          kind: messenger.kind || '',
          sentAs: messenger.sentAs || ''
        },
        email: {
          templateId: email.templateId || '',
          subject: email.subject || '',
          attachments: email.attachments || []
        },
        scheduleDate: {
          type: scheduleDate.type || '',
          month: scheduleDate.month || '',
          day: scheduleDate.day || '',
          time: scheduleDate.time
        }
      }
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
          variables: {
            _id: messageId
          }
        })
      }),
      graphql(gql(queries.users), { name: 'usersQuery' }),
      graphql(gql(mutations.messagesAdd), {
        name: 'addMutation',
        options: crudMutationsOptions
      }),
      graphql(gql(mutations.messagesEdit), {
        name: 'editMutation',
        options: {
          refetchQueries: [
            ...crudMutationsOptions().refetchQueries,
            'engageMessageDetail'
          ]
        }
      })
    )(Container)
  );
};

export default withSaveAndEdit;
