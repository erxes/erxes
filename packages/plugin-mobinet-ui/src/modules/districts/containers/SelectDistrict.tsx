import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import React from 'react';
import { useQuery } from 'react-apollo';
import { ICoordinates } from '../../../types';

import SelectDistrict from '../components/SelectDistrict';
import { queries } from '../graphql';
import { DistrictsQueryResponse } from '../types';

type Props = {
  defaultValue: string[] | string;
  isRequired?: boolean;
  description?: string;
  cityId?: string;
  multi?: boolean;
  onChange: (value: any, center?: ICoordinates) => void;
};

const SelectDistrictsContainer = (props: Props) => {
  // const { districtsQuery } = props;

  const { data, loading } = useQuery<DistrictsQueryResponse>(
    gql(queries.districtsQuery),
    {
      variables: { cityId: props.cityId, perPage: 100 },
      fetchPolicy: 'network-only'
    }
  );

  if (loading) {
    return <Spinner objective={true} />;
  }

  const districts = (data && data.districts) || [];

  const updatedProps = {
    ...props,
    districts
  };

  return <SelectDistrict {...updatedProps} />;
};

export default SelectDistrictsContainer;
