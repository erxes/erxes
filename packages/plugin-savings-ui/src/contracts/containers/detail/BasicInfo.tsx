import { IContract, RemoveMutationResponse } from "../../types";
import { gql, useMutation } from "@apollo/client";
import { Alert } from "@erxes/ui/src";
import BasicInfoSection from "../../components/common/BasicInfoSection";
import { IUser } from "@erxes/ui/src/auth/types";
import React from "react";
import { mutations } from "../../graphql";
import { useNavigate } from "react-router-dom";

type Props = {
  contract: IContract;
};

type FinalProps = { currentUser: IUser } & Props;

const BasicInfoContainer = (props: FinalProps) => {
  const { contract } = props;
  const navigate = useNavigate();

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
        navigate("/erxes-plugin-saving/contract-list");
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
