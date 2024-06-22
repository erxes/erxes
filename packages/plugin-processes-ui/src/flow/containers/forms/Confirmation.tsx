import { gql } from "@apollo/client";
import * as compose from "lodash.flowright";
import { Alert, withProps } from "@erxes/ui/src/utils";
import React from "react";
import { graphql } from "@apollo/client/react/hoc";
import { mutations as flowMutations } from "../../../flow/graphql";
import Confirmation from "../../components/forms/confirmation";
import ConfirmationPopup from "../../components/forms/confirmation/popup";
import { flowsRemoveMutationResponse } from "../../../flow/types";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  when: boolean;
  id: string;
  name: string;
  queryParams: any;
  save: () => void;
};

type FinalProps = {} & Props & flowsRemoveMutationResponse;

const ConfirmationContainer = (props: FinalProps) => {
  const { flowsRemove, queryParams } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const removeFlows = ({ flowIds }, navigateToNextLocation) => {
    flowsRemove({
      variables: { flowIds },
    })
      .then(() => {
        navigateToNextLocation();
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    navigate,
    location,
    removeFlows,
  };

  return (
    <Confirmation {...updatedProps}>
      {(isOpen, onConfirm, onCancel) => (
        <ConfirmationPopup
          isOpen={isOpen}
          queryParams={queryParams}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      )}
    </Confirmation>
  );
};

const getRefetchQueries = () => {
  return [
    "flows",
    "jobCategories",
    "jobCategoriesTotalCount",
    "jobReferTotalCount",
    "productCountByTags",
  ];
};

const options = () => ({
  refetchQueries: getRefetchQueries(),
});

export default withProps<Props>(
  compose(
    graphql<Props, flowsRemoveMutationResponse, { flowsIds: string[] }>(
      gql(flowMutations.flowsRemove),
      {
        name: "flowsRemove",
        options,
      }
    )
  )(ConfirmationContainer)
);
