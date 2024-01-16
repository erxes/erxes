import * as compose from 'lodash.flowright';

import { Counts, IRouterProps } from '@erxes/ui/src/types';
import { router, withProps } from '@erxes/ui/src/utils';

// import { withRouter } from 'react-router-dom';
import Filter from '../components/SidebarFilter';
import React from 'react';
import { SegmentsQueryResponse } from '../types';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../graphql';

type Props = {
  contentType: string;
  config?: any;
  counts: Counts;
};

type FinalProps = {
  segmentsQuery: SegmentsQueryResponse;
} & Props &
  IRouterProps;

const FilterContainer = (props: FinalProps) => {
  const { segmentsQuery, history } = props;

  const currentSegment = router.getParam(history, 'segment');

  const setSegment = (segment) => {
    router.setParams(history, { segment });
    router.removeParams(history, 'page');
  };

  const removeSegment = () => {
    router.removeParams(history, 'segment');
  };

  const extendedProps = {
    ...props,
    currentSegment,
    setSegment,
    removeSegment,
    segments: segmentsQuery.segments || [],
    loading: segmentsQuery.loading,
    treeView: true,
  };

  return <Filter {...extendedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(queries.segments), {
      name: 'segmentsQuery',
      options: ({ contentType, config }: Props) => ({
        variables: { contentTypes: [contentType], config },
      }),
    }),
  )(FilterContainer),
);
