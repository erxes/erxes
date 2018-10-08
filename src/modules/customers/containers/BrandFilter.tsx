import gql from 'graphql-tag';
import { queries } from 'modules/settings/brands/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IBrand } from '../../settings/brands/types';
import { BrandFilter } from '../components';

type Props = {
  brands: IBrand[];
  loading: boolean;
  counts: any;
};

class BrandFilterContainer extends React.Component<Props> {
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
  graphql(gql(queries.brands), {
    name: 'brandsQuery',
    props: ({ brandsQuery }: any) => ({
      brands: brandsQuery.brands || [],
      loading: brandsQuery.loading
    })
  })
)(BrandFilterContainer);
