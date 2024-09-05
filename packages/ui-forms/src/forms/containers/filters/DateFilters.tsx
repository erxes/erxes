import { gql } from '@apollo/client';
import React from 'react';
import { useQuery } from '@apollo/client';

import { queries } from '../../graphql';
import DateFilters from '../../components/filters/DateFilters';

type Props = {
  loadingMainQuery: boolean;
  type: string;
};

const DateFiltersContainer = (props: Props) => {
  const { data, loading } = useQuery(gql(queries.fieldsCombinedByContentType), {
    variables: { contentType: props.type, onlyDates: true }
  });

  const updatedProps = {
    ...props,
    fields: (data && (data.fieldsCombinedByContentType || [])) || [],
    loading: loading || false,
    counts: {}
  };
  return <DateFilters {...updatedProps} />;
};

export default DateFiltersContainer;
