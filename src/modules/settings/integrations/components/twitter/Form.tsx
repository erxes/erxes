import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { IBrand } from 'modules/settings/brands/types';
import { SelectBrand } from 'modules/settings/integrations/components';
import { IAccount } from 'modules/settings/linkedAccounts/types';
import * as React from 'react';
import { LinkedAccountButton, Row } from '../../styles';

type Props = {
  brands: IBrand[];
  twitterAuthUrl: string;
  accounts: IAccount[];
  save: (
    { brandId, accountId }: { brandId: string; accountId: string }
  ) => void;
};

class Twitter extends React.Component<Props> {
  handleSubmit = e => {
    e.preventDefault();

    this.props.save({
      brandId: (document.getElementById('selectBrand') as HTMLInputElement)
        .value,
      accountId: (document.getElementById('selectAccount') as HTMLInputElement)
        .value
    });
  };

  onTwitterRedirect = () => {
    const { twitterAuthUrl } = this.props;

    window.location.href = twitterAuthUrl;
  };

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
              id="selectAccount"
            >
              <option value="">Select account ...</option>

              {accounts.map((account, index) => (
                <option key={`account${index}`} value={account._id}>
                  {account.name}
                </option>
              ))}
            </FormControl>
            <LinkedAccountButton onClick={this.onTwitterRedirect}>
              <Icon icon="plus" />
            </LinkedAccountButton>
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
