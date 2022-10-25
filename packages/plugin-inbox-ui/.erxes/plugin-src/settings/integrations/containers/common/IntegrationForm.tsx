import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import React from 'react';
import { getRefetchQueries } from '@erxes/ui-inbox/src/settings/integrations/containers/utils';
import { mutations } from '@erxes/ui-inbox/src/settings/integrations/graphql';
import { withRouter } from 'react-router-dom';
import { loadDynamicComponent } from '@erxes/ui/src/utils/core';

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
        type="submit"
        successMessage={`You successfully added a ${type} ${name}`}
      />
    );
  };

  render() {
    const { closeModal, type } = this.props;
    const { channelIds } = this.state;

    const updatedProps = {
      callback: closeModal,
      renderButton: this.renderButton,
      channelIds,
      onChannelChange: this.onChannelChange
    };

    return loadDynamicComponent('inboxIntegrationForm', updatedProps);
  }
}

export default withRouter<FinalProps>(IntegrationFormContainer);
