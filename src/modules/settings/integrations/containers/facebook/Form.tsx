import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import Facebook from 'modules/settings/integrations/components/facebook/Form';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql, withApollo } from 'react-apollo';
import { withRouter } from 'react-router';
import { BrandsQueryResponse } from '../../../brands/types';
import {
  AccountsQueryResponse,
  CreateFacebookMutationResponse,
  CreateFacebookMutationVariables,
  IPages,
  RemoveAccountMutationResponse
} from '../../types';

type Props = {
  client: any;
  type?: string;
  closeModal: () => void;
} & RemoveAccountMutationResponse;

type FinalProps = {
  accountsQuery: AccountsQueryResponse;
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

  onAccSelect = (doc: { accountId?: string }) => {
    this.props.client
      .query({
        query: gql(queries.integrationFacebookPageList),
        variables: doc
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
      saveMutation,
      accountsQuery,
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
      pages: this.state.pages,
      onAccSelect: this.onAccSelect,
      save,
      delink,
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
    graphql<
      Props,
      CreateFacebookMutationResponse,
      CreateFacebookMutationVariables
    >(gql(mutations.integrationsCreateFacebook), {
      name: 'saveMutation',
      options: () => {
        return {
          refetchQueries: [
            {
              query: gql(queries.integrations)
            },
            {
              query: gql(queries.integrationTotalCount)
            }
          ]
        };
      }
    }),
    graphql<Props, RemoveAccountMutationResponse, { _id: string }>(
      gql(mutations.delinkAccount),
      {
        name: 'removeAccount',
        options: {
          refetchQueries: ['accounts']
        }
      }
    ),
    graphql<Props, AccountsQueryResponse>(gql(queries.accounts), {
      name: 'accountsQuery',
      options: {
        variables: {
          kind: 'facebook'
        }
      }
    }),
    withApollo
  )(withRouter<FinalProps>(FacebookContainer))
);
