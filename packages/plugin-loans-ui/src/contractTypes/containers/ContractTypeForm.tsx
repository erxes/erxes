import { ButtonMutate, withCurrentUser } from "@erxes/ui/src";
import { IUser } from "@erxes/ui/src/auth/types";

import ContractTypeForm from "../components/ContractTypeForm";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { IContractType } from "../types";
import React from "react";
import { __ } from "coreui/utils";
import { mutations } from "../graphql";

type Props = {
  contractType: IContractType;
  getAssociatedContractType?: (contractTypeId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const ContractTypeFromContainer = (props: FinalProps) => {
  const { closeModal, getAssociatedContractType } = props;
  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    const afterSave = (data) => {
      closeModal();

      if (getAssociatedContractType) {
        getAssociatedContractType(data.contractTypesAdd);
      }
    };

    return (
      <ButtonMutate
        mutation={
          object ? mutations.contractTypesEdit : mutations.contractTypesAdd
        }
        variables={values}
        callback={afterSave}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${object ? "updated" : "added"
          } a ${name}`}
      >
        {__("Save")}
      </ButtonMutate>
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
  };
  return <ContractTypeForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return ["contractTypesMain", "contractTypeDetail", "contractTypes"];
};

export default withCurrentUser(ContractTypeFromContainer);
