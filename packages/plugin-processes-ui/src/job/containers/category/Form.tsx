import React from 'react';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import CategoryForm from '../../components/category/Form';
import { mutations } from '../../graphql';
import { IJobCategory } from '../../types';

type Props = {
  categories: IJobCategory[];
  category?: IJobCategory;
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
      const attachment = values.attachment ? values.attachment : undefined;

      values.attachment = attachment
        ? { ...attachment, __typename: undefined }
        : null;

      return (
        <ButtonMutate
          mutation={
            object ? mutations.jobCategoriesEdit : mutations.jobCategoriesAdd
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
  return ['jobCategories', 'jobCategoriesTotalCount', 'products'];
};

export default CategoryFormContainer;
