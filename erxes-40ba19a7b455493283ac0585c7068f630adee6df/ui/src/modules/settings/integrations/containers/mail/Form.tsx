import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Form from 'modules/settings/integrations/components/mail/Form';
import { mutations } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { IntegrationTypes } from '../../types';
import { getRefetchQueries } from '../utils';

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
        uppercase={false}
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
