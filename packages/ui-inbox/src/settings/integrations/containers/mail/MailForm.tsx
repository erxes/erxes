import * as React from 'react';
import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src/utils';
import { IMail, IMessage } from '@erxes/ui-inbox/src/inbox/types';
import {
  defaultCustomerFields,
  defaultMailFields,
  defaultMessageFields
} from './constants';
import { mutations, queries } from '../../graphql';

import { IUser } from '@erxes/ui/src/auth/types';
import { IntegrationsQueryResponse } from '../../types';
import MailForm from '../../components/mail/MailForm';
import Spinner from '@erxes/ui/src/components/Spinner';
import debounce from 'lodash/debounce';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries as messageQueries } from '@erxes/ui-inbox/src/inbox/graphql';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';

type Props = {
  clearOnSubmit?: boolean;
  integrationId?: string;
  brandId?: string;
  conversationId?: string;
  refetchQueries?: string[];
  fromEmail?: string;
  customerId?: string;
  mailData?: IMail;
  isReply?: boolean;
  isForward?: boolean;
  replyAll?: boolean;
  createdAt?: Date;
  mails?: IMessage[];
  messageId?: string;
  toggleReply?: (toAll?: boolean) => void;
  closeModal?: () => void;
  closeReply?: () => void;
  callback?: () => void;
};

type FinalProps = {
  currentUser: IUser;
  sendMailMutation: any;
  emailTemplatesQuery: any /*change type*/;
  emailTemplatesTotalCountQuery: any /*change type*/;
  integrationsQuery: IntegrationsQueryResponse;
} & Props;

const MailFormContainer = (props: FinalProps) => {
  const {
    mailData,
    customerId,
    conversationId,
    integrationsQuery,
    isReply,
    closeModal,
    closeReply,
    emailTemplatesQuery,
    emailTemplatesTotalCountQuery,
    sendMailMutation,
    currentUser,
    mails,
    messageId
  } = props;

  if (integrationsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const { emailTemplatesTotalCount } = emailTemplatesTotalCountQuery;

  const fetchMoreEmailTemplates = (page: number) => {
    const { fetchMore, emailTemplates } = emailTemplatesQuery;

    if (emailTemplatesTotalCount === emailTemplates.length) {
      return;
    }

    return fetchMore({
      variables: { page },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        return Object.assign({}, prev, {
          emailTemplates: [
            ...prev.emailTemplates,
            ...fetchMoreResult.emailTemplates
          ]
        });
      }
    });
  };

  const integrations = integrationsQuery.integrations || [];

  const save = ({
    variables,
    optimisticResponse,
    update,
    callback
  }: {
    variables: any;
    optimisticResponse?: any;
    callback?: () => void;
    update?: any;
  }) => {
    return sendMailMutation({
      variables: { ...variables, customerId },
      optimisticResponse,
      update
    })
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

        if (callback) {
          callback();
        }
      })
      .catch(e => {
        Alert.error(e.message);

        if (closeModal) {
          closeModal();
        }
      });
  };

  const sendMail = ({
    variables,
    callback
  }: {
    variables: any;
    callback: () => void;
  }) => {
    if (!isReply) {
      return save({ variables, callback });
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
        primaryEmail: email
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
        integrationEmail: variables.from
      }
    };

    const optimisticResponse = { __typename: 'Mutation', integrationSendMail };

    const update = store => {
      const selector = {
        query: gql(messageQueries.conversationMessages),
        variables: { conversationId, limit: 10, skip: 0 }
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
    fetchMoreEmailTemplates,
    emailTemplates: emailTemplatesQuery.emailTemplates,
    emailSignatures: currentUser.emailSignatures || [],
    totalCount: emailTemplatesTotalCount,
    mails,
    messageId
  };

  return <MailForm {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, IntegrationsQueryResponse>(gql(queries.integrations), {
      name: 'integrationsQuery',
      options: () => {
        return {
          variables: { kind: 'mail', status: 'active' },
          fetchPolicy: 'network-only'
        };
      }
    }),
    graphql<Props, any>(gql(queries.emailTemplates), {
      name: 'emailTemplatesQuery',
      options: () => ({
        variables: { page: 1 }
      })
    }),
    graphql<Props, any>(gql(queries.templateTotalCount), {
      name: 'emailTemplatesTotalCountQuery'
    }),
    graphql<Props>(gql(mutations.integrationSendMail), {
      name: 'sendMailMutation',
      options: () => ({
        refetchQueries: ['activityLogs']
      })
    })
  )(withCurrentUser(MailFormContainer))
);
