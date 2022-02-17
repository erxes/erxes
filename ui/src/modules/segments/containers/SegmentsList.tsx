import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import { confirm } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import SegmentsList from '../components/SegmentsList';
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
    loading: segmentsQuery.loading,
    segments: segmentsQuery.segments || [],
    removeSegment
  };

  return <SegmentsList {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, SegmentsQueryResponse, { contentTypes: string[] }>(
      gql(queries.segments),
      {
        name: 'segmentsQuery',
        options: ({ contentType }) => ({
          fetchPolicy: 'network-only',
          variables: { contentTypes: [contentType] }
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
