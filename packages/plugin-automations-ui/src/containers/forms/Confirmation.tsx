import * as compose from "lodash.flowright";

import { Alert, withProps } from "@erxes/ui/src/utils";
import { RemoveMutationResponse, RemoveMutationVariables } from "../../types";

import Confirmation from "../../components/forms/confirmation";
import ConfirmationPopup from "../../components/forms/confirmation/popup";
import React from "react";
import { getRefetchQueries } from "../List";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { mutations } from "../../graphql";

type Props = {
  when: boolean;
  id: string;
  name: string;
  location: any;
  navigate: any;
  queryParams: any;
  save: () => void;
};

type FinalProps = {} & Props & RemoveMutationResponse;

class ConfirmationContainer extends React.Component<FinalProps> {
  render() {
    const { automationsRemove, queryParams } = this.props;

    const removeAutomations = ({ automationIds }, navigateToNextLocation) => {
      automationsRemove({
        variables: { automationIds },
      })
        .then(() => {
          navigateToNextLocation();
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      removeAutomations,
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
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.automationsRemove),
      {
        name: "automationsRemove",
        options: ({ queryParams }) => ({
          refetchQueries: getRefetchQueries(queryParams),
        }),
      }
    )
  )(ConfirmationContainer)
);
