import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import { CountQueryResponse } from 'modules/customers/types';
import {
  AddMutationResponse,
  HeadSegmentsQueryResponse,
  SegmentsQueryResponse
} from 'modules/segments/types';
import { FieldsCombinedByTypeQueryResponse } from 'modules/settings/properties/types';
import React from 'react';
import { graphql } from 'react-apollo';
import SegmentStep from '../components/step/SegmentStep';
import { queries } from '../graphql';
import { sumCounts } from '../utils';

type Props = {
  segmentIds: string[];
  messageType: string;
  segmentType: string;
  onChange: (name: string, value: string[]) => void;
  renderContent: ({
    actionSelector,
    selectedComponent,
    customerCounts
  }: {
    actionSelector: React.ReactNode;
    selectedComponent: React.ReactNode;
    customerCounts: React.ReactNode;
  }) => React.ReactNode;
};

type FinalProps = {
  segmentsQuery: SegmentsQueryResponse;
  customerCountsQuery: CountQueryResponse;
  headSegmentsQuery: HeadSegmentsQueryResponse;
  combinedFieldsQuery: FieldsCombinedByTypeQueryResponse;
} & AddMutationResponse &
  Props;

const SegmentStepContainer = (props: FinalProps) => {
  const { segmentsQuery, customerCountsQuery } = props;

  const customerCounts = customerCountsQuery.customerCounts || {
    bySegment: {}
  };

  const countValues = customerCounts.bySegment || {};
  const customersCount = (ids: string[]) => sumCounts(ids, countValues);

  const count = () => {
    customerCountsQuery.refetch();
  };

  const afterSave = () => {
    segmentsQuery.refetch();
  };

  const updatedProps = {
    ...props,
    afterSave,
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
      name: 'segmentsQuery',
      options: (props: Props) => ({
        variables: {
          contentTypes: [props.segmentType]
        }
      })
    }),
    graphql<Props, CountQueryResponse, { only: string; source: string }>(
      gql(queries.customerCounts),
      {
        name: 'customerCountsQuery',
        options: {
          variables: {
            only: 'bySegment',
            source: 'engages'
          },
          fetchPolicy: 'network-only'
        }
      }
    )
  )(SegmentStepContainer)
);
