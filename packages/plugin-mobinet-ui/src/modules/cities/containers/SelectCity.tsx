import Spinner from '@erxes/ui/src/components/Spinner';
import * as compose from 'lodash.flowright';
import React from 'react';
import { ChildProps, graphql } from 'react-apollo';
import gql from 'graphql-tag';

import SelectCity from '../components/SelectCity';
import { queries } from '../graphql';
import { CitiesQueryResponse } from '../types';
import { ICoordinates } from '../../../types';

type Props = {
  defaultValue: string[] | string;
  isRequired?: boolean;
  description?: string;
  multi?: boolean;
  onChange: (value: string[], center?: ICoordinates) => void;
};

type FinalProps = {
  citiesQuery: CitiesQueryResponse;
} & Props;

const SelectCitysContainer = (props: ChildProps<FinalProps>) => {
  const { citiesQuery } = props;

  if (citiesQuery.loading) {
    return <Spinner objective={true} />;
  }

  const cities = citiesQuery.cities || [];

  const updatedProps = {
    ...props,
    cities
  };

  return <SelectCity {...updatedProps} />;
};

export default compose(
  graphql<CitiesQueryResponse>(gql(queries.citiesQuery), {
    name: 'citiesQuery',
    options: () => ({
      variables: { perPage: 100 }
    })
  })
)(SelectCitysContainer);
