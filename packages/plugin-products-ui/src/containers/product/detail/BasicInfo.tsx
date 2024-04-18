import * as compose from "lodash.flowright";

import { Alert, withProps } from "@erxes/ui/src/utils";
import { IProduct, ProductRemoveMutationResponse } from "../../../types";

import BasicInfo from "../../../components/product/detail/BasicInfo";
import { IUser } from "@erxes/ui/src/auth/types";
import React from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { mutations } from "../../../graphql";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";

type Props = {
  product: IProduct;
  refetchQueries?: any[];
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const BasicInfoContainer = (props: FinalProps) => {
  const navigate = useNavigate();
  const { product } = props;

  const [productsRemove] = useMutation<ProductRemoveMutationResponse>(
    gql(mutations.productsRemove),
    {
      refetchQueries: ["products", "productCategories", "productsTotalCount"],
    }
  );

  const { _id } = product;

  const remove = () => {
    productsRemove({ variables: { productIds: [_id] } })
      .then(() => {
        Alert.success("You successfully deleted a product");
        navigate("/settings/product-service");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    remove,
  };

  return <BasicInfo {...updatedProps} />;
};

const generateOptions = () => ({
  refetchQueries: ["products", "productCategories", "productsTotalCount"],
});

export default BasicInfoContainer;
