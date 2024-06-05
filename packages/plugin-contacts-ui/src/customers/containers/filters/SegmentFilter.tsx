import { gql, useQuery } from "@apollo/client";
import Segments from "@erxes/ui-segments/src/containers/Filter";
import React from "react";
import { queries as customerQueries } from "@erxes/ui-contacts/src/customers/graphql";
import { CountQueryResponse } from "@erxes/ui-contacts/src/customers/types";

type Props = {
  abortController?: any;
  type: string;
  loadingMainQuery: boolean;
};

const SegmentFilterContainer = (props: Props & WrapperProps) => {
  const { loadingMainQuery, abortController, type } = props;

  const customersCountQuery = useQuery<CountQueryResponse>(
    gql(customerQueries.customerCounts),
    {
      skip: loadingMainQuery,
      variables: { type, only: "bySegment" },
      context: {
        fetchOptions: { signal: abortController && abortController.signal },
      },
    }
  );

  const counts = (customersCountQuery
    ? customersCountQuery?.data?.customerCounts
    : null) || { bySegment: {} };

  return (
    <Segments
      contentType={`contacts:${type}`}
      counts={counts.bySegment || {}}
    />
  );
};

type WrapperProps = {
  abortController?: any;
  type: string;
  loadingMainQuery: boolean;
};

export default SegmentFilterContainer;
