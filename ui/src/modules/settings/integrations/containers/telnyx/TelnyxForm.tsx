import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import TelnyxForm from 'modules/settings/integrations/components/telnyx/TelnyxForm';
import { mutations } from 'modules/settings/integrations/graphql';
import React from 'react';
import { withRouter } from 'react-router';
import { INTEGRATION_KINDS } from '../../constants';
import { getRefetchQueries } from '../utils';

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
        successMessage={`You successfully added a ${name}`}
        refetchQueries={getRefetchQueries(INTEGRATION_KINDS.TELNYX)}
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
