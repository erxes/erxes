import React from "react";
import SegmentStep from "../components/step/SegmentStep";
import { gql } from "@apollo/client";
import { queries } from "@erxes/ui-engage/src/graphql";
import { sumCounts } from "@erxes/ui-engage/src/utils";
import { useQuery } from "@apollo/client";
import { SegmentsQueryResponse } from "@erxes/ui-segments/src/types";
import { CountQueryResponse } from "@erxes/ui-contacts/src/customers/types";

type Props = {
  segmentIds: string[];
  messageType: string;
  segmentType: string;
  onChange: (name: string, value: string[]) => void;
  renderContent: ({
    actionSelector,
    selectedComponent,
    customerCounts,
  }: {
    actionSelector: React.ReactNode;
    selectedComponent: React.ReactNode;
    customerCounts: React.ReactNode;
  }) => React.ReactNode;
};

const SegmentStepContainer = (props: Props) => {
  const segmentsQuery = useQuery<SegmentsQueryResponse>(gql(queries.segments), {
    variables: {
      contentTypes: [props.segmentType],
    },
  });

  const customerCountsQuery = useQuery<CountQueryResponse>(
    gql(queries.customerCounts),
    {
      variables: {
        only: "bySegment",
        source: "engages",
      },
      fetchPolicy: "network-only",
    }
  );

  const customerCounts = (customerCountsQuery.data &&
    customerCountsQuery.data.customerCounts) || {
    bySegment: {},
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
    segments: (segmentsQuery.data && segmentsQuery.data.segments) || [],
    targetCount: countValues,
    customersCount,
    count,
    loading: segmentsQuery.loading,
    loadingCount: customerCountsQuery.loading,
  };

  return <SegmentStep {...updatedProps} />;
};

export default SegmentStepContainer;
