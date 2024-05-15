import * as compose from "lodash.flowright";

import { ProductCategoriesQueryResponse } from "@erxes/ui-products/src/types";
import React from "react";
import Select from "react-select";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries } from "../graphql";

type Props = {
  productCategoriesQuery: ProductCategoriesQueryResponse;
  onChange: () => void;
  value: string;
  placeholder: string;
};

function SelectProductCategory(props: Props) {
  const { productCategoriesQuery, onChange, value, placeholder } = props;

  if (productCategoriesQuery.loading) {
    return null;
  }

  const { productCategories = [] } = productCategoriesQuery;

  const mainCategory = productCategories.filter((item) => item.isRoot);
  const options = mainCategory.map((el) => ({
    label: el.name,
    value: el._id,
  }));

  return (
    <Select
      options={options}
      onChange={onChange}
      value={options.find((o) => o.value === value)}
      isClearable={true}
      placeholder={placeholder}
    />
  );
}

export default compose(
  graphql<{}, ProductCategoriesQueryResponse, { parentId: string }>(
    gql(queries.productCategories),
    {
      name: "productCategoriesQuery",
    }
  )
)(SelectProductCategory);
