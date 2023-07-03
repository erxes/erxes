import * as React from 'react';
import client from '@erxes/ui/src/apolloClient';
import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src/utils';
import { IMail, IMessage } from '@erxes/ui-inbox/src/inbox/types';
import { mutations, queries } from '../../graphql';

import { IUser } from '@erxes/ui/src/auth/types';
import MailForm from '../../components/mail/MailForm';
import debounce from 'lodash/debounce';
import { queries as engageQueries } from '@erxes/ui-engage/src/graphql';
import { mutations as engageMutations } from '@erxes/ui-engage/src/graphql';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import queryString from 'query-string';
import { IRouterProps } from '@erxes/ui/src/types';
import { withRouter } from 'react-router-dom';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  detailQuery?: any;
  source?: 'inbox' | 'engage';
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
  queryParams?: any;
  shrink?: boolean;
  clear?: boolean;
} & IRouterProps;

type FinalProps = {
  currentUser: IUser;
  emailTemplatesQuery: any /*change type*/;
  emailTemplatesTotalCountQuery: any /*change type*/;
} & Props;

class MailFormContainer extends React.Component<
  FinalProps,
  {
    loadedEmails: boolean;
    verifiedImapEmails: string[];
    verifiedEngageEmails: string[];
  }
> {
  constructor(props: FinalProps) {
    super(props);

    this.state = {
      loadedEmails: false,
      verifiedImapEmails: [],
      verifiedEngageEmails: []
    };
  }

  render() {
    const {
      detailQuery,
      integrationId,
      customerId,
      conversationId,
      isReply,
      closeModal,
      emailTemplatesQuery,
      emailTemplatesTotalCountQuery,
      currentUser,
      mails,
      messageId
    } = this.props;

    const {
      loadedEmails,
      verifiedImapEmails,
      verifiedEngageEmails
    } = this.state;

    if (!loadedEmails) {
      if (isEnabled('engages')) {
        client
          .query({
            query: gql(engageQueries.verifiedEmails)
          })
          .then(({ data }) => {
            this.setState({
              loadedEmails: true,
              verifiedEngageEmails: data.engageVerifiedEmails || []
            });
          })
          .catch(() => {
            this.setState({ loadedEmails: true, verifiedEngageEmails: [] });
          });
      }
      if (isEnabled('imap')) {
        client
          .query({
            query: gql(queries.imapIntegrations),
            variables: {
              kind: 'imap'
            }
          })
          .then(({ data }) => {
            const emails: string[] = [];

            for (const integration of data.imapGetIntegrations || []) {
              if (integration.user && !emails.includes(integration.user)) {
                emails.push(integration.user);
              }

              if (
                integration.mainUser &&
                !emails.includes(integration.mainUser)
              ) {
                emails.push(integration.mainUser);
              }
            }

            this.setState({
              loadedEmails: true,
              verifiedImapEmails: emails
            });
          })
          .catch(() => {
            this.setState({ loadedEmails: true, verifiedImapEmails: [] });
          });
      }
    }

    const { emailTemplatesTotalCount } =
      emailTemplatesTotalCountQuery || ({} as any);

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

    const save = ({
      mutation,
      variables,
      callback
    }: {
      mutation: string;
      variables: any;
      callback?: () => void;
    }) => {
      return client
        .mutate({
          mutation: gql(mutation),
          refetchQueries: ['activityLogs'],
          variables: {
            ...variables,
            integrationId,
            conversationId,
            customerId
          }
        })
        .then(() => {
          if (detailQuery) {
            detailQuery.refetch();
          }

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

          if (callback) {
            callback();
          }

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
      let sendEmailMutation = mutations.imapSendMail;

      if (!variables.replyToMessageId) {
        sendEmailMutation = engageMutations.sendMail;
      }

      if (!isReply) {
        return save({ mutation: sendEmailMutation, variables, callback });
      }

      // Invoke mutation
      return save({
        mutation: sendEmailMutation,
        variables,
        callback
      });
    };

    const updatedProps = {
      ...this.props,
      sendMail,
      currentUser,
      fetchMoreEmailTemplates,
      emailTemplates: emailTemplatesQuery?.emailTemplates || [],
      emailSignatures: currentUser.emailSignatures || [],
      totalCount: emailTemplatesTotalCount,
      mails,
      messageId,
      verifiedImapEmails: verifiedImapEmails || [],
      verifiedEngageEmails: verifiedEngageEmails || []
    };

    return <MailForm {...updatedProps} />;
  }
}

const WithMailForm = withProps<Props>(
  compose(
    graphql<Props, any>(gql(queries.emailTemplates), {
      name: 'emailTemplatesQuery',
      options: ({ queryParams }) => ({
        variables: {
          searchValue: queryParams.emailTemplatesSearch || ''
        },
        fetchPolicy: 'cache-first'
      }),
      skip: !isEnabled('emailtemplates')
    }),
    graphql<Props, any>(gql(queries.templateTotalCount), {
      name: 'emailTemplatesTotalCountQuery',
      options: ({ queryParams }) => ({
        variables: {
          searchValue: queryParams.emailTemplatesSearch || ''
        },
        fetchPolicy: 'cache-first'
      }),
      skip: !isEnabled('emailtemplates')
    })
  )(withCurrentUser(MailFormContainer))
);

const WithQueryParams = (props: Props) => {
  const { location } = props;
  const queryParams = queryString.parse(location.search);

  const extendedProps = { ...props, queryParams };

  return <WithMailForm {...extendedProps} />;
};

export default withRouter<Props>(WithQueryParams);
