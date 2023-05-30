import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import BrandFilter from '@erxes/ui/src/brands/components/BrandFilter';
import { queries } from '@erxes/ui/src/brands/graphql';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import { BrandsQueryResponse } from '@erxes/ui/src/brands/types';
import { queries as companyQueries } from '../../graphql';
import { CountQueryResponse } from '../../types';

type FinalProps = {
  brandsQuery?: BrandsQueryResponse;
  companyCountsQuery?: CountQueryResponse;
} & Props;

class BrandFilterContainer extends React.Component<FinalProps> {
  render() {
    const { companyCountsQuery, brandsQuery } = this.props;

    const counts = (companyCountsQuery
      ? companyCountsQuery.companyCounts
      : null) || { byBrand: {} };

    const updatedProps = {
      ...this.props,
      brands: (brandsQuery ? brandsQuery.brands : null) || [],
      loading: (brandsQuery ? brandsQuery.loading : null) || false,
      counts: counts.byBrand || {}
    };

    return <BrandFilter {...updatedProps} />;
  }
}

type Props = {
  loadingMainQuery: boolean;
};

export default withProps<Props>(
  compose(
    graphql<Props, BrandsQueryResponse>(gql(queries.brands), {
      name: 'brandsQuery',
      skip: ({ loadingMainQuery }) => loadingMainQuery
    }),
    graphql<Props, CountQueryResponse, { only: string }>(
      gql(companyQueries.companyCounts),
      {
        name: 'companyCountsQuery',
        skip: ({ loadingMainQuery }) => loadingMainQuery,
        options: {
          variables: { only: 'byBrand' }
        }
      }
    )
  )(BrandFilterContainer)
);
