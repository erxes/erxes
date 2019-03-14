import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __, confirm } from 'modules/common/utils';
import { IBrand } from 'modules/settings/brands/types';
import { SelectBrand } from 'modules/settings/integrations/components';
import * as React from 'react';
import { Row } from '../../styles';
import { IAccount } from '../../types';

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

  onRemove(accountId: string) {
    const { delink } = this.props;

    confirm().then(() => {
      delink(accountId);
      this.setState({ accountId: '' });
    });
  }

  onAccChange = () => {
    const accountId = (document.getElementById(
      'selectAccount'
    ) as HTMLInputElement).value;

    this.setState({ accountId: accountId || '' });

    if (accountId === '') {
      return;
    }
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

    if (!accountId || accountId === '') {
      return <Button onClick={this.onTwitterRedirect}>Add Account</Button>;
    }

    return (
      <Button onClick={this.onRemove.bind(this, accountId)} btnStyle="danger">
        Remove Account
      </Button>
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
              <option value="">Select account ...</option>

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
