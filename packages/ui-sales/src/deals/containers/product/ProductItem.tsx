import {
  IDeal,
  IProductData,
  dealsProductDataMutationParams,
} from "../../types";
import { gql, useMutation } from "@apollo/client";

import { IUser } from "@erxes/ui/src/auth/types";
import ProductItem from "../../components/product/ProductItem";
import React from "react";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { mutations } from "../../graphql";

type Props = {
  advancedView?: boolean;
  currencies: string[];
  productsData?: IProductData[];
  productData: IProductData;
  duplicateProductItem?: (productId: string) => void;
  removeProductItem?: (productId: string) => void;
  onChangeProductsData?: (productsData: IProductData[]) => void;
  calculatePerProductAmount: (type: string, productData: IProductData) => void;
  updateTotal?: () => void;
  currentProduct?: string;
  onChangeDiscount: (id: string, discount: number) => void;
  dealQuery: IDeal;
  currentUser: IUser;
};

const CONFIRM_LOYALTIES = gql(mutations.confirmLoyalties);

const ProductItemContainer: React.FC<Props> = (props) => {
  const [confirmLoyaltiesMutation] = useMutation(CONFIRM_LOYALTIES);

  const [dealsEditProductDataMutation] = useMutation(
    gql(mutations.dealsEditProductData)
  );

  const dealsEditProductData = (variables: dealsProductDataMutationParams) => {
    return dealsEditProductDataMutation({ variables });
  };

  const confirmLoyalties = (variables: any) => {
    if (!isEnabled("loyalties")) return;

    return confirmLoyaltiesMutation({ variables });
  };

  const updatedProps = {
    ...props,
    confirmLoyalties,
    dealsEditProductData,
  };

  return <ProductItem {...updatedProps} />;
};

export default ProductItemContainer;
