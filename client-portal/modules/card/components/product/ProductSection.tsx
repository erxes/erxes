import { Config, IProductData } from "../../../types";

import React from "react";
import Box from "../../../common/Box";

import ProductForm from "./ProductForm";

type Props = {
  config: Config;
  productsData: IProductData[];
  onChangeProductsData: (productsData: IProductData[]) => void;
};

function ProductSection(props: Props) {
  return (
    <Box title="Product & Service">
      <ProductForm {...props} />
    </Box>
  );
}

export default ProductSection;
