import { Config, IProductData } from "../../../types";

import EmptyState from "../../../common/form/EmptyState";
import React from "react";
import Box from "../../../common/Box";

import ProductForm from "../../containers/product/ProductForm";

type Props = {
  products: any[];
  config: Config;
  saveProducts: (productsData: IProductData[]) => void;
};

function ProductSection(props: Props) {
  const { products } = props;

  if (!products.length) {
    return <EmptyState icon="list-ul" text="No items" />;
  }
  return (
    <Box title="Product & Service">
      <ProductForm {...props} />
    </Box>
  );
}

export default ProductSection;
