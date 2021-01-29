import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import BrandFilter from 'modules/customers/components/list/BrandFilter';
import { queries as brandsQueries } from 'modules/settings/brands/graphql';
import { INTEGRATION_KINDS } from 'modules/settings/integrations/constants';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { BrandsQueryResponse } from '../../../settings/brands/types';
import { queries } from '../../graphql';
import { CountQueryResponse } from '../../types';

type Props = {
  queryParams: any;
  refetch?: () => void;
};

type FinalProps = {
  brandsQuery?: BrandsQueryResponse;
  integrationsTotalCountQuery: CountQueryResponse;
} & Props;

class BrandFilterContainer extends React.Component<FinalProps> {
  render() {
    const {
      brandsQuery,
      integrationsTotalCountQuery,
      refetch,
      queryParams
    } = this.props;

    const counts = (integrationsTotalCountQuery
      ? integrationsTotalCountQuery.integrationsTotalCount
      : null) || { byBrand: {} };

    const updatedProps = {
      ...this.props,
      brands: (brandsQuery ? brandsQuery.brands : null) || [],
      loading: (brandsQuery ? brandsQuery.loading : null) || false,
      counts: counts.byBrand || {}
    };

    if (refetch) {
      this.refetch();
    }

    return <BrandFilter {...updatedProps} />;
  }

  refetch() {
    const { integrationsTotalCountQuery } = this.props;
    integrationsTotalCountQuery.refetch();
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, BrandsQueryResponse>(gql(brandsQueries.brands), {
      name: 'brandsQuery',
      skip: ({ queryParams }) => queryParams.loadingMainQuery
    }),
    graphql<Props, CountQueryResponse>(gql(queries.integrationsTotalCount), {
      name: 'integrationsTotalCountQuery',
      skip: ({ queryParams }) => queryParams.loadingMainQuery,
      options: ({ queryParams }) => ({
        variables: {
          kind: INTEGRATION_KINDS.LEAD,
          tag: queryParams.queryParams.tag,
          status: queryParams.queryParams.status,
          brandId: queryParams.queryParams.brand
        }
      })
    })
  )(BrandFilterContainer)
);
