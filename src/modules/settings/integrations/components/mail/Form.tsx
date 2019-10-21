import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import CommonForm from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Spinner from 'modules/common/components/Spinner';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import * as React from 'react';
import Accounts from '../../containers/Accounts';
import ImapForm from '../../containers/mail/ImapForm';
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
    const trigger = (
      <Button btnStyle="primary" size="small" icon="add">
        Add Account
      </Button>
    );

    const content = props => <ImapForm {...props} />;

    return (
      <ModalTrigger title="Add IMAP" trigger={trigger} content={content} />
    );
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
      ...(kind === 'nylas-imap' ? { renderForm: this.renderForm } : {})
    };

    return (
      <>
        {this.state.loading && <Spinner />}
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
