import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils';
import { CountQueryResponse } from '@erxes/ui-contacts/src/customers/types';
import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';
import {
  AddMutationResponse,
  ISegmentWithConditionDoc,
  HeadSegmentsQueryResponse,
  SegmentsQueryResponse
} from '@erxes/ui-segments/src/types';
import { FieldsCombinedByTypeQueryResponse } from '@erxes/ui-settings/src/properties/types';
import React from 'react';
import { graphql } from 'react-apollo';
import SegmentStep from '../components/step/SegmentStep';
import { mutations, queries } from '@erxes/ui-engage/src/graphql';
import { sumCounts } from '@erxes/ui-engage/src/utils';

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
    ),
    graphql<Props, HeadSegmentsQueryResponse>(gql(queries.headSegments), {
      name: 'headSegmentsQuery'
    }),
    graphql<Props, AddMutationResponse, ISegmentWithConditionDoc>(
      gql(mutations.segmentsAdd),
      { name: 'segmentsAdd' }
    ),
    graphql<Props, FieldsCombinedByTypeQueryResponse>(
      gql(formQueries.fieldsCombinedByContentType),
      {
        name: 'combinedFieldsQuery',
        options: {
          variables: {
            contentType: 'customer'
          }
        }
      }
    )
  )(SegmentStepContainer)
);
