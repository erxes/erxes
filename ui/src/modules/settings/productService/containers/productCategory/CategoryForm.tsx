import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import React from 'react';
import CategoryForm from '../../components/productCategory/CategoryForm';
import { mutations } from '../../graphql';
import { IProductCategory } from '../../types';

type Props = {
  categories: IProductCategory[];
  category?: IProductCategory;
  closeModal: () => void;
};

class CategoryFormContainer extends React.Component<Props> {
  render() {
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
            object
              ? mutations.productCategoryEdit
              : mutations.productCategoryAdd
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

    const updatedProps = {
      ...this.props,
      renderButton
    };

    return <CategoryForm {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['productCategories', 'productCategoriesTotalCount'];
};

export default CategoryFormContainer;
