import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import Form from '../../components/mail/Form';
import { mutations } from '@erxes/ui-settings/src/integrations/graphql';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { IntegrationTypes } from '@erxes/ui-inbox/src/settings/integrations/types';
import { getRefetchQueries } from '@erxes/ui-inbox/src/settings/integrations/containers/utils';

type Props = {
  type?: string;
  kind: IntegrationTypes;
  closeModal: () => void;
};

type FinalProps = {} & IRouterProps & Props;

type State = {
  accountId: string;
};

class FormContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { accountId: '' };
  }

  onAccountSelect = (accountId?: string) => {
    if (!accountId) {
      return this.setState({ accountId: '' });
    }

    this.setState({ accountId });
  };

  onRemoveAccount = () => {
    this.setState({ accountId: '' });
  };

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
        refetchQueries={getRefetchQueries(this.props.kind)}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={__(`You successfully added a`) + `${name}`}
      />
    );
  };

  render() {
    const { kind, closeModal } = this.props;
    const { accountId } = this.state;

    const updatedProps = {
      kind,
      closeModal,
      accountId,
      onAccountSelect: this.onAccountSelect,
      onRemoveAccount: this.onRemoveAccount,
      renderButton: this.renderButton
    };

    return <Form {...updatedProps} />;
  }
}

export default withRouter<FinalProps>(FormContainer);
