import { ButtonMutate } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import ProductGroupForm from '../components/ProductGroupForm';
import { mutations } from '../graphql';
import { IEbarimtProductGroup } from '../types';

type Props = {
  productGroup: IEbarimtProductGroup;
  closeModal: () => void;
};

const ProductGroupFormContainer = (props: Props) => {
  const { closeModal } = props;

  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    const afterSave = (data) => {
      if (data?.errors) {
        // Handle errors appropriately
        console.error('Error saving product group:', data.errors);
        return;
      }
      closeModal();
    };

    return (
      <ButtonMutate
        mutation={object ? mutations.ebarimtProductGroupUpdate : mutations.ebarimtProductGroupCreate}
        variables={values}
        callback={afterSave}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${object ? 'updated' : 'added'
          } a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton
  };
  return <ProductGroupForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    "ebarimtProductGroups",
    "ebarimtProductGroupsCount",
  ];
};

export default ProductGroupFormContainer;
