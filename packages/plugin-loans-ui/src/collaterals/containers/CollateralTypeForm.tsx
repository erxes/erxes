import React from "react";
import withCurrentUser from "@erxes/ui/src/auth/containers/withCurrentUser";
import { ICollateralTypeDocument } from "../types";

import { __ } from "@erxes/ui/src/utils/core";
import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { IUser } from "@erxes/ui/src/auth/types";
import { mutations, queries } from "../graphql";
import CollateralTypeForm from "../components/CollateralTypeForm";
import useDetailQuery from "../../component/hooks/useDetailQuery";

interface IProps {
  data?: ICollateralTypeDocument;
  renderButton: any;
  closeModal: any;
  currentUser: IUser;
}

const CollateralTypeFormContainer = (props: IProps) => {
  const detailQuery = useDetailQuery<
    ICollateralTypeDocument,
    { collateralTypeDetail: any }
  >(
    queries.collateralTypeDetail,
    { variables: { id: props.data?._id } },
    "collateralTypeDetail"
  );

  if (props.data?._id && !detailQuery.detail) {
    return null;
  }

  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
    disabled
  }: IButtonMutateProps & { disabled: boolean }) => {
    return (
      <ButtonMutate
        mutation={
          object ? mutations.collateralTypeEdit : mutations.collateralTypeAdd
        }
        variables={values}
        callback={() => {
          props.closeModal();
        }}
        refetchQueries={["collateralTypesMain"]}
        isSubmitted={isSubmitted}
        disabled={disabled}
        successMessage={`You successfully ${
          object ? "updated" : "added"
        } a ${name}`}
      >
        {__("Save")}
      </ButtonMutate>
    );
  };

  const updatedProps = {
    ...props,
    data: detailQuery.detail,
    renderButton
  };

  return <CollateralTypeForm {...updatedProps} />;
};

export default withCurrentUser(CollateralTypeFormContainer);
