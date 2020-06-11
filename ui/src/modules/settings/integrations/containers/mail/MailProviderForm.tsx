import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { mutations } from 'modules/settings/integrations/graphql';
import React from 'react';
import { withRouter } from 'react-router-dom';
import ExchangeForm from '../../components/mail/ExchangeForm';
import ImapForm from '../../components/mail/ImapForm';
import MailAuthForm from '../../components/mail/MailAuthForm';

type Props = {
  type?: string;
  kind: string;
  mutationName: string;
  closeModal: () => void;
};

type FinalProps = {} & IRouterProps & Props;

class MailProviderFormContainer extends React.Component<FinalProps> {
  renderButton = ({
    name,
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    const { mutationName } = this.props;

    const mutation = mutations[mutationName];

    return (
      <ButtonMutate
        mutation={mutation}
        variables={values}
        callback={callback}
        refetchQueries={['integrationsFetchApi']}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully added a ${name}`}
      />
    );
  };

  render() {
    const { kind, closeModal } = this.props;

    const updatedProps = {
      kind,
      closeModal,
      renderButton: this.renderButton
    };

    if (kind === 'nylas-imap') {
      return <ImapForm {...updatedProps} />;
    }

    if (kind === 'nylas-exchange') {
      return <ExchangeForm {...updatedProps} />;
    }

    return <MailAuthForm {...updatedProps} />;
  }
}

export default withRouter<FinalProps>(MailProviderFormContainer);
