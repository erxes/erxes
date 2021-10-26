import React from "react";
import { IButtonMutateProps } from "erxes-ui/lib/types";
import { ButtonMutate } from "erxes-ui";
import { mutations } from "../graphql";
import ThankForm from "../components/ThankForm";
import { ButtonWrap } from "../styles";

type Props = {
  item?: any;
  closeModal?: () => void;
  queryParams?: any;
};

export default function ThankFormContainer(props: Props) {
  const { item } = props;

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

  return <ThankForm {...props} renderButton={renderButton} />;
}
