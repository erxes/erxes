import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { mutations, queries } from '../graphql';
import { crudMutationsOptions } from '../utils';

type Props = {
  messageId: string;
  history: any;
  kind: string;
  engageMessageDetailQuery: any;
  usersQuery: any;
  addMutation: (params: { vairables: any }) => Promise<any>;
  editMutation: (params: { vairables: any }) => Promise<any>;
};

const withSaveAndEdit = Component => {
  const Container = (props : Props) => {
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

  return withRouter(
    compose(
      graphql(gql(queries.engageMessageDetail), {
        name: 'engageMessageDetailQuery',
        options: ({ messageId } : { messageId: string }) => ({
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
