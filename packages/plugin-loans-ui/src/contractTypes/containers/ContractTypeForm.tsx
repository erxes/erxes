import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { ButtonMutate, withCurrentUser, withProps } from '@erxes/ui/src';
import productCategoryQueries from '@erxes/ui-products/src/graphql/queries';
import { ProductCategoriesQueryResponse } from '@erxes/ui-products/src/types';
import { IUser, UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import React from 'react';

import ContractTypeForm from '../components/ContractTypeForm';
import { mutations } from '../graphql';
import { IContractType } from '../types';
import { __ } from 'coreui/utils';
type Props = {
  contractType: IContractType;
  getAssociatedContractType?: (contractTypeId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  productCategoriesQuery: ProductCategoriesQueryResponse;
  currentUser: IUser;
} & Props;

class ContractTypeFromContainer extends React.Component<FinalProps> {
  render() {
    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal, getAssociatedContractType } = this.props;

      const afterSave = data => {
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

    const { productCategoriesQuery } = this.props;
    if (productCategoriesQuery.loading) {
      return null;
    }

    const productCategories = productCategoriesQuery.productCategories || [];

    const updatedProps = {
      ...this.props,
      renderButton,
      productCategories
    };
    return <ContractTypeForm {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['contractTypesMain', 'contractTypeDetail', 'contractTypes'];
};

export default withCurrentUser(
  withProps<Props>(
    compose(
      graphql<Props, ProductCategoriesQueryResponse>(
        gql(productCategoryQueries.productCategories),
        {
          name: 'productCategoriesQuery'
        }
      )
    )(ContractTypeFromContainer)
  )
);
