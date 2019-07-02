import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import { queries as brandQueries } from 'modules/settings/brands/graphql';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../brands/types';
import { List } from '../components';

type Props = {
  listQuery: BrandsQueryResponse;
};

const ListContainer = (props: Props) => {
  const { listQuery } = props;

  const brands = listQuery.brands || [];

  const updatedProps = {
    ...props,
    refetch: listQuery.refetch,
    brands
  };

  return <List {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, BrandsQueryResponse, {}>(gql(brandQueries.brands), {
      name: 'listQuery'
    })
  )(ListContainer)
);
