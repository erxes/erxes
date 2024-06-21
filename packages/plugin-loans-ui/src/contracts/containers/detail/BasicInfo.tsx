import { gql } from "@apollo/client";
import Alert from "@erxes/ui/src/utils/Alert";
import { mutations } from "../../graphql";
import BasicInfoSection from "../../components/common/BasicInfoSection";
import React from "react";
import { IContract, RemoveMutationResponse } from "../../types";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";

type Props = {
  contract: IContract;
};

const BasicInfoContainer = (props: Props) => {
  const navigate = useNavigate();
  const { contract } = props;

  const [contractsRemove] = useMutation<RemoveMutationResponse>(
    gql(mutations.contractsRemove),
    {
      refetchQueries: [
        "contractsMain",
        "contractCounts",
        "contractCategoriesCount",
      ],
    }
  );

  const { _id } = contract;

  const remove = () => {
    contractsRemove({ variables: { contractIds: [_id] } })
      .then(() => {
        Alert.success("You successfully deleted a contract");
        navigate("/erxes-plugin-loan/contract-list");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    remove,
  };

  return <BasicInfoSection {...updatedProps} />;
};

export default BasicInfoContainer;
