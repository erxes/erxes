import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import CommonForm from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Info from 'modules/common/components/Info';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Spinner from 'modules/common/components/Spinner';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import Accounts from '../../containers/Accounts';
import MailProviderForm from '../../containers/mail/MailProviderForm';
import SelectBrand from '../../containers/SelectBrand';
import { IntegrationTypes } from '../../types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  onAccountSelect: (accountId?: string) => void;
  onRemoveAccount: (accountId: string) => void;
  closeModal: () => void;
  kind: IntegrationTypes;
  accountId: string;
  email?: string;
};

class Form extends React.Component<Props, { loading: boolean }> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  generateDoc = (values: { name: string; brandId: string }) => {
    const { kind, accountId, email } = this.props;

    return {
      kind,
      accountId,
      data: { email },
      ...values
    };
  };

  renderForm = () => {
    const { kind } = this.props;

    const trigger = (
      <Button btnStyle="primary" uppercase={false} icon="plus-circle">
        Add Account
      </Button>
    );

    let mutationName;
    let title;

    switch (kind) {
      case 'nylas-imap':
        mutationName = 'addImapAccount';
        title = 'Add IMAP';
        break;
      case 'nylas-exchange':
        mutationName = 'addExchangeAccount';
        title = 'Add Exchange';
        break;
      case 'nylas-outlook':
        mutationName = 'addMailAccount';
        title = 'Add Outlook';
        break;
      case 'nylas-yahoo':
        mutationName = 'addMailAccount';
        title = 'Add Yahoo';
        break;
    }

    const content = props => {
      return (
        <MailProviderForm {...props} kind={kind} mutationName={mutationName} />
      );
    };

    return <ModalTrigger title={title} trigger={trigger} content={content} />;
  };

  renderContent = (formProps: IFormProps) => {
    const { kind, onRemoveAccount, onAccountSelect } = this.props;
    const { values, isSubmitted } = formProps;

    const accountProps = {
      kind: kind as IntegrationTypes,
      addLink: 'nylas/oauth2/callback',
      onSelect: onAccountSelect,
      onRemove: onRemoveAccount,
      formProps,
      ...(kind === 'nylas-outlook' ||
      kind === 'nylas-imap' ||
      kind === 'nylas-yahoo' ||
      kind === 'nylas-exchange'
        ? { renderForm: this.renderForm }
        : {})
    };

    return (
      <>
        {this.state.loading && <Spinner />}
        <FormGroup>
          <Info>
            <strong>{__('Email add account description question')}</strong>
            <br />
            {__('Email add account description')}
          </Info>
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl {...formProps} name="name" required={true} />
        </FormGroup>

        <SelectBrand isRequired={true} formProps={formProps} />

        <Accounts {...accountProps} />

        <ModalFooter>
          {this.props.renderButton({
            name: 'integration',
            values: this.generateDoc(values),
            isSubmitted,
            callback: this.props.closeModal
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
