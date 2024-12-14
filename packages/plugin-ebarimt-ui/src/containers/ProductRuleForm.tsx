import { ButtonMutate } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import ProductRuleForm from '../components/ProductRuleForm';
import { mutations } from '../graphql';
import { IEbarimtProductRule } from '../types';

type Props = {
  productRule: IEbarimtProductRule;
  closeModal: () => void;
};

const ProductRuleFormContainer = (props: Props) => {
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
        console.error('Error saving product rule:', data.errors);
        return;
      }
      closeModal();
    };

    return (
      <ButtonMutate
        mutation={object ? mutations.ebarimtProductRuleUpdate : mutations.ebarimtProductRuleCreate}
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
  return <ProductRuleForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    "ebarimtProductRules",
    "ebarimtProductRulesCount",
  ];
};

export default ProductRuleFormContainer;
