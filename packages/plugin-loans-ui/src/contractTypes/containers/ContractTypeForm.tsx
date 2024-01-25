import { gql } from '@apollo/client';
import { ButtonMutate, withCurrentUser } from '@erxes/ui/src';
import productCategoryQueries from '@erxes/ui-products/src/graphql/queries';
import { ProductCategoriesQueryResponse } from '@erxes/ui-products/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';

import ContractTypeForm from '../components/ContractTypeForm';
import { mutations } from '../graphql';
import { IContractType } from '../types';
import { __ } from 'coreui/utils';
import { useQuery } from '@apollo/client';

type Props = {
  contractType: IContractType;
  getAssociatedContractType?: (contractTypeId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const ContractTypeFromContainer = (props: FinalProps) => {
  const productCategoriesQuery = useQuery<ProductCategoriesQueryResponse>(
    gql(productCategoryQueries.productCategories),
  );

  const { closeModal, getAssociatedContractType } = props;
  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    const afterSave = (data) => {
      closeModal();

      if (getAssociatedContractType) {
        getAssociatedContractType(data.contractTypesAdd);
      }
    };

    return (
      <ButtonMutate
        mutation={
          object ? mutations.contractTypesEdit : mutations.contractTypesAdd
        }
        variables={values}
        callback={afterSave}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      >
        {__('Save')}
      </ButtonMutate>
    );
  };

  if (productCategoriesQuery.loading) {
    return null;
  }

  const productCategories =
    productCategoriesQuery?.data?.productCategories || [];

  const updatedProps = {
    ...props,
    renderButton,
    productCategories,
  };
  return <ContractTypeForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return ['contractTypesMain', 'contractTypeDetail', 'contractTypes'];
};

export default withCurrentUser(ContractTypeFromContainer);
