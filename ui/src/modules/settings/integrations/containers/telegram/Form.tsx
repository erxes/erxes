import ButtonMutate from "modules/common/components/ButtonMutate";
import { IButtonMutateProps, IRouterProps } from "modules/common/types";
import Telegram from "modules/settings/integrations/components/telegram/Telegram";
import { mutations } from "modules/settings/integrations/graphql";
import React from "react";
import { withRouter } from "react-router";

type Props = {
  type?: string;
  closeModal: () => void;
};

type FinalProps = {} & IRouterProps & Props;

class TelegramContainer extends React.Component<FinalProps> {
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
      />
    );
  };

  render() {
    const { closeModal } = this.props;

    const updatedProps = {
      closeModal,
      renderButton: this.renderButton
    };

    return <Telegram {...updatedProps} />;
  }
}

export default withRouter<FinalProps>(TelegramContainer);
