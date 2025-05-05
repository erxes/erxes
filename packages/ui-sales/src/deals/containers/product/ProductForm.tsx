import {
  IDeal,
  IPaymentsData,
  IProductData,
  dealsProductDataMutationParams,
} from "../../types";
import { gql, useMutation, useQuery } from "@apollo/client";
import { mutations, queries } from "../../graphql";

import { AppConsumer } from "coreui/appContext";
import { IProduct } from "@erxes/ui-products/src/types";
import { ProductCategoriesQueryResponse } from "@erxes/ui-products/src/types";
import ProductForm from "../../components/product/ProductForm";
import React from "react";
import { queries as queriesBoard } from "../../../boards/graphql";

type Props = {
  onChangeProductsData: (productsData: IProductData[]) => void;
  saveProductsData: () => void;
  onChangePaymentsData: (paymentsData: IPaymentsData) => void;
  onChangeExtraData: (extraData: any) => void;
  productsData: IProductData[];
  products: IProduct[];
  paymentsData?: IPaymentsData;
  currentProduct?: string;
  closeModal?: () => void;
  dealQuery: IDeal;
};

const ProductFormContainer: React.FC<Props> = ({
  onChangeProductsData,
  saveProductsData,
  onChangePaymentsData,
  onChangeExtraData,
  productsData,
  products,
  paymentsData,
  currentProduct,
  closeModal,
  dealQuery,
}) => {
  const { data: productCategoriesData, loading: loadingCategories } =
    useQuery<ProductCategoriesQueryResponse>(gql(queries.productCategories));

  const { data: pipelineDetailData } = useQuery(
    gql(queriesBoard.pipelineDetail),
    {
      variables: { _id: dealQuery.pipeline._id },
    }
  );

  const [dealsCreateProductDataMutation] = useMutation(
    gql(mutations.dealsCreateProductsData)
  );

  const dealsCreateProductData = (
    variables: dealsProductDataMutationParams
  ) => {
    return dealsCreateProductDataMutation({ variables });
  };

  return (
    <AppConsumer>
      {({ currentUser }) => {
        if (!currentUser) return null;

        const configs = currentUser.configs || {};

        const categories = productCategoriesData?.productCategories || [];

        const extendedProps = {
          onChangeProductsData,
          saveProductsData,
          onChangePaymentsData,
          onChangeExtraData,
          dealsCreateProductData,
          productsData,
          products,
          paymentsData,
          currentProduct,
          closeModal,
          dealQuery,
          categories,
          loading: loadingCategories,
          pipelineDetail: pipelineDetailData?.salesPipelineDetail,
          currencies: configs.dealCurrency || [],
          currentUser,
        };

        return <ProductForm {...extendedProps} />;
      }}
    </AppConsumer>
  );
};

export default ProductFormContainer;
