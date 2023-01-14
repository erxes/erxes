import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import gql from 'graphql-tag';
import BuildingForm from '../components/Form';
import { mutations, queries } from '../graphql';
import { queries as cityQueries } from '../../cities/graphql';
import { queries as districtQueries } from '../../districts/graphql';
import { IBuilding } from '../types';
import { useQuery } from 'react-apollo';
import { CityByCoordinateQueryResponse } from '../../cities/types';
import { ICoordinates } from '../../../types';

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
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a district`}
      />
    );
  };

  const updatedProps = {
    ...props,
    city: data && data.cityByCoordinates,
    district:
      districtsByCoordinates.data &&
      districtsByCoordinates.data.districtByCoordinates,
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
