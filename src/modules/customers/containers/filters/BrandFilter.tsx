import gql from 'graphql-tag';
import { queries } from 'modules/settings/brands/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { ISegment } from '../../../segments/types';
import { IBrand } from '../../../settings/brands/types';
import { BrandFilter } from '../../components';
import { queries as customerQueries } from '../../graphql';
import { QueryVariables } from '../CustomersList';

type CountResponse = {
  [key: string]: number;
};

type CustomerCounts = {
  byBrand: CountResponse;
  byFakeSegment: number;
  byForm: CountResponse;
  byIntegrationType: CountResponse;
  byLeadStatus: CountResponse;
  byLifecycleState: CountResponse;
  bySegment: CountResponse;
  byTag: CountResponse;
};

export type CountQueryResponse = {
  customerCounts: CustomerCounts;
  loading: boolean;
  refetch: (variables?: { byFakeSegment: ISegment } & QueryVariables) => void;
};

type BrandsQueryResponse = {
  brands: IBrand[];
  loading: boolean;
};

type Props = {
  brandsQuery: BrandsQueryResponse;
  customersCountQuery: CountQueryResponse;
  loading: boolean;
};

class BrandFilterContainer extends React.Component<Props> {
  render() {
    const { brandsQuery, customersCountQuery } = this.props;

    const counts = customersCountQuery.customerCounts || {};

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
    graphql<{}, BrandsQueryResponse, {}>(gql(queries.brands), {
      name: 'brandsQuery'
    }),
    graphql<{}, CountQueryResponse, { only: string }>(
      gql(customerQueries.customerCounts),
      {
        name: 'customersCountQuery',
        options: {
          variables: { only: 'byBrand' }
        }
      }
    )
  )(BrandFilterContainer)
);
