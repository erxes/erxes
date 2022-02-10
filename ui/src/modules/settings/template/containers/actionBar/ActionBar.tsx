import React from 'react';
import ButtonMutate from 'erxes-ui/lib/components/ButtonMutate';
import { IButtonMutateProps } from 'erxes-ui/lib/types';
import { mutations } from 'modules/settings/emailTemplates/graphql';
import { mutations as mutationsResponseTemplate } from 'modules/settings/responseTemplates/graphql';
import { mutations as mutationsGrowthHackTemplate } from 'modules/settings/growthHacks/graphql';
import Form from '../../components/actionBar/ActionBar';

type Props = {
  queryParams: any;
};

class ProductFormContainer extends React.Component<Props> {
  render() {
    const renderButtonEmailTemplates = ({
      name,
      values,
      isSubmitted,
      confirmationUpdate,
      callback
    }: IButtonMutateProps) => {
      values.discount = Number(values.discount);
      values.totalAmount = Number(values.totalAmount);

      return (
        <ButtonMutate
          mutation={mutations.emailTemplatesAdd}
          variables={values}
          callback={callback}
          isSubmitted={isSubmitted}
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
      callback
    }: IButtonMutateProps) => {
      values.discount = Number(values.discount);
      values.totalAmount = Number(values.totalAmount);

      return (
        <ButtonMutate
          mutation={mutationsResponseTemplate.responseTemplatesAdd}
          variables={values}
          callback={callback}
          isSubmitted={isSubmitted}
          type="submit"
          btnStyle="primary"
          uppercase={false}
          confirmationUpdate={confirmationUpdate}
          successMessage={`You successfully added a ${name}`}
        />
      );
    };

    const renderButtonGrowthHackTemplates = ({
      name,
      values,
      isSubmitted,
      confirmationUpdate,
      callback
    }: IButtonMutateProps) => {
      values.discount = Number(values.discount);
      values.totalAmount = Number(values.totalAmount);

      return (
        <ButtonMutate
          mutation={mutationsGrowthHackTemplate.pipelineTemplatesAdd}
          variables={values}
          callback={callback}
          isSubmitted={isSubmitted}
          type="submit"
          btnStyle="primary"
          uppercase={false}
          confirmationUpdate={confirmationUpdate}
          successMessage={`You successfully added a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      renderButtonEmailTemplates,
      renderButtonResponseTemplates,
      renderButtonGrowthHackTemplates
    };

    return <Form {...updatedProps} />;
  }
}

export default ProductFormContainer;
