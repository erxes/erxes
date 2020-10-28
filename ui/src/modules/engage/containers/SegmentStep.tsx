import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import { CountQueryResponse } from 'modules/customers/types';
import {
  AddMutationResponse,
  AddMutationVariables,
  HeadSegmentsQueryResponse,
  SegmentsQueryResponse
} from 'modules/segments/types';
import { FieldsCombinedByTypeQueryResponse } from 'modules/settings/properties/types';
import React from 'react';
import { graphql } from 'react-apollo';
import SegmentStep from '../components/step/SegmentStep';
import { mutations, queries } from '../graphql';
import { sumCounts } from '../utils';

type Props = {
  segmentIds: string[];
  messageType: string;
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
  const {
    segmentsQuery,
    headSegmentsQuery,
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

  const count = () => {
    customerCountsQuery.refetch();
  };

  const renderButton = ({
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    const callBackResponse = () => {
      segmentsQuery.refetch();
      customerCountsQuery.refetch();

      if (callback) {
        callback();
      }
    };

    return (
      <ButtonMutate
        mutation={mutations.segmentsAdd}
        variables={values}
        callback={callBackResponse}
        isSubmitted={isSubmitted}
        btnSize="small"
        type="submit"
        successMessage={`You successfully added a segment`}
      />
    );
  };

  const updatedProps = {
    ...props,
    headSegments: headSegmentsQuery.segmentsGetHeads || [],
    segmentFields,
    renderButton,
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
      options: {
        variables: {
          contentTypes: ['lead', 'customer', 'visitor']
        }
      }
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
