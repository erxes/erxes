import { ButtonMutate, __ } from "@erxes/ui/src";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import React from "react";
import ScoringForm from "../components/PullDataForm";
import { mutations, queries } from "../graphql";
import { PullPolarisQueryResponse } from "../types";
import { gql, useQuery } from "@apollo/client";
type Props = {
  customerId: string;
  closeModal: () => void;
  reportPurpose: string;
  keyword?: string;
};

export default function ScoringFormContainer(props: Props) {
  const { customerId } = props;
  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    const { closeModal } = props;
    const afterSave = () => {
      closeModal();
    };
    values.customerId = customerId;
    return (
      <></>
    );
  };

  const pullPolarisQuery = useQuery<PullPolarisQueryResponse>(
    gql(queries.pullPolarisData),
    {
      variables: {
        customerId: customerId,
        fetchPolicy: "network-only",
      },
    }
  );

  const refetch = () => {
    return ["burenCustomerScoringsMain", "getCustomerScore"];
  };
  const updatedProps = {
    ...props,
    renderButton,
    customerId: customerId,
    pullData: pullPolarisQuery.data?.pullData,
  };

  return <ScoringForm {...updatedProps} />;
}
