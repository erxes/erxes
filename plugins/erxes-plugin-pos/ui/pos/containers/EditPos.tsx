import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps, Spinner } from 'erxes-ui';
import React from 'react';
import { graphql } from 'react-apollo';
import { IRouterProps } from 'erxes-ui/lib/types';
import { queries, mutations } from '../../graphql';
import {
  EditIntegrationMutationResponse,
  EditPosMutationResponse,
  IntegrationDetailQueryResponse,
  IntegrationMutationVariables,
  PosConfigQueryResponse,
  PosDetailQueryResponse
} from '../../types';
import Pos from '../components/Pos';
import { PLUGIN_URL } from '../../constants';

type Props = {
  integrationId: string;
  queryParams: any;
};

type State = {
  isLoading: boolean;
};

type FinalProps = {
  integrationDetailQuery: IntegrationDetailQueryResponse;
  posDetailQuery: PosDetailQueryResponse;
} & Props &
  EditPosMutationResponse &
  IRouterProps;

class EditPosContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { isLoading: false };
  }

  render() {
    const {
      formId,
      integrationDetailQuery,
      posDetailQuery,
      editPosMutation,
      history
    } = this.props;

    if (integrationDetailQuery.loading) {
      return false;
    }

    const integration = integrationDetailQuery.integrationDetail || {};
    const pos = posDetailQuery.posDetail || {};
    // const categories = productCategoriesQuery.productCategories || [];

    if (integrationDetailQuery.loading || posDetailQuery.loading) {
      return <Spinner objective={true} />;
    }

    const save = doc => {
      this.setState({ isLoading: true });

      const {
        description,
        brandId,
        name,
        productDetails,
        productGroupIds
      } = doc;

      editPosMutation({
        variables: {
          _id: pos._id,
          description,
          brandId,
          name,
          productDetails,
          productGroupIds
        }
      })
        .then(() => {
          Alert.success('You successfully updated a pos');

          history.push({
            pathname: `${PLUGIN_URL}/pos`,
            search: '?refetchList=true'
          });
        })

        .catch(error => {
          Alert.error(error.message);

          this.setState({ isLoading: false });
        });
    };

    const updatedProps = {
      ...this.props,
      integration,
      pos,
      save,
      isActionLoading: this.state.isLoading
    };

    return <Pos {...updatedProps} />;
  }
}

export default withProps<FinalProps>(
  compose(
    graphql<Props, IntegrationDetailQueryResponse, { _id: string }>(
      gql(queries.integrationDetail),
      {
        name: 'integrationDetailQuery',
        options: ({ integrationId }) => ({
          fetchPolicy: 'cache-and-network',
          variables: {
            _id: integrationId
          }
        })
      }
    ),

    graphql<Props, PosDetailQueryResponse, { integrationId: string }>(
      gql(queries.posDetail),
      {
        name: 'posDetailQuery',
        options: ({ integrationId }) => ({
          fetchPolicy: 'cache-and-network',
          variables: {
            integrationId
          }
        })
      }
    ),

    graphql<
      {},
      EditPosMutationResponse,
      { _id: string } & IntegrationMutationVariables
    >(gql(mutations.posEdit), {
      name: 'editPosMutation'
    })

    // graphql<Props,EditIntegrationMutationResponse,IntegrationMutationVariables>(
    //   gql(mutations.integrationsEdit),
    //   {
    //     name: 'editIntegrationMutation',
    //     options: {
    //       refetchQueries: [
    //         'leadIntegrations',
    //         'leadIntegrationCounts',
    //         'formDetail'
    //       ]
    //     }
    //   }
    // )
  )(EditPosContainer)
);
