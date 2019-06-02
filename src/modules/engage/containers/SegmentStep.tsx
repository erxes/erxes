import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { CountQueryResponse } from 'modules/customers/types';
import {
  AddMutationResponse,
  AddMutationVariables,
  HeadSegmentsQueryResponse,
  SegmentsQueryResponse
} from 'modules/segments/types';
import { FieldsCombinedByTypeQueryResponse } from 'modules/settings/properties/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { SegmentStep } from '../components';
import { mutations, queries } from '../graphql';
import { sumCounts } from '../utils';

type Props = {
  segmentIds: string[];
  messageType: string;
  onChange: (name: string, value: string[]) => void;
  renderContent: (
    {
      actionSelector,
      selectedComponent,
      customerCounts
    }: {
      actionSelector: React.ReactNode;
      selectedComponent: React.ReactNode;
      customerCounts: React.ReactNode;
    }
  ) => React.ReactNode;
};

type FinalProps = {
  segmentsQuery: SegmentsQueryResponse;
  customerCountsQuery: CountQueryResponse;
  headSegmentsQuery: HeadSegmentsQueryResponse;
  combinedFieldsQuery: FieldsCombinedByTypeQueryResponse;
} & AddMutationResponse &
  Props;

const SegmentStepContainer = (props: FinalProps) => {
  const {
    segmentsQuery,
    headSegmentsQuery,
    segmentsAdd,
    customerCountsQuery,
    combinedFieldsQuery
  } = props;

  const customerCounts = customerCountsQuery.customerCounts || {
    bySegment: {}
  };

  const countValues = customerCounts.bySegment || {};
  const customersCount = (ids: string[]) => sumCounts(ids, countValues);

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
    segmentsAdd({ variables: { ...doc } })
      .then(() => {
        segmentsQuery.refetch();
        customerCountsQuery.refetch();
        Alert.success('You successfully added a segment');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    headSegments: headSegmentsQuery.segmentsGetHeads || [],
    segmentFields,
    segmentAdd,
    segments: segmentsQuery.segments || [],
    targetCount: countValues,
    customersCount,
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
    graphql<Props, AddMutationResponse, AddMutationVariables>(
      gql(mutations.segmentsAdd),
      { name: 'segmentsAdd' }
    ),
    graphql<Props, FieldsCombinedByTypeQueryResponse>(
      gql(queries.combinedFields),
      { name: 'combinedFieldsQuery' }
    )
  )(SegmentStepContainer)
);
