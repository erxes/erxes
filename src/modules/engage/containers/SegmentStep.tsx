import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { CountQueryResponse } from '../../customers/types';
import {
  AddMutationResponse,
  AddMutationVariables,
  HeadSegmentsQueryResponse,
  SegmentsQueryResponse
} from '../../segments/types';
import { FieldsCombinedByTypeQueryResponse } from '../../settings/properties/types';
import { SegmentStep } from '../components';
import FormBase from '../components/FormBase';
import { mutations, queries } from '../graphql';

type Props = {
  onChange: (name: 'segmentId', value: string) => void;
  segmentId: string;
};

type FinalProps = {
  segmentsQuery: SegmentsQueryResponse;
  headSegmentsQuery: HeadSegmentsQueryResponse;
  combinedFieldsQuery: FieldsCombinedByTypeQueryResponse;
  customerCountsQuery: CountQueryResponse;
} & Props &
  AddMutationResponse;

const SegmentStepContainer = (props: FinalProps) => {
  const {
    segmentsQuery,
    combinedFieldsQuery,
    headSegmentsQuery,
    customerCountsQuery,
    segmentsAdd
  } = props;

  const customerCounts = customerCountsQuery.customerCounts || {
    bySegment: {}
  };

  const segmentFields = combinedFieldsQuery.fieldsCombinedByContentType
    ? combinedFieldsQuery.fieldsCombinedByContentType.map(
        ({ name, label }) => ({
          _id: name,
          title: label,
          selectedBy: 'none'
        })
      )
    : [];

  const count = segment => {
    customerCountsQuery.refetch({
      byFakeSegment: segment
    });
  };

  const segmentAdd = ({ doc }) => {
    segmentsAdd({ variables: { ...doc } }).then(() => {
      segmentsQuery.refetch();
      customerCountsQuery.refetch();
      Alert.success('Success');
    });
  };

  const updatedProps = {
    ...props,
    headSegments: headSegmentsQuery.segmentsGetHeads || [],
    segmentFields,
    segmentAdd,
    segments: segmentsQuery.segments || [],
    customerCounts: customerCounts.bySegment || {},
    counts: customerCounts.bySegment || {},
    count
  };

  return <SegmentStep {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, SegmentsQueryResponse>(gql(queries.segments), {
      name: 'segmentsQuery'
    }),
    graphql<Props, CountQueryResponse, { only: string }>(
      gql(queries.customerCounts),
      {
        name: 'customerCountsQuery',
        options: {
          variables: {
            only: 'bySegment'
          }
        }
      }
    ),
    graphql<Props, HeadSegmentsQueryResponse>(gql(queries.headSegments), {
      name: 'headSegmentsQuery'
    }),
    graphql<Props, FieldsCombinedByTypeQueryResponse>(
      gql(queries.combinedFields),
      { name: 'combinedFieldsQuery' }
    ),
    graphql<Props, AddMutationResponse, AddMutationVariables>(
      gql(mutations.segmentsAdd),
      { name: 'segmentsAdd' }
    )
  )(SegmentStepContainer)
);
