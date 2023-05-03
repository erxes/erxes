import { ButtonMutate, withProps } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import CategoryForm from '../../components/carCategory/CategoryForm';
import { mutations, queries } from '../../graphql';
import { CarCategoriesQueryResponse, ICarCategory } from '../../types';

type Props = {
  car?: ICarCategory;
  carCategories: ICarCategory[];
  closeModal: () => void;
};

type FinalProps = {
  carCategoriesQuery: CarCategoriesQueryResponse;
  iconsQuery: any;
} & Props;

class CategoryFormContainer extends React.Component<FinalProps> {
  render() {
    const { carCategoriesQuery, iconsQuery } = this.props;

    if (carCategoriesQuery.loading || iconsQuery.loading) {
      return null;
    }

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={
            object ? mutations.carCategoryEdit : mutations.carCategoryAdd
          }
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const carCategories = carCategoriesQuery.carCategories || [];
    const icons = iconsQuery.tumentechCategoryIcons || [];

    const updatedProps = {
      ...this.props,
      renderButton,
      carCategories,
      icons
    };

    return <CategoryForm {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['carCategories', 'carCategoriesTotalCount'];
};

export default withProps<FinalProps>(
  compose(
    graphql<Props, CarCategoriesQueryResponse>(gql(queries.carCategories), {
      name: 'carCategoriesQuery'
    }),

    graphql(gql(queries.categoryIcons), {
      name: 'iconsQuery'
    })
  )(CategoryFormContainer)
);
