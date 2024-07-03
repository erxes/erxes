import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src/utils';
import {
  EngageMessageDetailQueryResponse,
  IEngageMessage,
  WithFormAddMutationResponse,
  WithFormEditMutationResponse,
  WithFormMutationVariables,
} from '@erxes/ui-engage/src/types';
import React, { useState } from 'react';
import { mutations, queries } from '@erxes/ui-engage/src/graphql';

import { AllUsersQueryResponse } from '@erxes/ui/src/auth/types';
import { crudMutationsOptions } from '@erxes/ui-engage/src/utils';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { useNavigate } from 'react-router-dom';

type Props = {
  messageId: string;
  kind: string;
  businessPortalKind?: string;
};

type FinalProps = {
  engageMessageDetailQuery: EngageMessageDetailQueryResponse;
  usersQuery: AllUsersQueryResponse;
} & Props &
  WithFormAddMutationResponse &
  WithFormEditMutationResponse;

function withSaveAndEdit<IComponentProps>(Component) {
  const Container: React.FC<FinalProps> = ({
    kind,
    messageId,
    usersQuery,
    engageMessageDetailQuery,
    addMutation,
    editMutation,
  }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const message =
      engageMessageDetailQuery.engageMessageDetail || ({} as IEngageMessage);
    const users = usersQuery.allUsers || [];
    const verifiedUsers = users.filter((user) => user.username || user.email) || [];

    const doMutation = (mutation, variables, msg) => {
      setIsLoading(true);
      mutation({ variables })
        .then(() => {
          Alert.success(msg);
          navigate({
            pathname: '/campaigns',
            search: '?engageRefetchList=true',
          });
        })
        .catch(error => {
          Alert.error(error.message);
          setIsLoading(false);
        });
    };

    const save = doc => {
      doc.kind = message.kind ? message.kind : kind;
      if (messageId) {
        return doMutation(
          editMutation,
          { ...doc, _id: messageId },
          `You successfully updated a broadcast`
        );
      }

      return doMutation(
        addMutation,
        doc,
        `You successfully added a broadcast.`
      );
    };

    const messenger = message.messenger || {
      brandId: '',
      kind: '',
      content: '',
      sentAs: '',
      rules: [],
    };

    const email = message.email || {
      subject: '',
      attachments: [],
      content: '',
      replyTo: '',
      sender: '',
      templateId: '',
    };

    const notification = message.notification || {
      title: '',
      content: '',
      isMobile: false,
    };

    const scheduleDate = message.scheduleDate || null;

    const updatedProps = {
      save,
      users: verifiedUsers,
      isActionLoading: isLoading,
      kind,
      message: {
        ...message,
        // excluding __type auto fields
        messenger: {
          brandId: messenger.brandId,
          kind: messenger.kind,
          content: messenger.content,
          sentAs: messenger.sentAs,
          rules: messenger.rules,
        },
        email: {
          subject: email.subject,
          attachments: email.attachments,
          content: email.content,
          templateId: email.templateId,
          replyTo: email.replyTo,
          sender: email.sender,
        },
        notification: {
          title: notification.title,
          content: notification.content,
          isMobile: notification.isMobile,
        },
        scheduleDate: scheduleDate
          ? {
              type: scheduleDate.type,
              month: scheduleDate.month,
              day: scheduleDate.day,
              dateTime: scheduleDate.dateTime,
            }
          : null,
      },
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
              _id: messageId,
            },
          }),
        }
      ),
      graphql<Props, AllUsersQueryResponse>(gql(queries.users), {
        name: 'usersQuery',
      }),
      graphql<Props, WithFormAddMutationResponse, WithFormMutationVariables>(
        gql(mutations.messagesAdd),
        {
          name: 'addMutation',
          options: {
            refetchQueries: engageRefetchQueries({}),
          },
        }
      ),
      graphql<Props, WithFormEditMutationResponse, WithFormMutationVariables>(
        gql(mutations.messagesEdit),
        {
          name: 'editMutation',
          options: {
            refetchQueries: engageRefetchQueries({ isEdit: true }),
          },
        }
      )
    )(Container)
  );
}

export const engageRefetchQueries = ({
  isEdit,
}: {
  isEdit?: boolean;
}): string[] => [
  ...crudMutationsOptions().refetchQueries,
  ...(isEdit ? ['activityLogs'] : []),
  'engageMessageDetail',
];

export default withSaveAndEdit;
