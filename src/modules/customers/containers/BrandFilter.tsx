import gql from 'graphql-tag';
import { queries } from 'modules/settings/brands/graphql';
import * as React from 'react';
import { compose, graphql, NamedProps, QueryProps } from 'react-apollo';
import { IBrand } from '../../settings/brands/types';
import { BrandFilter } from '../components';

type QueryResponse = {
  brands: IBrand[],
  loading: boolean,
  counts: any,
};

class BrandFilterContainer extends React.Component<QueryResponse> {
  render() {
    const { brands, loading } = this.props;

    const updatedProps = {
      ...this.props,
      brands,
      loading
    };

    return <BrandFilter {...updatedProps} />;
  }
}

export default compose(
  graphql<{}, QueryResponse, {}, {}>(gql(queries.brands), {
    name: 'brandsQuery',
    props: ({ brandsQuery }: NamedProps<{ brandsQuery: QueryProps & QueryResponse }, {}>) => ({
      brands: brandsQuery.brands || [],
      loading: brandsQuery.loading,
    })
  })
)(BrandFilterContainer);