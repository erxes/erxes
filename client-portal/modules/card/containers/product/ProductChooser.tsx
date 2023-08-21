import { gql, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";

import { Config, IProduct } from "../../../types";
import Chooser from "../../components/product/ProductChooser";
import { queries } from "../../../card/graphql";

type Props = {
  config: Config;
  selectedProducts: IProduct[];
  onSaveProducts: (products: IProduct[]) => void;
  closeModal: () => void;
};

function ProductChooser(props: Props) {
  const [perPage, setPerPage] = useState(20);
  const [searchValue, setsearchValue] = useState("");

  const productsQuery: any = useQuery(gql(queries.products), {
    variables: {
      perPage: 20
    },
    context: {
      headers: {
        "erxes-app-token": props.config?.erxesAppToken
      }
    }
  });

  const search = (value: string, reload?: boolean) => {
    if (!reload) {
      setPerPage(20);
    } else {
      setPerPage(perPage + 20);
    }

    setsearchValue(value);
  };

  useEffect(() => {
    productsQuery.refetch({ searchValue, perPage });
  }, [perPage, searchValue]);

  const updatedProps = {
    ...props,
    perPage,
    products: productsQuery.data ? productsQuery.data.products : [],
    search
  };

  return <Chooser {...updatedProps} />;
}

export default ProductChooser;
