import { ButtonMutate } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import CategoryForm from '../../components/carCategory/CategoryForm';
import { mutations } from '../../graphql';
import { ICarCategory } from '../../types';

type Props = {
  categories: ICarCategory[];
  category?: ICarCategory;
  closeModal: () => void;
};

const CategoryFormContainer = (props: Props) => {
  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.carCategoryEdit : mutations.carCategoryAdd}
        variables={values}
        callback={callback}
        refetchQueries={['carCategories', 'carCategoriesTotalCount']}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
  };

  return <CategoryForm {...updatedProps} />;
};

export default CategoryFormContainer;
