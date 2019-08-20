import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { Alert } from 'modules/common/utils';
import CallPro from 'modules/settings/integrations/components/callpro/Form';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import React from 'react';
import { withRouter } from 'react-router';

type Props = {
  type?: string;
  closeModal: () => void;
};

type FinalProps = {} & IRouterProps & Props;

class CallProContainer extends React.Component<Props> {
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
        refetchQueries={getRefetchQueries('facebook')}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully added a ${name}`}
      />
    );
  };

  render() {
    const { closeModal } = this.props;

    const updatedProps = {
      closeModal,
      accountId: this.state.accountId,
      pages: this.state.pages,
      onAccountSelect: this.onAccountSelect,
      onRemoveAccount: this.onRemoveAccount,
      renderButton: this.renderButton
    };

    return <Facebook {...updatedProps} />;
  }
}

export default withRouter<FinalProps>(CallProContainer);
