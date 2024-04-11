import { Alert } from "@erxes/ui/src";
import {
  ICar,
  RemoveMutationResponse,
  RemoveMutationVariables,
} from "../../types";
import { mutations } from "../../graphql";

import BasicInfoSection from "../../components/common/BasicInfoSection";
import React from "react";
import { gql, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";

type Props = {
  car: ICar;
};

const BasicInfoContainer = (props: Props) => {
  const { car } = props;
  const navigate = useNavigate();

  const [carsRemove] = useMutation<
    RemoveMutationResponse,
    RemoveMutationVariables
  >(gql(mutations.carsRemove), {
    refetchQueries: ["carsMain", "carCounts", "carCategoriesCount"],
  });

  const { _id } = car;

  const remove = () => {
    carsRemove({ variables: { carIds: [_id] } })
      .then(() => {
        Alert.success("You successfully deleted a car");
        navigate("/cars");
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
