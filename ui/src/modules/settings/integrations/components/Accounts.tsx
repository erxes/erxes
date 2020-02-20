import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { IFormProps } from 'modules/common/types';
import { __, confirm } from 'modules/common/utils';
import React from 'react';
import { Row } from '../styles';
import { IAccount, IntegrationTypes } from '../types';

type Props = {
  onSelect: (accountId?: string) => void;
  accounts: IAccount[];
  formProps: IFormProps;
  onAdd: () => void;
  kind: IntegrationTypes;
  renderForm?: () => JSX.Element;
  removeAccount: (accountId: string) => void;
};

class Accounts extends React.Component<Props, { accountId?: string }> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  onChange = (e: React.FormEvent<HTMLElement>) => {
    const accountId = (e.currentTarget as HTMLInputElement).value;

    this.props.onSelect(accountId);

    this.setState({ accountId: accountId || '' });
  };

  onRemove(accountId: string) {
    const { removeAccount } = this.props;

    confirm().then(() => {
      removeAccount(accountId);
      this.setState({ accountId: '' });
    });
  }

  actionButton() {
    const { renderForm, onAdd, kind } = this.props;

    if (!renderForm) {
      if (kind === 'gmail' || kind === 'nylas-gmail') {
        return (
          <a href="#name" onClick={onAdd}>
            <img src='/images/btn_google_signin_dark_pressed_web@2x.png' width='130px' height='30px' alt='google button' />
          </a>
        );
      }

      return (
        <Button btnStyle="primary" size="small" icon="add" onClick={onAdd}>
          Add Account
        </Button>
      );
    }

    return renderForm();
  }

  renderAccountAction() {
    const { accountId } = this.state;

    if (!accountId) {
      return this.actionButton();
    }

    return (
      <Button
        onClick={this.onRemove.bind(this, accountId)}
        btnStyle="danger"
        size="small"
      >
        Remove Account
      </Button>
    );
  }

  render() {
    const { accounts, formProps } = this.props;

    return (
      <FormGroup>
        <ControlLabel required={true}>Linked Accounts</ControlLabel>
        <Row>
          <FormControl
            {...formProps}
            name="accountId"
            componentClass="select"
            placeholder={__('Select account')}
            onChange={this.onChange}
            required={true}
          >
            <option value="">{__('Select account ...')}</option>

            {accounts.map((account, index) => (
              <option key={index} value={account._id}>
                {account.name}
              </option>
            ))}
          </FormControl>
          &nbsp;
          {this.renderAccountAction()}
        </Row>
      </FormGroup>
    );
  }
}

export default Accounts;
