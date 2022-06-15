import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps, ButtonMutate } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { graphql } from 'react-apollo';
import CarForm from '../components/list/CarForm';
import { mutations, queries } from '../graphql';
import { CarCategoriesQueryResponse, ICar } from '../types';
import { UsersQueryResponse } from '@erxes/ui/src/team/types';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  car: ICar;
  getAssociatedCar?: (carId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
  carCategoriesQuery: CarCategoriesQueryResponse;
} & Props;

class CarFromContainer extends React.Component<FinalProps> {
  render() {
    const { carCategoriesQuery } = this.props;

    if (carCategoriesQuery.loading) {
      return null;
    }

    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal, getAssociatedCar } = this.props;

      const afterSave = data => {
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

    const carCategories = carCategoriesQuery.carCategories || [];

    const updatedProps = {
      ...this.props,
      renderButton,
      carCategories
    };
    return <CarForm {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return [
    'carsMain',
    'carDetail',
    // cars for customer detail car associate
    'cars',
    'carCounts',
    'carCategories',
    'carCategoriesTotalCount'
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, CarCategoriesQueryResponse>(gql(queries.carCategories), {
      name: 'carCategoriesQuery'
    })
  )(CarFromContainer)
);
