import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Info from 'modules/common/components/Info';
import Spinner from 'modules/common/components/Spinner';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import Accounts from '../../containers/Accounts';
import SelectBrand from '../../containers/SelectBrand';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  onAccountSelect: (accountId?: string) => void;
  onRemoveAccount: (accountId: string) => void;
  closeModal: () => void;
  accountId: string;
  email: string;
};

class Gmail extends React.Component<Props, { loading: boolean }> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  generateDoc = (values: { name: string; brandId: string }) => {
    const { accountId, email } = this.props;

    return {
      ...values,
      kind: 'gmail',
      accountId,
      data: { email }
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { onRemoveAccount, onAccountSelect, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

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
          <FormControl
            {...formProps}
            name="name"
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <SelectBrand isRequired={true} formProps={formProps} />

        <Accounts
          kind="gmail"
          addLink="gmaillogin"
          onSelect={onAccountSelect}
          onRemove={onRemoveAccount}
          formProps={formProps}
        />

        <ModalFooter>
          {renderButton({
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
    return <Form renderContent={this.renderContent} />;
  }
}

export default Gmail;
