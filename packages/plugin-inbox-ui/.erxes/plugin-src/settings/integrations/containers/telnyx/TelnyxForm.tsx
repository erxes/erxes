import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import TelnyxForm from '../../components/telnyx/TelnyxForm';
import { mutations } from '@erxes/ui-settings/src/integrations/graphql';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { INTEGRATION_KINDS } from '@erxes/ui/src/constants/integrations';
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
        type='submit'
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
