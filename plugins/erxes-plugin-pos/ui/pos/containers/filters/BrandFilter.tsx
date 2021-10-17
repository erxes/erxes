import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from '../../../graphql';
import { BrandsQueryResponse, Counts } from '../../../types';
import { withProps } from 'erxes-ui';
import BrandFilter from '../../components/filters/BrandFilter';

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
