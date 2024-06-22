import { gql, useQuery } from '@apollo/client';
import { ButtonMutate, Spinner } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import CarForm from '../components/list/CarForm';
import { mutations, queries } from '../graphql';
import { CarCategoriesQueryResponse, ICar } from '../types';

type Props = {
  car: ICar;
  getAssociatedCar?: (carId: string) => void;
  closeModal: () => void;
};

const CarFormContainer = (props: Props) => {
  const { closeModal, getAssociatedCar } = props;

  const carCategoriesQuery = useQuery<CarCategoriesQueryResponse>(
    gql(queries.carCategories),
  );

  if (carCategoriesQuery.loading) {
    return <Spinner />;
  }

  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    const afterSave = (data) => {
      closeModal();

      if (getAssociatedCar) {
        getAssociatedCar(data.carsAdd);
      }
    };

    return (
      <ButtonMutate
        mutation={object ? mutations.carsEdit : mutations.carsAdd}
        variables={values}
        callback={afterSave}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const carCategories = carCategoriesQuery?.data?.carCategories || [];

  const updatedProps = {
    ...props,
    renderButton,
    carCategories,
  };
  return <CarForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    'carsMain',
    'carDetail',
    // cars for customer detail car associate
    'cars',
    'carCounts',
    'carCategories',
    'carCategoriesTotalCount',
  ];
};

export default CarFormContainer;
