import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import SegmentsAA from '@erxes/ui-segments/src/containers/Filter';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import { queries } from '../graphql';

type Props = {
  itemsCountBySegmentsQuery;
};

const SegmentFilterContainer = (props: Props & WrapperProps) => {
  const { itemsCountBySegmentsQuery, type, boardId, pipelineId } = props;

  const counts = itemsCountBySegmentsQuery.itemsCountBySegments || [];

  return (
    <SegmentsAA
      contentType={type}
      config={{
        boardId,
        pipelineId
      }}
      counts={counts}
    />
  );
};

type WrapperProps = {
  type: string;
  boardId: string;
  pipelineId: string;
};

export default withProps<WrapperProps>(
  compose(
    graphql<WrapperProps>(gql(queries.itemsCountBySegments), {
      name: 'itemsCountBySegmentsQuery',
      options: ({ type, pipelineId, boardId }) => ({
        variables: { type, pipelineId, boardId }
      })
    })
  )(SegmentFilterContainer)
);
