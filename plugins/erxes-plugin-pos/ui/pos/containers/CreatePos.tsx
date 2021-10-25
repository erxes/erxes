import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps, Spinner } from 'erxes-ui';
import React from 'react';
import { graphql } from 'react-apollo';
import {
  AddPosMutationResponse,
  GroupsBulkInsertMutationResponse,
  IntegrationMutationVariables,
  IntegrationsQueryResponse,
  IProductGroup,
  IRouterProps
} from '../../types';
import { PLUGIN_URL } from '../../constants';
import Pos from '../components/Pos';
import { queries, mutations } from '../graphql';

type Props = { integrationsQuery: IntegrationsQueryResponse } & IRouterProps &
  AddPosMutationResponse &
  GroupsBulkInsertMutationResponse;

type State = {
  isLoading: boolean;
};

class CreatePosContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isLoading: false };
  }

  render() {
    const {
      addPosMutation,
      history,
      integrationsQuery,
      productGroupsBulkInsertMutation
    } = this.props;

    const formIntegrations = integrationsQuery.integrations || [];
    // const categories = productCategoriesQuery.productCategories || [];

    if (integrationsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const save = doc => {
      this.setState({ isLoading: true });

      addPosMutation({
        variables: {
          ...doc
        }
      })
        .then(data => {
          productGroupsBulkInsertMutation({
            variables: {
              posId: data.data.posAdd._id,
              groups: doc.groups.map(e => ({
                _id: e._id,
                name: e.name,
                description: e.description,
                categoryIds: e.categoryIds || [],
                excludedCategoryIds: e.excludedCategoryIds || [],
                excludedProductIds: e.excludedProductIds || []
              }))
            }
          });
        })
        .then(() => {
          Alert.success('You successfully added a POS');

          history.push({
            pathname: `${PLUGIN_URL}/pos`,
            search: `?refetchList`
          });
        })

        .catch(error => {
          Alert.error(error.message);

          this.setState({ isLoading: false });
        });
    };

    const updatedProps = {
      ...this.props,
      formIntegrations,
      save,
      currentMode: 'create',
      isActionLoading: this.state.isLoading
    };

    return <Pos {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<{}, AddPosMutationResponse, IntegrationMutationVariables>(
      gql(mutations.posAdd),
      {
        name: 'addPosMutation'
      }
    ),
    graphql<Props, IntegrationsQueryResponse>(gql(queries.integrations), {
      name: 'integrationsQuery',
      options: () => ({
        fetchPolicy: 'cache-and-network',
        variables: {
          kind: 'lead'
        }
      })
    }),
    graphql<
      {},
      GroupsBulkInsertMutationResponse,
      { posId: string; groups: IProductGroup[] }
    >(gql(mutations.saveProductGroups), {
      name: 'productGroupsBulkInsertMutation'
    })
  )(CreatePosContainer)
);
