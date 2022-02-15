import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import BrandFilter from '@erxes/ui/src/brands/components/BrandFilter';
import { queries } from '@erxes/ui/src/brands/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils';
import { BrandsQueryResponse } from '@erxes/ui/src/brands/types';
import { Counts } from '@erxes/ui/src/types';

type Props = {
  counts: Counts;
};

type FinalProps = {
  brandsQuery?: BrandsQueryResponse;
} & Props;

class BrandFilterContainer extends React.Component<FinalProps> {
  render() {
    const { brandsQuery, counts } = this.props;

    const updatedProps = {
      ...this.props,
      brands: (brandsQuery ? brandsQuery.brands : null) || [],
      loading: (brandsQuery ? brandsQuery.loading : null) || false,
      counts: counts || {},
      emptyText: 'Now easier to find forms according to your brand'
    };

    return <BrandFilter {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, BrandsQueryResponse>(gql(queries.brands), {
      name: 'brandsQuery'
    })
  )(BrandFilterContainer)
);
