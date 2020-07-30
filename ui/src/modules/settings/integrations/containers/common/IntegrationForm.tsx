import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import CallPro from 'modules/settings/integrations/components/callpro/Form';
import { mutations } from 'modules/settings/integrations/graphql';
import React from 'react';
import { withRouter } from 'react-router-dom';
import Chatfuel from '../../components/chatfuel/Form';
import Telegram from '../../components/telegram/Telegram';
import Viber from '../../components/viber/Viber';
import Whatsapp from '../../components/whatsapp/Whatsapp';
import { INTEGRATION_KINDS } from '../../constants';
import { getRefetchQueries } from '../utils';

type Props = {
  type: string;
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
    const { type } = this.props;
    return (
      <ButtonMutate
        mutation={mutations.integrationsCreateExternalIntegration}
        variables={values}
        callback={callback}
        isSubmitted={isSubmitted}
        refetchQueries={getRefetchQueries(type)}
        type="submit"
        successMessage={`You successfully added a ${type} ${name}`}
      />
    );
  };

  render() {
    const { closeModal, type } = this.props;

    let Component;

    const updatedProps = {
      callback: closeModal,
      renderButton: this.renderButton
    };

    if (type === INTEGRATION_KINDS.CALLPRO) {
      Component = CallPro;
    }

    if (type === INTEGRATION_KINDS.CHATFUEL) {
      Component = Chatfuel;
    }

    if (type === INTEGRATION_KINDS.SMOOCH_VIBER) {
      Component = Viber;
    }

    if (type === INTEGRATION_KINDS.SMOOCH_TELEGRAM) {
      Component = Telegram;
    }

    if (type === INTEGRATION_KINDS.WHATSAPP) {
      Component = Whatsapp;
    }

    return <Component {...updatedProps} />;
  }
}

export default withRouter<FinalProps>(IntegrationFormContainer);
