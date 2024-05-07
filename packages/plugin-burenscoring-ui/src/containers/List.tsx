import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { router, withProps } from '@erxes/ui/src/utils';
import List from '../components/List';
import {
  BurenScoringQueryResponse,
} from '../types';
import { queries } from '../graphql';
import React from 'react';

type Props = {
  queryParams: any;
};

type FinalProps = {
  ListMainQuery: BurenScoringQueryResponse;
} & Props

class ListContainer extends React.Component<FinalProps> {
  render() {
    const { ListMainQuery } = this.props;
    const { list = [], totalCount = 0 } =
    ListMainQuery.burenCustomerScoringsMain || {};

    const updatedProps = {
      ...this.props,
      burenCustomerScorings: list || [],
      totalCount: totalCount,
      refetch: ListMainQuery.refetch(),
      loading: ListMainQuery.loading
    };
    return <List {...updatedProps} />;
}};

const generateParams = ({ queryParams }) => {
  const pageInfo = router.generatePaginationParams(queryParams || {});

  return {
    page: pageInfo.page || 1,
    perPage: pageInfo.perPage || 10,
  };
};

export default withProps<Props>(
  compose(
    graphql<Props, BurenScoringQueryResponse, {}>(gql(queries.burenCustomerScoringsMain), {
      name: 'ListMainQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams }),
        fetchPolicy: 'network-only',
      }),
    })
  )(ListContainer),
);