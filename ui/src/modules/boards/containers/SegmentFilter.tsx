import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Segments from 'modules/segments/containers/Filter';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../common/utils';
import { queries } from '../graphql';

type Props = {
  itemsCountBySegmentsQuery;
};

const SegmentFilterContainer = (props: Props & WrapperProps) => {
  const { itemsCountBySegmentsQuery, type } = props;

  const counts = itemsCountBySegmentsQuery.itemsCountBySegments || [];

  return <Segments contentType={type} counts={counts} />;
};

type WrapperProps = {
  type: string;
};

export default withProps<WrapperProps>(
  compose(
    graphql<WrapperProps>(gql(queries.itemsCountBySegments), {
      name: 'itemsCountBySegmentsQuery',
      options: ({ type }) => ({
        variables: { type }
      })
    })
  )(SegmentFilterContainer)
);
