import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IRouterProps } from 'erxes-ui/lib/types';
import { Alert, withProps } from 'erxes-ui/lib/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
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
  usersQuery: any;
} & IRouterProps &
  Props &
  WithFormAddMutationResponse &
  WithFormEditMutationResponse;

function withSaveAndEdit<IComponentProps>(Component) {
  class Container extends React.Component<FinalProps, { isLoading: boolean }> {
    constructor(props: FinalProps) {
      super(props);

      this.state = {
        isLoading: false
      };
    }

    render() {
      const {
        history,
        kind,
        messageId,
        usersQuery,
        engageMessageDetailQuery,
        addMutation,
        editMutation
      } = this.props;

      const message = engageMessageDetailQuery.engageMessageDetail || {};
      const users = usersQuery.allUsers || [];
      const verifiedUsers = users.filter(user => user.username) || [];

      const doMutation = (mutation, variables, msg) => {
        this.setState({ isLoading: true });

        mutation({
          variables
        })
          .then(() => {
            Alert.success(msg);

            history.push({
              pathname: '/campaigns',
              search: '?engageRefetchList=true'
            });
          })
          .catch(error => {
            Alert.error(error.message);

            this.setState({ isLoading: false });
          });
      };

      // save
      const save = doc => {
        doc.kind = message.kind ? message.kind : kind;

        if (messageId) {
          return doMutation(
            editMutation,
            { ...doc, _id: messageId },
            `You successfully updated a campaign`
          );
        }

        return doMutation(
          addMutation,
          doc,
          `You successfully added a campaign`
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
        subject: '',
        attachments: [],
        content: '',
        templateId: ''
      };

      const scheduleDate = message.scheduleDate;

      const updatedProps = {
        ...this.props,
        save,
        users: verifiedUsers,
        isActionLoading: this.state.isLoading,
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
            subject: email.subject,
            attachments: email.attachments,
            content: email.content,
            templateId: email.templateId
          },
          scheduleDate: scheduleDate
            ? {
                type: scheduleDate.type,
                month: scheduleDate.month,
                day: scheduleDate.day,
                dateTime: scheduleDate.dateTime
              }
            : null
        }
      };

      return <Component {...updatedProps} />;
    }
  }

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
      graphql<Props, any>(gql(queries.users), {
        name: 'usersQuery'
      }),
      graphql<Props, WithFormAddMutationResponse, WithFormMutationVariables>(
        gql(mutations.messagesAdd),
        {
          name: 'addMutation',
          options: {
            refetchQueries: engageRefetchQueries({})
          }
        }
      ),
      graphql<Props, WithFormEditMutationResponse, WithFormMutationVariables>(
        gql(mutations.messagesEdit),
        {
          name: 'editMutation',
          options: {
            refetchQueries: engageRefetchQueries({ isEdit: true })
          }
        }
      )
    )(withRouter<FinalProps>(Container))
  );
}

export const engageRefetchQueries = ({
  isEdit
}: {
  isEdit?: boolean;
}): string[] => [
  ...crudMutationsOptions().refetchQueries,
  ...(isEdit ? ['activityLogs'] : []),
  'engageMessageDetail'
];

export default withSaveAndEdit;
