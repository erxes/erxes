import { mutations, queries } from "../graphql";

import { ButtonMutate } from "@erxes/ui/src/";
import FormComponent from "../components/Form";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { ICommonFormProps } from "@erxes/ui-settings/src/common/types";
import { IEmailTemplate } from "../types";
import React from "react";
import { gql } from "@apollo/client";

type Props = {
  object?: IEmailTemplate;
  params?: any;
  contentType?: string;
} & ICommonFormProps;

const Form = (props: Props) => {
  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    confirmationUpdate,
    object,
  }: IButtonMutateProps) => {
    const afterMutate = () => {
      if (callback) {
        callback();
      }
    };

    let mutation = mutations.emailTemplatesAdd;
    let successAction = "added";

    if (object) {
      mutation = mutations.emailTemplatesEdit;
      successAction = "updated";
    }

    return (
      <ButtonMutate
        mutation={mutation}
        variables={values}
        callback={afterMutate}
        isSubmitted={isSubmitted}
        refetchQueries={["emailTemplates", "emailTemplatesTotalCount"]}
        type="submit"
        confirmationUpdate={confirmationUpdate}
        successMessage={`You successfully ${successAction} a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
  };

  return <FormComponent {...updatedProps} />;
};

export default Form;
