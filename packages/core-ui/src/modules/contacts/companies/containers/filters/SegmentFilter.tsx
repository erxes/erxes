import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils';
import Segments from '@erxes/ui-segments/src/containers/Filter';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../../graphql';
import { CountQueryResponse } from '../../types';
import { IAbortController } from '@erxes/ui/src/types';

const SegmentFilterContainer = (props: {
  companyCountsQuery?: CountQueryResponse;
}) => {
  const { companyCountsQuery } = props;

  const counts = (companyCountsQuery
    ? companyCountsQuery.companyCounts
    : null) || { bySegment: {} };

  return (
    <Segments contentType="core:company" counts={counts.bySegment || {}} />
  );
};

type Props = {
  loadingMainQuery: boolean;
  abortController?: IAbortController;
};

export default withProps<Props>(
  compose(
    graphql<Props, CountQueryResponse, { only: string }>(
      gql(queries.companyCounts),
      {
        name: "companyCountsQuery",
        skip: ({ loadingMainQuery }) => loadingMainQuery,
        options: ({ abortController }) => ({
          variables: { only: "bySegment" },
          context: {
            fetchoptions: { signal: abortController && abortController.signal }
          }
        })
      }
    )
  )(SegmentFilterContainer)
);
