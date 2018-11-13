import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import Facebook from 'modules/settings/integrations/components/facebook/Form';
import { queries } from 'modules/settings/linkedAccounts/graphql';
import * as React from 'react';
import { compose, graphql, withApollo } from 'react-apollo';
import { withRouter } from 'react-router';
import { BrandsQueryResponse } from '../../../brands/types';
import { LinkedAccountsQueryResponse } from '../../../linkedAccounts/types';
import {
  CreateFacebookMutationResponse,
  CreateFacebookMutationVariables,
  FacebookAppsListQueryResponse,
  IPages
} from '../../types';

type Props = {
  client: any;
  type?: string;
};

type FinalProps = {
  integrationFacebookAppsListQuery: FacebookAppsListQueryResponse;
  linkedAccountsQuery: LinkedAccountsQueryResponse;
  brandsQuery: BrandsQueryResponse;
} & IRouterProps &
  Props &
  CreateFacebookMutationResponse;

type State = {
  pages: IPages[];
};

class FacebookContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { pages: [] };
  }

  onAppSelect = (doc: { appId?: string; accountId?: string }) => {
    this.props.client
      .query({
        query: gql`
          query integrationFacebookPagesList(
            $appId: String
            $accountId: String
          ) {
            integrationFacebookPagesList(appId: $appId, accountId: $accountId)
          }
        `,

        variables: {
          ...doc
        }
      })

      .then(({ data, loading }) => {
        if (!loading) {
          this.setState({ pages: data.integrationFacebookPagesList });
        }
      })

      .catch(error => {
        Alert.error(error.message);
      });
  };

  render() {
    const {
      history,
      brandsQuery,
      integrationFacebookAppsListQuery,
      saveMutation,
      linkedAccountsQuery
    } = this.props;

    if (brandsQuery.loading || integrationFacebookAppsListQuery.loading) {
      return <Spinner objective={true} />;
    }

    const brands = brandsQuery.brands;
    const accounts = linkedAccountsQuery.integrationLinkedAccounts || [];

    const save = variables => {
      saveMutation({ variables })
        .then(() => {
          Alert.success('Congrats');
          history.push('/settings/integrations');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      brands,
      apps: integrationFacebookAppsListQuery.integrationFacebookAppsList,
      pages: this.state.pages,
      onAppSelect: this.onAppSelect,
      save,
      accounts
    };

    return <Facebook {...updatedProps} />;
  }
}

export default withProps<Props>(
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
    graphql<Props, FacebookAppsListQueryResponse>(
      gql`
        query integrationFacebookAppsList {
          integrationFacebookAppsList
        }
      `,
      { name: 'integrationFacebookAppsListQuery' }
    ),
    graphql<
      Props,
      CreateFacebookMutationResponse,
      CreateFacebookMutationVariables
    >(
      gql`
        mutation integrationsCreateFacebookIntegration(
          $brandId: String!
          $name: String!
          $appId: String
          $accId: String
          $pageIds: [String!]!
          $kind: String
        ) {
          integrationsCreateFacebookIntegration(
            brandId: $brandId
            name: $name
            appId: $appId
            pageIds: $pageIds
            kind: $kind
            accId: $accId
          ) {
            _id
          }
        }
      `,
      { name: 'saveMutation' }
    ),
    graphql<Props, LinkedAccountsQueryResponse>(gql(queries.linkedAccounts), {
      name: 'linkedAccountsQuery'
    }),
    withApollo
  )(withRouter<FinalProps>(FacebookContainer))
);
