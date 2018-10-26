import gql from 'graphql-tag';
import { BrandFilter } from 'modules/customers/components';
import { queries } from 'modules/settings/brands/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { BrandsQueryResponse } from '../../../settings/brands/types';
import { queries as companyQueries } from '../../graphql';
import { CountQueryResponse } from '../../types';

type Props = {
  brandsQuery: BrandsQueryResponse;
  companyCountsQuery: any;
  loading: boolean;
};

class BrandFilterContainer extends React.Component<Props> {
  render() {
    const { companyCountsQuery, brandsQuery } = this.props;

    const counts = companyCountsQuery.companyCounts || {};

    const updatedProps = {
      ...this.props,
      brands: brandsQuery.brands || [],
      loading: brandsQuery.loading,
      counts: counts.byBrand || {}
    };

    return <BrandFilter {...updatedProps} />;
  }
}

export default withProps<{}>(
  compose(
    graphql<Props, BrandsQueryResponse>(gql(queries.brands), {
      name: 'brandsQuery'
    }),
    graphql<Props, CountQueryResponse, { only: string }>(
      gql(companyQueries.companyCounts),
      {
        name: 'companyCountsQuery',
        options: {
          variables: { only: 'byBrand' }
        }
      }
    )
  )(BrandFilterContainer)
);
