import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import Form from 'modules/settings/integrations/components/mail/gmail/Form';
import { mutations } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { withRouter } from 'react-router';
import { getRefetchQueries } from '../../utils';

type Props = {
  type?: string;
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
        refetchQueries={getRefetchQueries('nylas-gmail')}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully added a ${name}`}
      />
    );
  };

  render() {
    const { closeModal } = this.props;
    const { accountId } = this.state;

    const updatedProps = {
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
