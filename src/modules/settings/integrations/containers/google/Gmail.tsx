import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import Gmail from 'modules/settings/integrations/components/google/Gmail';
import * as React from 'react';
import { compose, graphql, withApollo } from 'react-apollo';
import { withRouter } from 'react-router';
import { BrandsQueryResponse } from '../../../brands/types';
import { mutations, queries } from '../../graphql';
import {
  AccountsQueryResponse,
  CreateGmailMutationResponse,
  CreateGmailMutationVariables,
  GetGoogleAuthUrlQueryResponse,
  LinkGmailMutationResponse,
  RemoveAccountMutationResponse
} from '../../types';

type Props = {
  client: any;
  type?: string;
  queryParams: any;
  history: any;
  gmailAuthUrlQuery: GetGoogleAuthUrlQueryResponse;
  closeModal: () => void;
} & RemoveAccountMutationResponse;

type FinalProps = {
  accountsQuery: AccountsQueryResponse;
  brandsQuery: BrandsQueryResponse;
  queryParams: any;
} & IRouterProps &
  Props &
  CreateGmailMutationResponse &
  LinkGmailMutationResponse;

class GmailContainer extends React.Component<FinalProps> {
  constructor(props: FinalProps) {
    super(props);
  }

  componentDidMount() {
    const { queryParams, accountsAddGmail, history } = this.props;

    if (queryParams && queryParams.code) {
      accountsAddGmail({
        variables: { code: queryParams.code }
      })
        .then(() => {
          history.push('/settings/integrations');
          Alert.success('Success');
        })
        .catch(() => {
          history.push('/settings/integrations');
          Alert.error('Error');
        });
    }
  }

  render() {
    const {
      history,
      brandsQuery,
      saveMutation,
      accountsQuery,
      gmailAuthUrlQuery,
      removeAccount,
      closeModal
    } = this.props;

    if (brandsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const brands = brandsQuery.brands;
    const accounts = accountsQuery.accounts || [];

    const save = (variables, callback) => {
      saveMutation({ variables })
        .then(() => {
          Alert.success('Congrats');
          callback();
          history.push('/settings/integrations');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const delink = (accountId: string) => {
      removeAccount({
        variables: { _id: accountId }
      })
        .then(() => {
          Alert.success('Success');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      closeModal,
      brands,
      save,
      delink,
      accounts,
      gmailAuthUrl: gmailAuthUrlQuery.integrationGetGoogleAuthUrl || ''
    };

    return <Gmail {...updatedProps} />;
  }
}

export default withProps<
  Props & {
    queryParams: { [key: string]: string };
    history: any;
  }
>(
  compose(
    graphql<Props, BrandsQueryResponse>(
      gql`
        query brands {
          brands {
            _id
            name
          }
        }
      `,
      {
        name: 'brandsQuery',
        options: () => ({
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, GetGoogleAuthUrlQueryResponse>(
      gql`
        query integrationGetGoogleAuthUrl {
          integrationGetGoogleAuthUrl(service: "gmail")
        }
      `,
      { name: 'gmailAuthUrlQuery' }
    ),
    graphql<Props, CreateGmailMutationResponse, CreateGmailMutationVariables>(
      gql`
        mutation integrationsCreateGmailIntegration(
          $brandId: String!
          $name: String!
          $accountId: String!
        ) {
          integrationsCreateGmailIntegration(
            brandId: $brandId
            name: $name
            accountId: $accountId
          ) {
            _id
          }
        }
      `,
      { name: 'saveMutation' }
    ),
    graphql<Props, RemoveAccountMutationResponse, { _id: string }>(
      gql(mutations.delinkAccount),
      {
        name: 'removeAccount',
        options: {
          refetchQueries: ['accounts']
        }
      }
    ),
    graphql<Props, LinkGmailMutationResponse, { code: string }>(
      gql(mutations.linkGmailAccount),
      {
        name: 'accountsAddGmail',
        options: {
          refetchQueries: ['accounts']
        }
      }
    ),
    graphql<Props, AccountsQueryResponse>(gql(queries.accounts), {
      name: 'accountsQuery',
      options: {
        variables: {
          kind: 'gmail'
        }
      }
    }),
    withApollo
  )(withRouter<FinalProps>(GmailContainer))
);
