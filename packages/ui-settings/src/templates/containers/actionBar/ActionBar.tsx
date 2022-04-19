import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { mutations } from "../../graphql";
import { mutations as mutationsGrowthHackTemplate } from "../../../growthHacks/graphql";
import { mutations as mutationsResponseTemplate } from "../../../responseTemplates/graphql";
import React from "react";

import Form from "../../components/actionBar/ActionBar";

type Props = {
  queryParams: any;
  history: any;
};

class ProductFormContainer extends React.Component<Props> {
  render() {
    const renderButtonEmailTemplates = ({
      name,
      values,
      isSubmitted,
      confirmationUpdate,
      callback,
    }: IButtonMutateProps) => {
      values.discount = Number(values.discount);
      values.totalAmount = Number(values.totalAmount);

      return (
        <ButtonMutate
          mutation={mutations.emailTemplatesAdd}
          variables={values}
          callback={callback}
          isSubmitted={isSubmitted}
          refetchQueries={["emailTemplates", "emailTemplatesTotalCount"]}
          type="submit"
          btnStyle="primary"
          uppercase={false}
          confirmationUpdate={confirmationUpdate}
          successMessage={`You successfully added a ${name}`}
        />
      );
    };

    const renderButtonResponseTemplates = ({
      name,
      values,
      isSubmitted,
      confirmationUpdate,
      callback,
    }: IButtonMutateProps) => {
      values.discount = Number(values.discount);
      values.totalAmount = Number(values.totalAmount);

      return (
        <ButtonMutate
          mutation={mutationsResponseTemplate.responseTemplatesAdd}
          variables={values}
          callback={callback}
          isSubmitted={isSubmitted}
          refetchQueries={["responseTemplates", "responseTemplatesTotalCount"]}
          type="submit"
          btnStyle="primary"
          uppercase={false}
          confirmationUpdate={confirmationUpdate}
          successMessage={`You successfully added response a ${name}`}
        />
      );
    };

    const renderButtonGrowthHackTemplates = ({
      name,
      values,
      isSubmitted,
      confirmationUpdate,
      callback,
    }: IButtonMutateProps) => {
      values.discount = Number(values.discount);
      values.totalAmount = Number(values.totalAmount);

      return (
        <ButtonMutate
          mutation={mutationsGrowthHackTemplate.pipelineTemplatesAdd}
          variables={values}
          callback={callback}
          isSubmitted={isSubmitted}
          refetchQueries={["pipelineTemplates", "pipelineTemplatesTotalCount"]}
          type="submit"
          btnStyle="primary"
          uppercase={false}
          confirmationUpdate={confirmationUpdate}
          successMessage={`You successfully added pipeline a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      renderButtonEmailTemplates,
      renderButtonResponseTemplates,
      renderButtonGrowthHackTemplates,
    };

    return <Form {...updatedProps} />;
  }
}

export default ProductFormContainer;
