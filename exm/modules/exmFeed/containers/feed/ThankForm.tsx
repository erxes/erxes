import { ButtonWrap, FormWrap } from "../../styles";

import ButtonMutate from "../../../common/ButtonMutate";
import { IButtonMutateProps } from "../../../common/types";
import React from "react";
import ThankForm from "../../components/feed/ThankForm";
import { mutations } from "../../graphql";

type Props = {
  item?: any;
  transparent?: boolean;
  closeModal?: () => void;
  queryParams?: any;
};

export default function ThankFormContainer(props: Props) {
  const { item, transparent } = props;

  const renderButton = ({
    values,
    isSubmitted,
    callback,
  }: IButtonMutateProps) => {
    const callBackResponse = () => {
      if (callback) {
        callback();
      }
    };

    const variables = {
      ...values,
    };

    if (item) {
      variables._id = item._id;
    }

    return (
      <ButtonWrap>
        <ButtonMutate
          mutation={variables._id ? mutations.editThank : mutations.addThank}
          variables={variables}
          callback={callBackResponse}
          isSubmitted={isSubmitted}
          successMessage={`You successfully ${
            variables._id ? "edited" : "added"
          } a thank you`}
          type="submit"
          icon="check-circle"
        />
      </ButtonWrap>
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
  };

  return (
    <FormWrap transparent={transparent}>
      <ThankForm {...updatedProps} />
    </FormWrap>
  );
}
