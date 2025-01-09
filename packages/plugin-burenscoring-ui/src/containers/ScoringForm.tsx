import { ButtonMutate, __ } from "@erxes/ui/src";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import React from "react";
import ScoringForm from "../components/ScorinMainForm";
import { mutations, queries } from "../graphql";
import { DetailQueryResponse, RegiserResponse } from "../types";
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
      <ButtonMutate
        icon="loading"
        mutation={mutations.toCheckScoring}
        variables={values}
        callback={afterSave}
        refetchQueries={refetch()}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
        successMessage={__(`You successfully score a ${name}`)}
      >
        {" "}
        {__("Scoring")}
      </ButtonMutate>
    );
  };

  const response = useQuery<DetailQueryResponse>(
    gql(queries.getCustomerScore),
    {
      variables: {
        customerId: customerId,
        fetchPolicy: "network-only",
      },
    }
  );

  const registerNumber = useQuery<RegiserResponse>(
    gql(queries.getRegister),

    {
      variables: {
        customerId: customerId,
      },
      fetchPolicy: "network-only",
    }
  );
  if (registerNumber.loading) {
    return null;
  }
  const refetch = () => {
    return ["burenCustomerScoringsMain", "getCustomerScore"];
  };
  const updatedProps = {
    ...props,
    renderButton,
    customerId: customerId,
    customerScore: response.data?.getCustomerScore,
    registerNumber: registerNumber.data?.getRegister || "",
  };

  return <ScoringForm {...updatedProps} />;
}
