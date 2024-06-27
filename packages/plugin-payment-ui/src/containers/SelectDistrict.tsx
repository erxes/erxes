import { ChildProps } from '@apollo/client/react/hoc';
import Spinner from '@erxes/ui/src/components/Spinner';
import React from 'react';

import { useQuery } from '@apollo/client';
import SelectDistrict from '../components/SelectDistrict';
import { queries } from '../graphql';

type Props = {
  cityCode?: string;
  isRequired?: boolean;
  onChange: (value: string) => void;
};

const SelectDsitrictContainer = (props: ChildProps<Props>) => {
  const { data, loading } = useQuery(queries.districts, {
    variables: { cityCode: props.cityCode },
    skip: !props.cityCode,
  });

  if (loading) {
    return <Spinner objective={true} />;
  }

  const updatedProps = {
    ...props,
    districts: data?.qpayGetDistricts || [],
  };

  return <SelectDistrict {...updatedProps} />;
};

export default SelectDsitrictContainer;
