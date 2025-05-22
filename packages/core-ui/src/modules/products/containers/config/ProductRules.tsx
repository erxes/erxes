import React from "react";
import { useQuery, gql, useMutation } from "@apollo/client";

import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import List from "../../components/config/productRules/ProductRuleList";
import { mutations, queries } from "../../graphql";
import {
  ProductRulesQueryResponse
} from "@erxes/ui-products/src/types";
import { Alert, confirm } from "@erxes/ui/src/utils";

type Props = {};

const ProductRules = (props: Props) => {
  const rulesQuery = useQuery<ProductRulesQueryResponse>(
    gql(queries.productRules)
  );

  const [remove] = useMutation(
    gql(mutations.productRulesRemove)
  );

  const removeRule = (_id: string) => {
    confirm()
      .then(() => {
        remove({ variables: { _id } }).then(({ data }) => {
          const { productRulesRemove } = data;

          if (productRulesRemove.acknowledged && productRulesRemove.deletedCount === 1) {
            Alert.success('Product rule has been deleted.');
          }

          rulesQuery.refetch();
        }).catch(e => {
          Alert.error(e.message);
        })
      });
  };

  const renderButton = ({
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
        refetchQueries={["productRules"]}
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
    removeRule
  };

  return <List {...updatedProps} />;
};

export default ProductRules;
