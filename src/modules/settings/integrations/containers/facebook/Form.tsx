import client from 'apolloClient';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import Facebook from 'modules/settings/integrations/components/facebook/Form';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { BrandsQueryResponse } from '../../../brands/types';
import {
  CreateFacebookMutationResponse,
  CreateFacebookMutationVariables,
  IPages
} from '../../types';

type Props = {
  type?: string;
  closeModal: () => void;
};

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
} & IRouterProps &
  Props &
  CreateFacebookMutationResponse;

type State = {
  pages: IPages[];
  accountId?: string;
};

class FacebookContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { pages: [] };
  }

  onAccountSelect = (accountId?: string) => {
    if (!accountId) {
      return this.setState({ pages: [], accountId: '' });
    }

    client
      .query({
        query: gql(queries.integrationFacebookPageList),
        variables: { accountId }
      })

      .then(({ data, loading }: any) => {
        if (!loading) {
          this.setState({
            pages: data.integrationFacebookPagesList,
            accountId
          });
        }
      })

      .catch(error => {
        Alert.error(error.message);
      });
  };

  onRemoveAccount = () => {
    this.setState({ pages: [] });
  };

  onSave = (
    variables: CreateFacebookMutationVariables,
    callback: () => void
  ) => {
    const { history, saveMutation } = this.props;
    const { accountId } = this.state;

    if (!accountId) {
      return;
    }

    saveMutation({ variables: { ...variables, accountId } })
      .then(() => {
        callback();
        Alert.success('Congrats');
        history.push('/settings/integrations');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  render() {
    const { brandsQuery, closeModal } = this.props;

    if (brandsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const brands = brandsQuery.brands;

    const updatedProps = {
      closeModal,
      brands,
      pages: this.state.pages,
      onAccountSelect: this.onAccountSelect,
      onRemoveAccount: this.onRemoveAccount,
      onSave: this.onSave
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
    })
  )(withRouter<FinalProps>(FacebookContainer))
);
