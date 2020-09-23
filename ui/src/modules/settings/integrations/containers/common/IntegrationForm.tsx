import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import CallPro from 'modules/settings/integrations/components/callpro/Form';
import { mutations } from 'modules/settings/integrations/graphql';
import React from 'react';
import { withRouter } from 'react-router-dom';
import Chatfuel from '../../components/chatfuel/Form';
import Telegram from '../../components/telegram/Telegram';
import TelnyxForm from '../../components/telnyx/TelnyxForm';
import Viber from '../../components/viber/Viber';
import Whatsapp from '../../components/whatsapp/Whatsapp';
import { INTEGRATION_KINDS } from '../../constants';
import { getRefetchQueries } from '../utils';

type Props = {
  type: string;
  closeModal: () => void;
};

type State = {
  channelIds: string[];
};

type FinalProps = {} & IRouterProps & Props;

class IntegrationFormContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { channelIds: [] };
  }

  onChannelChange = (values: string[]) => {
    this.setState({ channelIds: values });
  };

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
        variables={Object.assign(values, { channelIds: this.state.channelIds })}
        callback={callback}
        isSubmitted={isSubmitted}
        refetchQueries={getRefetchQueries(type)}
        uppercase={false}
        type="submit"
        successMessage={`You successfully added a ${type} ${name}`}
      />
    );
  };

  render() {
    const { closeModal, type } = this.props;
    const { channelIds } = this.state;

    let Component;

    const updatedProps = {
      callback: closeModal,
      renderButton: this.renderButton,
      channelIds,
      onChannelChange: this.onChannelChange
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

    if (type === INTEGRATION_KINDS.TELNYX) {
      Component = TelnyxForm;
    }

    return <Component {...updatedProps} />;
  }
}

export default withRouter<FinalProps>(IntegrationFormContainer);
