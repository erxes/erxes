import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../../components/flowCategory/CategoryList';
import { mutations, queries } from '../../graphql';
import {
  FlowCategoriesCountQueryResponse,
  FlowCategoriesQueryResponse,
  FlowCategoriesRemoveMutationResponse
} from '../../types';
type Props = { history: any; queryParams: any };

type FinalProps = {
  flowCategoriesCountQuery: FlowCategoriesCountQueryResponse;
  flowCategoriesQuery: FlowCategoriesQueryResponse;
} & Props &
  FlowCategoriesRemoveMutationResponse;
class ProductListContainer extends React.Component<FinalProps> {
  render() {
    const {
      flowCategoriesCountQuery,
      flowCategoriesQuery,
      flowCategoriesRemove
    } = this.props;

    const remove = jobId => {
      confirm().then(() => {
        flowCategoriesRemove({
          variables: { _id: jobId }
        })
          .then(() => {
            flowCategoriesQuery.refetch();
            flowCategoriesCountQuery.refetch();
            Alert.success(`You successfully deleted a flow category`);
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    const flowCategories = flowCategoriesQuery.flowCategories || [];

    const updatedProps = {
      ...this.props,
      remove,
      flowCategories,
      loading: flowCategoriesQuery.loading,
      flowCategoriesCount:
        flowCategoriesCountQuery.flowCategoriesTotalCount || 0
    };

    return <List {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['flowCategories', 'flowCategoriesTotalCount', 'flows'];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<Props>(
  compose(
    graphql<Props, FlowCategoriesQueryResponse>(gql(queries.flowCategories), {
      name: 'flowCategoriesQuery',
      options: ({ queryParams }) => ({
        variables: {
          status: queryParams.status,
          parentId: queryParams.parentId,
          searchValue: queryParams.searchValue
        },
        refetchQueries: getRefetchQueries(),
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, FlowCategoriesCountQueryResponse>(
      gql(queries.flowCategoriesTotalCount),
      {
        name: 'flowCategoriesCountQuery'
      }
    ),
    graphql<Props, FlowCategoriesRemoveMutationResponse, { _id: string }>(
      gql(mutations.flowCategoriesRemove),
      {
        name: 'flowCategoriesRemove',
        options
      }
    )
  )(ProductListContainer)
);
