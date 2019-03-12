import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __, confirm } from 'modules/common/utils';
import { IBrand } from 'modules/settings/brands/types';
import { SelectBrand } from 'modules/settings/integrations/components';
import { IAccount } from 'modules/settings/linkedAccounts/types';
import * as React from 'react';
import { LinkedAccount, Row } from '../../styles';

type Props = {
  brands: IBrand[];
  twitterAuthUrl: string;
  accounts: IAccount[];
  delink: (accountId: string) => void;
  save: (
    { brandId, accountId }: { brandId: string; accountId: string }
  ) => void;
};

class Twitter extends React.Component<Props, { accountId?: string }> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  onTwitterRedirect = () => {
    const { twitterAuthUrl } = this.props;

    window.location.href = twitterAuthUrl;
  };

  onClick(accountId: string) {
    const { delink } = this.props;

    confirm().then(() => {
      delink(accountId);
    });
  }

  onAccChange = () => {
    const accountId = (document.getElementById(
      'selectAccount'
    ) as HTMLInputElement).value;

    if (accountId === '') {
      return;
    }

    this.setState({ accountId: accountId || '' });
  };

  handleSubmit = e => {
    e.preventDefault();

    this.props.save({
      brandId: (document.getElementById('selectBrand') as HTMLInputElement)
        .value,
      accountId: (document.getElementById('selectAccount') as HTMLInputElement)
        .value
    });
  };

  renderAccountAction() {
    const { accountId } = this.state;

    if (!accountId || accountId === '0') {
      return (
        <LinkedAccount onClick={this.onTwitterRedirect}>
          Add Account
        </LinkedAccount>
      );
    }

    return (
      <LinkedAccount
        onClick={this.onClick.bind(this, accountId)}
        isRemove={true}
      >
        Remove Account
      </LinkedAccount>
    );
  }

  render() {
    const { accounts, brands } = this.props;

    return (
      <form onSubmit={this.handleSubmit}>
        <SelectBrand brands={brands} />

        <FormGroup>
          <ControlLabel>Linked Accounts</ControlLabel>

          <Row>
            <FormControl
              componentClass="select"
              placeholder={__('Select account')}
              onChange={this.onAccChange}
              id="selectAccount"
            >
              <option value="0">Select account ...</option>

              {accounts.map((account, index) => (
                <option key={`account${index}`} value={account._id}>
                  {account.name}
                </option>
              ))}
            </FormControl>
            {this.renderAccountAction()}
          </Row>
        </FormGroup>

        <ModalFooter>
          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default Twitter;
