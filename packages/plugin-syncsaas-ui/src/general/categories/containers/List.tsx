import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { Spinner } from '@erxes/ui/src/';
import { QueryResponse } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import CategoriesComponent from '../components/List';
import queries from '../graphql/queries';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  categoriesQuery: { syncedSaasCategories: any[] } & QueryResponse;
  categoriesTotalCountQuery: {
    syncedSaasCategoriesTotalCount: number;
  } & QueryResponse;
} & Props;

class Categories extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { categoriesQuery, categoriesTotalCountQuery } = this.props;

    if (categoriesQuery.loading || categoriesTotalCountQuery.loading) {
      return <Spinner />;
    }

    const updatedProps = {
      ...this.props,
      categories: categoriesQuery?.syncedSaasCategories || [],
      totalCount: categoriesTotalCountQuery.loading || 0
    };

    return <CategoriesComponent {...updatedProps} />;
  }
}

export const refetchQueries = () => [
  { query: gql(queries.categories) },
  { query: gql(queries.categoriesTotalCount) }
];

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.categories), {
      name: 'categoriesQuery'
    }),
    graphql<Props>(gql(queries.categoriesTotalCount), {
      name: 'categoriesTotalCountQuery'
    })
  )(Categories)
);
