import gql from 'graphql-tag';
import React from 'react';
import { useQuery } from 'react-apollo';

import DateFilters from '../components/DateFilters';
import { queries } from '../graphql';

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
