import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import Gmail from 'modules/settings/integrations/components/google/Gmail';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { BrandsQueryResponse } from '../../../brands/types';
import { mutations } from '../../graphql';
import {
  CreateGmailMutationResponse,
  CreateGmailMutationVariables,
  GetGoogleAuthUrlQueryResponse,
  LinkGmailMutationResponse
} from '../../types';

type Props = {
  type?: string;
  queryParams: any;
  history: any;
  gmailAuthUrlQuery: GetGoogleAuthUrlQueryResponse;
  closeModal: () => void;
};

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
  queryParams: any;
} & IRouterProps &
  Props &
  CreateGmailMutationResponse &
  LinkGmailMutationResponse;

class GmailContainer extends React.Component<FinalProps> {
  componentDidMount() {
    const { queryParams, accountsAddGmail, history } = this.props;

    if (queryParams && queryParams.code) {
      accountsAddGmail({
        variables: { code: queryParams.code }
      })
        .then(() => {
          history.push('/settings/integrations');
          Alert.success('Successfully added!');
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
      gmailAuthUrlQuery,
      closeModal
    } = this.props;

    if (brandsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const brands = brandsQuery.brands;

    const save = (
      variables: CreateGmailMutationVariables,
      callback: () => void
    ) => {
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

    const updatedProps = {
      closeModal,
      brands,
      save,
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
    graphql<Props, LinkGmailMutationResponse, { code: string }>(
      gql(mutations.linkGmailAccount),
      {
        name: 'accountsAddGmail',
        options: {
          refetchQueries: ['accounts']
        }
      }
    )
  )(withRouter<FinalProps>(GmailContainer))
);
