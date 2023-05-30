import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { gql, useQuery } from '@apollo/client';
import BuildingForm from '../components/Form';
import { mutations, queries } from '../graphql';
import { queries as cityQueries } from '../../cities/graphql';
import { queries as districtQueries } from '../../districts/graphql';
import { IBuilding } from '../types';
import { CityByCoordinateQueryResponse } from '../../cities/types';
import { ICoordinates } from '../../../types';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  osmbId?: string;
  building?: IBuilding;
  center?: ICoordinates;
  closeModal: () => void;
};

const BuildingFormContainer = (props: Props) => {
  const districtsByCoordinates = useQuery(
    gql(districtQueries.districtByCoordinatesQuery),
    {
      variables: {
        ...props.center
      },
      skip: !props.center || props.building ? true : false,
      fetchPolicy: 'network-only'
    }
  );

  const configsQuery = useQuery(gql(queries.configs), {
    variables: {
      code: 'MOBINET_CONFIGS'
    },
    fetchPolicy: 'network-only'
  });

  const { data, loading, refetch } = useQuery<CityByCoordinateQueryResponse>(
    gql(cityQueries.cityByCoordinatesQuery),
    {
      variables: {
        ...props.center
      },

      skip: !props.center || props.building ? true : false,
      fetchPolicy: 'network-only'
    }
  );

  if (configsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    const mutation = object ? mutations.editMutation : mutations.addMutation;

    return (
      <ButtonMutate
        mutation={mutation}
        variables={values}
        callback={callback}
        // refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a building`}
      />
    );
  };

  const updatedProps = {
    ...props,
    city: data && data.cityByCoordinates,
    district:
      districtsByCoordinates.data &&
      districtsByCoordinates.data.districtByCoordinates,
    suhTagId: configsQuery.data.configsGetValue.value.suhTagId || '',
    renderButton
  };

  return <BuildingForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.listQuery),
      fetchPolicy: 'network-only'
    }
  ];
};

export default BuildingFormContainer;
