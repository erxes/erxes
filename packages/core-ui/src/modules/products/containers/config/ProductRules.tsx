import React from "react";
import { useQuery, gql } from "@apollo/client";

import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import List from "../../components/config/productRules/ProductRuleList";
import { mutations, queries } from "../../graphql";
import {
  ProductRulesQueryResponse
} from "@erxes/ui-products/src/types";

type Props = {};

const ProductRules = (props: Props) => {
  const rulesQuery = useQuery<ProductRulesQueryResponse>(
    gql(queries.productRules)
  );

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={
          object?._id ? mutations.productRulesEdit : mutations.productRulesAdd
        }
        variables={values}
        callback={callback}
        refetchQueries={refetch}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? "updated" : "added"
        } a product rule`}
      />
    );
  };

  const updatedProps = {
    ...props,
    rules: (rulesQuery.data && rulesQuery.data.productRules) || [],
    totalCount: rulesQuery.data?.productRules.length || 0,
    loading: rulesQuery.loading,
    renderButton,
  };

  return <List {...updatedProps} />;
};

const refetch = ["productRules"];

export default ProductRules;
