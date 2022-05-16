import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Segments from '@erxes/ui-segments/src/containers/Filter';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils';
// import { queries as customerQueries } from "@erxes/ui-contacts/src/customers/graphql";
import { queries } from '../graphql';

type Props = {
  carCountQuery?: any;
};

const SegmentFilterContainer = (props: Props & WrapperProps) => {
  const { carCountQuery } = props;

  //   const counts = (carCountQuery
  //     ? carCountQuery.customerCounts
  //     : null) || { bySegment: {} };

  console.log(carCountQuery);

  return <Segments contentType={'tumentech:car'} counts={{}} />;
};

type WrapperProps = {
  loadingMainQuery: boolean;
};

export default withProps<WrapperProps>(
  compose(
    graphql<WrapperProps, any, { only: string }>(gql(queries.carCounts), {
      name: 'carCountQuery',
      skip: ({ loadingMainQuery }) => loadingMainQuery,
      options: () => ({
        variables: { type: 'car', only: 'bySegment' }
      })
    })
  )(SegmentFilterContainer)
);
