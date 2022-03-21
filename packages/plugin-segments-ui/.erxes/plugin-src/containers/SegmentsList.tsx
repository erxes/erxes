import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { confirm } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import SegmentsList from '../components/SegmentsList';
import { mutations, queries } from '@erxes/ui-segments/src/graphql';
import {
  RemoveMutationResponse,
  SegmentsQueryResponse
} from '@erxes/ui-segments/src/types';
import { router } from '@erxes/ui/src/utils';

type Props = {
  contentType: string;
};

type FinalProps = {
  segmentsQuery: SegmentsQueryResponse;
  getTypesQuery;
} & Props &
  RemoveMutationResponse;

const SegmentListContainer = (props: FinalProps) => {
  const { segmentsQuery, getTypesQuery, removeMutation } = props;

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

  const types = getTypesQuery.segmentsGetTypes || [];

  const updatedProps = {
    ...props,
    types,
    loading: segmentsQuery.loading,
    segments: segmentsQuery.segments || [],
    removeSegment
  };

  return <SegmentsList {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.getTypes), {
      name: 'getTypesQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
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
