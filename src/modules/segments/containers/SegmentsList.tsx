import gql from 'graphql-tag';
import { __, Alert, withProps } from 'modules/common/utils';
import { confirm } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { SegmentsList } from '../components';
import { mutations, queries } from '../graphql';
import { RemoveMutationResponse, SegmentsQueryResponse } from '../types';

type Props = {
  contentType: string;
};

type FinalProps = {
  segmentsQuery: SegmentsQueryResponse;
} & Props &
  RemoveMutationResponse;

const SegmentListContainer = (props: FinalProps) => {
  const { segmentsQuery, removeMutation } = props;

  const removeSegment = segmentId => {
    confirm().then(() => {
      removeMutation({
        variables: { _id: segmentId }
      })
        .then(() => {
          segmentsQuery.refetch();

          Alert.success('You successfully deleted a segment');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const updatedProps = {
    ...props,
    segments: segmentsQuery.segments || [],
    removeSegment
  };

  return <SegmentsList {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, SegmentsQueryResponse, { contentType: string }>(
      gql(queries.segments),
      {
        name: 'segmentsQuery',
        options: ({ contentType }) => ({
          fetchPolicy: 'network-only',
          variables: { contentType }
        })
      }
    ),

    graphql<Props, RemoveMutationResponse, { _id: string }>(
      gql(mutations.segmentsRemove),
      {
        name: 'removeMutation'
      }
    )
  )(SegmentListContainer)
);
