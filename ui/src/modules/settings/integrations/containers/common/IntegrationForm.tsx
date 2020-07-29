import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import CallPro from 'modules/settings/integrations/components/callpro/Form';
import { mutations } from 'modules/settings/integrations/graphql';
import React from 'react';
import { withRouter } from 'react-router-dom';

type Props = {
  type?: string;
  closeModal: () => void;
};

type FinalProps = {} & IRouterProps & Props;

class IntegrationFormContainer extends React.Component<FinalProps> {
  renderButton = ({
    name,
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.integrationsCreateExternalIntegration}
        variables={values}
        callback={callback}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully added a ${name}`}
      />
    );
  };

  render() {
    const { closeModal, type } = this.props;

    const updatedProps = {
      callBack: closeModal,
      renderButton: this.renderButton
    };

    console.log(type);

    if (type === 'callpro') {
      console.log(type);
    }

    return <CallPro {...updatedProps} />;
  }
}

export default withRouter<FinalProps>(IntegrationFormContainer);
