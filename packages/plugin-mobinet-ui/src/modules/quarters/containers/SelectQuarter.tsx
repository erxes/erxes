import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import React from 'react';
import { useQuery } from 'react-apollo';

import SelectQuarter from '../components/SelectQuarter';
import { queries } from '../graphql';
import { QuartersQueryResponse } from '../types';

type Props = {
  defaultValue: string[] | string;
  isRequired?: boolean;
  description?: string;
  districtId?: string;
  multi?: boolean;
  onChange: (value) => void;
};

const SelectDistrictsContainer = (props: Props) => {
  // const { districtsQuery } = props;

  const { data, loading } = useQuery<QuartersQueryResponse>(
    gql(queries.quartersQuery),
    {
      variables: { districtId: props.districtId, perPage: 100 },
      fetchPolicy: 'network-only'
    }
  );

  if (loading) {
    return <Spinner objective={true} />;
  }

  const quarters = (data && data.quarters) || [];

  const updatedProps = {
    ...props,
    quarters
  };

  return <SelectQuarter {...updatedProps} />;
};

export default SelectDistrictsContainer;
