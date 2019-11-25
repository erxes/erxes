import gql from 'graphql-tag';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps } from 'modules/common/types';
import { __, Alert, withProps } from 'modules/common/utils';
import { queries as messageQueries } from 'modules/inbox/graphql';
import { IMail } from 'modules/inbox/types';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import MailForm from '../../components/mail/MailForm';
import { IntegrationsQueryResponse } from '../../types';

type Props = {
  integrationId?: string;
  conversationId?: string;
  refetchQueries?: string[];
  fromEmail?: string;
  kind: string;
  mailData?: IMail;
  isReply?: boolean;
  toggleReply?: () => void;
  closeModal?: () => void;
};

type FinalProps = {
  sendMailMutation: any;
  integrationsQuery: IntegrationsQueryResponse;
} & Props;

const MailFormContainer = (props: FinalProps) => {
  const {
    mailData,
    integrationId,
    integrationsQuery,
    refetchQueries,
    fromEmail,
    kind,
    isReply,
    toggleReply,
    closeModal
  } = props;

  if (integrationsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const integrations = integrationsQuery.integrations || [];

  const renderButton = ({
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.integrationSendMail}
        variables={values}
        callback={callback}
        refetchQueries={refetchQueries}
        isSubmitted={isSubmitted}
        btnSize="small"
        type="submit"
        icon="message"
        successMessage="You have successfully sent a email"
      >
        {__('Send')}
      </ButtonMutate>
    );
  };

  const sendMail = ({
    variables,
    callback
  }: {
    variables: any;
    callback?: (e?) => void;
  }) => {
    const { conversationId, sendMailMutation } = props;

    const optimisticResponse = {
      __typename: 'Mutation',
      integrationSendMail: {
        __typename: 'ConversationMessage',
        _id: Math.round(Math.random() * -1000000),
        content: variables.body,
        attachments: null,
        mentionedUserIds: [],
        conversationId,
        internal: false,
        isCustomerRead: false,
        customerId: Math.random(),
        userId: Math.random(),
        createdAt: new Date(),
        messengerAppData: null,
        fromBot: false,
        formWidgetData: null,
        user: null,
        customer: null,
        mailData: {
          bcc: variables.bcc,
          to: variables.to,
          from: variables.from,
          integrationEmail: variables.from,
          messageId: Math.random(),
          references: null,
          accountId: Math.random(),
          attachments: variables.attachments,
          headerId: null,
          replyToMessageId: null,
          reply: null,
          threadId: 'alskjdaklsjdl',
          replyTo: null,
          cc: variables.cc,
          body: variables.body,
          subject: variables.subject
        }
      }
    };

    const update = (proxy, { data: { integrationSendMail } }) => {
      const mail = integrationSendMail;

      const selector = {
        query: gql(messageQueries.conversationMessages),
        variables: {
          conversationId: integrationSendMail.conversationId,
          limit: 10
        }
      };

      // Read the data from our cache for this query.
      let data;

      try {
        data = proxy.readQuery(selector);
      } catch (e) {
        return;
      }

      const mails = data.conversationMessages;

      // Add our comment from the mutation to the end.
      mails.push(mail);

      // Write our data back to the cache.
      proxy.writeQuery({ ...selector, data });
    };

    sendMailMutation({ variables, optimisticResponse, update })
      .then(() => {
        if (callback) {
          Alert.success('You have successfully sent a email');
          callback();
        }
      })
      .catch(e => {
        if (callback) {
          Alert.success(e);
          callback();
        }
      });
  };

  const updatedProps = {
    renderButton,
    sendMail,
    integrations,
    integrationId,
    fromEmail,
    closeModal,
    kind,
    isReply,
    toggleReply,
    mailData
  };

  return <MailForm {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, IntegrationsQueryResponse, { kind: string }>(
      gql(queries.integrations),
      {
        name: 'integrationsQuery',
        options: ({ kind }) => {
          return {
            variables: { kind },
            fetchPolicy: 'network-only'
          };
        }
      }
    ),
    graphql<Props>(gql(mutations.integrationSendMail), {
      name: 'sendMailMutation',
      options: {
        refetchQueries: ['conversationMessages']
      }
    })
  )(MailFormContainer)
);
