import gql from 'graphql-tag';
import { BrandFilter } from 'modules/customers/components';
import { queries } from 'modules/settings/brands/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IBrand } from '../../../settings/brands/types';
import { queries as companyQueries } from '../../graphql';

type Props = {
  brands: IBrand[];
  companyCountsQuery: any;
  loading: boolean;
};

class BrandFilterContainer extends React.Component<Props> {
  render() {
    const { brands, loading, companyCountsQuery } = this.props;

    const counts = companyCountsQuery.companyCounts || {};

    const updatedProps = {
      ...this.props,
      brands,
      loading,
      counts: counts.byBrand || {}
    };

    return <BrandFilter {...updatedProps} />;
  }
}

export default compose(
  graphql(gql(queries.brands), {
    name: 'brandsQuery',
    props: ({ brandsQuery }: any) => ({
      brands: brandsQuery.brands || [],
      loading: brandsQuery.loading
    })
  }),
  graphql(gql(companyQueries.companyCounts), {
    name: 'companyCountsQuery',
    options: {
      variables: { only: 'byBrand' }
    }
  })
)(BrandFilterContainer);
