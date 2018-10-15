import gql from 'graphql-tag';
import { queries } from 'modules/settings/brands/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IBrand } from '../../../settings/brands/types';
import { BrandFilter } from '../../components';
import { queries as customerQueries } from '../../graphql';

type Props = {
  brands: IBrand[];
  customersCountQuery: any;
  loading: boolean;
};

class BrandFilterContainer extends React.Component<Props> {
  render() {
    const { brands, loading, customersCountQuery } = this.props;

    const counts = customersCountQuery.customerCounts || {};

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
  graphql(gql(customerQueries.customerCounts), {
    name: 'customersCountQuery',
    options: {
      variables: { only: 'byBrand' }
    }
  })
)(BrandFilterContainer);
