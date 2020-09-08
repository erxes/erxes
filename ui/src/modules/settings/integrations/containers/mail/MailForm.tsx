import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import debounce from 'lodash/debounce';
import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import { IUser } from 'modules/auth/types';
import Spinner from 'modules/common/components/Spinner';
import { Alert, withProps } from 'modules/common/utils';
import { queries as messageQueries } from 'modules/inbox/graphql';
import { IMail } from 'modules/inbox/types';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { graphql } from 'react-apollo';
import MailForm from '../../components/mail/MailForm';
import { IntegrationsQueryResponse } from '../../types';
import {
  defaultCustomerFields,
  defaultMailFields,
  defaultMessageFields,
} from './constants';

type Props = {
  integrationId?: string;
  brandId?: string;
  conversationId?: string;
  refetchQueries?: string[];
  fromEmail?: string;
  mailData?: IMail;
  isReply?: boolean;
  isForward?: boolean;
  replyAll?: boolean;
  createdAt?: Date;
  toggleReply?: (toAll?: boolean) => void;
  closeModal?: () => void;
  closeReply?: () => void;
};

type FinalProps = {
  currentUser: IUser;
  sendMailMutation: any;
  integrationsQuery: IntegrationsQueryResponse;
} & Props;

const MailFormContainer = (props: FinalProps) => {
  const {
    mailData,
    conversationId,
    integrationsQuery,
    isReply,
    closeModal,
    closeReply,
    sendMailMutation,
    currentUser,
  } = props;

  if (integrationsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const integrations = integrationsQuery.integrations || [];

  const save = ({
    variables,
    optimisticResponse,
    update,
  }: {
    variables: any;
    optimisticResponse?: any;
    update?: any;
  }) => {
    return sendMailMutation({ variables, optimisticResponse, update })
      .then(() => {
        Alert.success('You have successfully sent a email');

        if (isReply && variables.shouldResolve) {
          debounce(
            () =>
              Alert.info(
                'This email conversation will be automatically moved to a resolved state.'
              ),
            3300
          )();
        }

        if (closeModal) {
          closeModal();
        }
      })
      .catch((e) => {
        Alert.error(e.message);

        if (closeModal) {
          closeModal();
        }
      });
  };

  const sendMail = ({ variables }: { variables: any }) => {
    if (!isReply) {
      return save({ variables });
    }

    const email = mailData ? mailData.integrationEmail : '';

    const integrationSendMail = {
      _id: Math.round(Math.random() * -1000000),
      ...defaultMessageFields,
      conversationId,
      videoCallData: null,
      contentType: '',
      content: variables.body,
      customer: {
        ...defaultCustomerFields,
        firstName: email,
        primaryEmail: email,
      },
      mailData: {
        ...defaultMailFields,
        bcc: [{ __typename: 'Email', email: variables.bcc }],
        to: [{ __typename: 'Email', email: variables.to }],
        from: [{ __typename: 'Email', email: variables.to }],
        cc: [{ __typename: 'Email', email: variables.cc }],
        body: variables.body,
        subject: variables.subject,
        attachments: variables.attachments,
        integrationEmail: variables.from,
      },
    };

    const optimisticResponse = { __typename: 'Mutation', integrationSendMail };

    const update = (store) => {
      const selector = {
        query: gql(messageQueries.conversationMessages),
        variables: { conversationId, limit: 10, skip: 0 },
      };

      // Read the data from our cache for this query.
      try {
        const data = store.readQuery(selector);
        const messages = data.conversationMessages || [];

        messages.push(integrationSendMail);

        // Write our data back to the cache.
        store.writeQuery({ ...selector, data });

        if (closeReply) {
          closeReply();
        }
      } catch (e) {
        Alert.error(e);
        return;
      }
    };

    // Invoke mutation
    return save({ variables, optimisticResponse, update });
  };

  const updatedProps = {
    ...props,
    sendMail,
    integrations,
    currentUser,
    emailSignatures: currentUser.emailSignatures || [],
  };

  return <MailForm {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, IntegrationsQueryResponse>(gql(queries.integrations), {
      name: 'integrationsQuery',
      options: () => {
        return {
          variables: { kind: 'mail' },
          fetchPolicy: 'network-only',
        };
      },
    }),
    graphql<Props>(gql(mutations.integrationSendMail), {
      name: 'sendMailMutation',
      options: () => ({
        refetchQueries: ['activityLogs'],
      }),
    })
  )(withCurrentUser(MailFormContainer))
);
