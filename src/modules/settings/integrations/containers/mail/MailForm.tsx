import gql from 'graphql-tag';
import Spinner from 'modules/common/components/Spinner';
import { Alert, withProps } from 'modules/common/utils';
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
    fromEmail,
    kind,
    conversationId,
    isReply,
    toggleReply,
    closeModal,
    sendMailMutation
  } = props;

  if (integrationsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const integrations = integrationsQuery.integrations || [];

  const save = ({
    variables,
    optimisticResponse,
    callback,
    update
  }: {
    variables: any;
    optimisticResponse?: any;
    callback?: (e?) => void;
    update?: any;
  }) => {
    return sendMailMutation({ variables, optimisticResponse, update })
      .then(() => {
        Alert.success('You have successfully sent a email');
        if (callback) {
          callback();
        }
      })
      .catch(e => {
        Alert.error(e);

        if (callback) {
          callback(e);
        }
      });
  };

  const sendMail = ({
    variables,
    callback
  }: {
    variables: any;
    callback?: (e?) => void;
  }) => {
    if (!isReply) {
      return save({ variables, callback });
    }

    const email = mailData ? mailData.integrationEmail : '';

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
        customer: {
          __typename: 'Customer',
          _id: Math.round(Math.random() * 1000),
          avatar: null,
          companies: null,
          customFieldsData: null,
          firstName: email,
          getMessengerCustomData: null,
          getTags: null,
          isUser: null,
          lastName: null,
          messengerData: null,
          primaryEmail: email,
          primaryPhone: null,
          tagIds: null
        },
        mailData: {
          __typename: 'MailData',
          bcc: [{ __typename: 'Email', email: variables.bcc }],
          to: [{ __typename: 'Email', email: variables.to }],
          from: [{ __typename: 'Email', email: variables.to }],
          cc: [{ __typename: 'Email', email: variables.cc }],
          body: variables.body,
          subject: variables.subject,
          accountId: Math.random(),
          messageId: Math.random(),
          attachments: variables.attachments,
          threadId: '',
          reply: null,
          replyToMessageId: null,
          replyTo: null,
          references: null,
          headerId: null,
          integrationEmail: variables.from
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

      mails.push(mail);

      // Write our data back to the cache.
      proxy.writeQuery({ ...selector, data });

      // Close modal
      if (callback) {
        callback();
      }
    };

    // Invoke mutation
    return save({ variables, optimisticResponse, update });
  };

  const updatedProps = {
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
      name: 'sendMailMutation'
    })
  )(MailFormContainer)
);
