import queryString from "query-string";
import { gql, useQuery } from "@apollo/client";
import * as compose from "lodash.flowright";
import React, { useState } from "react";

import { Config, IProduct } from "../../../types";
import ProductForm from "./ProductForm";
import { ProductCategoriesQueryResponse } from "@erxes/ui-products/src/types";
import { isEnabled } from "@erxes/ui/src/utils/core";
import Chooser from "../../components/product/ProductChooser";
import { queries } from "../../../card/graphql";
import { load } from "dotenv/types";
import EmptyState from "../../../common/form/EmptyState";

type Props = {
  config: Config;
  selectedProducts: IProduct[];
  onSaveProducts: (products: IProduct[]) => void;
  closeModal: () => void;
};

function ProductChooser(props: Props) {
  const { config } = props;

  const [perPage, setPerPage] = useState(0);

  const { error, data, loading, refetch }: any = useQuery(
    gql(queries.products),
    {
      context: {
        headers: {
          "erxes-app-token": config?.erxesAppToken
        }
      }
    }
  );

  if (loading) {
    return <EmptyState text="as" />;
  }

  const search = (searchValue: string, reload?: boolean) => {
    if (!reload) {
      setPerPage(100);
    }

    setPerPage(perPage + 20);

    refetch({ searchValue, perPage });
  };

  return (
    <Chooser
      {...props}
      perPage={perPage}
      products={data.products}
      search={search}
    />
  );
}

export default ProductChooser;
