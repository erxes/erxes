// erxes
import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
// local
import FormComponent from "../components/Form";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import React from "react";
import { mutations } from "../graphql";
import { useNavigate } from "react-router-dom";

type Props = {
  closeModal: () => void;
};

function FormContainer(props: Props) {
  const navigate = useNavigate();

  const getRefetchQueries = () => {
    return ["safeRemainders"];
  };

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
  }: IButtonMutateProps) => {
    const _callback = (data: any) => {
      if (callback) {
        callback(data);
      }

      navigate(
        `/inventories/safe-remainders/details/${data.safeRemainderAdd._id}`
      );
    };

    return (
      <ButtonMutate
        mutation={mutations.safeRemainderAdd}
        variables={values}
        callback={_callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
        successMessage={`You successfully added a ${name}`}
      />
    );
  };

  const componentProps = {
    ...props,
    renderButton,
  };

  return <FormComponent {...componentProps} />;
}

export default FormContainer;
