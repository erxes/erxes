import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import { ISegmentCondition } from 'modules/segments/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { UsersQueryResponse } from '../../settings/team/containers/UserList';
import { mutations, queries } from '../graphql';
import { crudMutationsOptions } from '../utils';
import { EngageMessageDetailQueryResponse } from './EmailStatistics';

type Props = {
  messageId: string;
  kind: string;
};

type MutationVariables = {
  name: string;
  description: string;
  subOf: string;
  color: string;
  connector: string;
  conditions: ISegmentCondition[];
};

type AddMutationResponse = {
  addMutation: (
    params: {
      variables: MutationVariables;
    }
  ) => Promise<any>;
};

type EditMutationResponse = {
  editMutation: (
    params: {
      vairables: MutationVariables;
    }
  ) => Promise<any>;
};

type FinalProps = {
  engageMessageDetailQuery: EngageMessageDetailQueryResponse;
  usersQuery: UsersQueryResponse;
} & IRouterProps &
  Props &
  AddMutationResponse &
  EditMutationResponse;

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
      users,
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
      graphql<Props, AddMutationResponse, MutationVariables>(
        gql(mutations.messagesAdd),
        {
          name: 'addMutation',
          options: crudMutationsOptions
        }
      ),
      graphql<Props, EditMutationResponse, MutationVariables>(
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
