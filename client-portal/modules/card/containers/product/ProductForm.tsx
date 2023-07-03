import { gql, useQuery } from "@apollo/client";
import ProductForm from "../../components/product/ProductForm";
import React from "react";
import { queries } from "../../graphql";
import { IPaymentsData, IProductData, IProduct, Config } from "../../../types";

type Props = {
  onChangeProductsData?: (productsData: IProductData[]) => void;
  saveProductsData?: () => void;
  products: IProduct[];
  config: Config;
  productCategoriesQuery?: any;
};

function ProductFormContainer(props: Props) {
  const {
    loading: loadingProductCategories,
    data: categories = {} as any
  } = useQuery(gql(queries.productCategories), {
    fetchPolicy: "network-only"
  });

  const extendedProps = {
    ...props,
    categories,
    loading: loadingProductCategories
  };

  return <ProductForm {...extendedProps} />;
}

export default ProductFormContainer;
