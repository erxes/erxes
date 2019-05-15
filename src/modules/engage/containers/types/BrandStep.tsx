import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import { CountQueryResponse } from 'modules/customers/types';
import { BrandsQueryResponse } from 'modules/settings/brands/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { BrandStep } from '../../components';
import { queries } from '../../graphql';

type Props = {
  renderContent: (
    {
      actionSelector,
      content,
      customerCounts
    }: {
      actionSelector: React.ReactNode;
      content: React.ReactNode;
      customerCounts: React.ReactNode;
    }
  ) => React.ReactNode;
  onChange: (name: 'brandId', value: string) => void;
  brandId: string;
};

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
  customerCountsQuery: CountQueryResponse;
} & Props;

const BrandStepContianer = (props: FinalProps) => {
  const { brandsQuery, customerCountsQuery } = props;

  const customerCounts = customerCountsQuery.customerCounts || {
    byBrand: {}
  };

  const updatedProps = {
    ...props,
    brands: brandsQuery.brands || [],
    counts: customerCounts.byBrand || {}
  };

  return <BrandStep {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, BrandsQueryResponse>(gql(queries.brands), {
      name: 'brandsQuery'
    }),
    graphql<Props, CountQueryResponse, { only: string }>(
      gql(queries.customerCounts),
      {
        name: 'customerCountsQuery',
        options: {
          variables: {
            only: 'byBrand'
          }
        }
      }
    )
  )(BrandStepContianer)
);
