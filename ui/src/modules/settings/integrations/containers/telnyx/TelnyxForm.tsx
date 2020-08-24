import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { mutations } from 'modules/settings/integrations/graphql';

import ButtonMutate from 'modules/common/components/ButtonMutate';
import TelnyxForm from 'modules/settings/integrations/components/telnyx/TelnyxForm';
import React from 'react';
import { withRouter } from 'react-router';

type Props = {
  type?: string;
  closeModal: () => void;
};

type FinalProps = {} & IRouterProps & Props;

class TelnyxContainer extends React.Component<FinalProps> {
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
        uppercase={false}
        successMessage={`You successfully added a ${name}`}
      />
    );
  };

  render() {
    const { closeModal } = this.props;
    const updatedProps = {
      closeModal,
      renderButton: this.renderButton
    };

    return <TelnyxForm {...updatedProps} />;
  }
}

export default withRouter<FinalProps>(TelnyxContainer);
