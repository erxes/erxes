import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { UsersQueryResponse } from '../../settings/team/types';
import { mutations, queries } from '../graphql';
import {
  EngageMessageDetailQueryResponse,
  WithFormAddMutationResponse,
  WithFormEditMutationResponse,
  WithFormMutationVariables
} from '../types';
import { crudMutationsOptions } from '../utils';

type Props = {
  messageId: string;
  kind: string;
};

type FinalProps = {
  engageMessageDetailQuery: EngageMessageDetailQueryResponse;
  usersQuery: UsersQueryResponse;
} & IRouterProps &
  Props &
  WithFormAddMutationResponse &
  WithFormEditMutationResponse;

function withSaveAndEdit<IComponentProps>(Component) {
  const Container = (props: FinalProps) => {
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
    const verifiedUsers = users.filter(user => user.username) || [];

    const doMutation = (mutation, variables, msg) => {
      mutation({
        variables
      })
        .then(() => {
          Alert.success(msg);

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
        return doMutation(
          editMutation,
          { ...doc, _id: messageId },
          `You successfully updated a engagement message`
        );
      }

      return doMutation(
        addMutation,
        doc,
        `You successfully added a engagement message`
      );
    };

    const messenger = message.messenger || {
      brandId: '',
      kind: '',
      content: '',
      sentAs: '',
      rules: []
    };

    const email = message.email || {
      templateId: '',
      subject: '',
      attachments: []
    };

    const scheduleDate = message.scheduleDate || {
      type: '',
      month: '',
      day: '',
      time: ''
    };

    const updatedProps = {
      ...props,
      save,
      users: verifiedUsers,
      message: {
        ...message,
        // excluding __type auto fields
        messenger: {
          brandId: messenger.brandId,
          kind: messenger.kind,
          content: messenger.content,
          sentAs: messenger.sentAs,
          rules: messenger.rules
        },
        email: {
          templateId: email.templateId,
          subject: email.subject,
          attachments: email.attachments
        },
        scheduleDate: {
          type: scheduleDate.type,
          month: scheduleDate.month,
          day: scheduleDate.day,
          time: scheduleDate.time
        }
      }
    };

    return <Component {...updatedProps} />;
  };

  return withProps<IComponentProps>(
    compose(
      graphql<Props, EngageMessageDetailQueryResponse, { _id: string }>(
        gql(queries.engageMessageDetail),
        {
          name: 'engageMessageDetailQuery',
          options: ({ messageId }: { messageId: string }) => ({
            variables: {
              _id: messageId
            }
          })
        }
      ),
      graphql<Props, UsersQueryResponse>(gql(queries.users), {
        name: 'usersQuery'
      }),
      graphql<Props, WithFormAddMutationResponse, WithFormMutationVariables>(
        gql(mutations.messagesAdd),
        {
          name: 'addMutation',
          options: crudMutationsOptions
        }
      ),
      graphql<Props, WithFormEditMutationResponse, WithFormMutationVariables>(
        gql(mutations.messagesEdit),
        {
          name: 'editMutation',
          options: {
            refetchQueries: [
              ...crudMutationsOptions().refetchQueries,
              'engageMessageDetail'
            ]
          }
        }
      )
    )(withRouter<FinalProps>(Container))
  );
}

export default withSaveAndEdit;
