import React from 'react';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import CategoryForm from '../components/CategoryForm';
import { mutations } from '../graphql';
import { IAccountCategory } from '../types';

type Props = {
  categories: IAccountCategory[];
  category?: IAccountCategory;
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
              ? mutations.accountCategoryEdit
              : mutations.accountCategoryAdd
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
  return ['accountCategories', 'accountCategoriesTotalCount', 'accounts'];
};

export default CategoryFormContainer;
