import React from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { Alert, confirm } from "@erxes/ui/src/utils";
import List from "../../components/config/rule/RuleList";
import { mutations, queries } from "../../graphql";
import { BundleRuleRemoveMutationResponse } from "../../types";
import {
  IBundleCondition,
  BundleRulesQueryResponse,
  BundleConditionQueryResponse
} from "@erxes/ui-products/src/types";

type Props = {};

const RuleList = (props: Props) => {
  const rulesQuery = useQuery<BundleRulesQueryResponse>(
    gql(queries.bundleRules)
  );
  const conditionQuery = useQuery<BundleConditionQueryResponse>(
    gql(queries.bundleConditions)
  );
  const [bundleRuleRemove] = useMutation<BundleRuleRemoveMutationResponse>(
    gql(mutations.bundleRuleRemove)
  );

  const remove = (item: IBundleCondition) => {
    confirm(`This action will remove the BundleRule. Are you sure?`)
      .then(() => {
        bundleRuleRemove({ variables: { id: item._id } })
          .then(() => {
            Alert.success("You successfully deleted a BundleRule");
            rulesQuery.refetch();
          })
          .catch(e => {
            Alert.error(e.message);
          });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };
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
          object?._id ? mutations.bundleRuleEdit : mutations.bundleRuleAdd
        }
        variables={values}
        callback={callback}
        refetchQueries={refetch}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? "updated" : "added"
        } a BundleRule`}
      />
    );
  };

  const updatedProps = {
    ...props,
    rules: (rulesQuery.data && rulesQuery.data.bundleRules) || [],
    totalCount: rulesQuery.data?.bundleRules.length || 0,
    loading: rulesQuery.loading,
    bundleConditions:
      (conditionQuery.data && conditionQuery.data.bundleConditions) || [],
    renderButton,
    remove
  };

  return <List {...updatedProps} />;
};

const refetch = ["BundleRules"];

export default RuleList;
