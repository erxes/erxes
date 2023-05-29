import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import List from '../../components/flowCategory/CategoryList';
import { queries } from '../../graphql';
import {
  FlowCategoriesCountQueryResponse,
  FlowCategoriesQueryResponse
} from '../../types';
type Props = { history: any; queryParams: any };

type FinalProps = {
  flowCategoriesCountQuery: FlowCategoriesCountQueryResponse;
  flowCategoriesQuery: FlowCategoriesQueryResponse;
} & Props;
class ProductListContainer extends React.Component<FinalProps> {
  render() {
    const { flowCategoriesCountQuery, flowCategoriesQuery } = this.props;

    const flowCategories = flowCategoriesQuery.flowCategories || [];

    const updatedProps = {
      ...this.props,
      flowCategories,
      loading: flowCategoriesQuery.loading,
      flowCategoriesCount:
        flowCategoriesCountQuery.flowCategoriesTotalCount || 0
    };

    return <List {...updatedProps} />;
  }
}

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
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, FlowCategoriesCountQueryResponse>(
      gql(queries.flowCategoriesTotalCount),
      {
        name: 'flowCategoriesCountQuery'
      }
    )
  )(ProductListContainer)
);
