import { ButtonMutate, withCurrentUser } from "@erxes/ui/src";
import { IUser, UsersQueryResponse } from "@erxes/ui/src/auth/types";
import {
  ProductCategoriesQueryResponse,
  ProductsQueryResponse,
} from "@erxes/ui-products/src/types";

import ContractTypeForm from "../components/ContractTypeForm";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { IContractType } from "../types";
import React from "react";
import { __ } from "coreui/utils";
import { gql, useQuery } from "@apollo/client";
import { mutations } from "../graphql";
import productCategoryQueries from "@erxes/ui-products/src/graphql/queries";


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
    gql(productCategoryQueries.productCategories)
  );

  const productsQuery = useQuery(gql(productCategoryQueries.products));

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
          object ? "updated" : "added"
        } a ${name}`}
      >
        {__("Save")}
      </ButtonMutate>
    );
  };

  if (productCategoriesQuery.loading || productsQuery.loading) {
    return null;
  }

  const productCategories =
    productCategoriesQuery?.data?.productCategories || [];

  const updatedProps = {
    ...props,
    renderButton,
    productCategories,
    products: productsQuery?.data?.products || [],
  };
  return <ContractTypeForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return ["contractTypesMain", "contractTypeDetail", "contractTypes"];
};

export default withCurrentUser(ContractTypeFromContainer);
