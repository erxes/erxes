import { gql } from "@apollo/client";
import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { Alert, confirm } from "@erxes/ui/src/utils";
import React from "react";
import List from "../../components/config/condition/ConditionList";
import { mutations, queries } from "../../graphql";
import {
  BundleConditionCountQueryResponse,
  BundleConditionRemoveMutationResponse
} from "../../types";
import {
  IBundleCondition,
  BundleConditionQueryResponse
} from "@erxes/ui-products/src/types";
import { useQuery, useMutation } from "@apollo/client";

type Props = {};

const ListContainer = (props: Props) => {
  const bundlesQuery = useQuery<BundleConditionQueryResponse>(
    gql(queries.bundleConditions)
  );
  const countQuery = useQuery<BundleConditionCountQueryResponse>(
    gql(queries.bundleConditionTotalCount)
  );
  const [bundleConditionRemove] =
    useMutation<BundleConditionRemoveMutationResponse>(
      gql(mutations.bundleConditionRemove)
    );
  const [bundleConditionDefault] =
    useMutation<BundleConditionRemoveMutationResponse>(
      gql(mutations.bundleConditionDefault)
    );
  const remove = (item: IBundleCondition) => {
    confirm(`This action will remove the BundleCondition. Are you sure?`)
      .then(() => {
        bundleConditionRemove({ variables: { id: item._id } })
          .then(() => {
            Alert.success("You successfully deleted a BundleCondition");
            bundlesQuery.refetch();
            countQuery.refetch();
          })
          .catch(e => {
            Alert.error(e.message);
          });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };
  const makeDefault = (item: IBundleCondition) => {
    confirm(
      `This action will make the BundleCondition "default". Are you sure?`
    )
      .then(() => {
        bundleConditionDefault({ variables: { id: item._id } })
          .then(() => {
            Alert.success("You successfully made a BundleCondition default");
            bundlesQuery.refetch();
            countQuery.refetch();
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
          object?._id
            ? mutations.bundleConditionEdit
            : mutations.bundleConditionAdd
        }
        variables={values}
        callback={callback}
        refetchQueries={refetch}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? "updated" : "added"
        } a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    bundleConditions:
      (bundlesQuery.data && bundlesQuery.data.bundleConditions) || [],
    totalCount:
      (countQuery.data && countQuery.data.bundleConditionTotalCount) || 0,
    loading: bundlesQuery.loading || countQuery.loading,
    renderButton,
    remove,
    makeDefault
  };

  return <List {...updatedProps} />;
};

const refetch = ["bundleConditions", "bundleConditionTotalCount"];

export default ListContainer;
