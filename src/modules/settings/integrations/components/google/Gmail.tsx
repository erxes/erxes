import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Spinner
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __, confirm } from 'modules/common/utils';
import { IBrand } from 'modules/settings/brands/types';
import * as React from 'react';
import { SelectBrand } from '..';
import { Row } from '../../styles';
import { CreateGmailMutationVariables, IAccount } from '../../types';

type Props = {
  save: (params: CreateGmailMutationVariables, callback?: () => void) => void;
  brands: IBrand[];
  accounts: IAccount[];
  gmailAuthUrl?: string;
  delink: (accountId: string) => void;
  closeModal: () => void;
};

class Gmail extends React.Component<
  Props,
  { loading: boolean; accountId?: string }
> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  onGmailRedirect = () => {
    const { gmailAuthUrl } = this.props;

    window.location.href = gmailAuthUrl || '';
  };

  onRemove(accountId: string) {
    const { delink } = this.props;

    confirm().then(() => {
      delink(accountId);
      this.setState({ accountId: '' });
    });
  }

  onAccChange = () => {
    const accountId = (document.getElementById('acc') as HTMLInputElement)
      .value;

    this.setState({ accountId: accountId || '' });

    if (accountId === '') {
      return;
    }
  };

  handleSubmit = e => {
    e.preventDefault();

    const doc: CreateGmailMutationVariables = {
      name: (document.getElementById('name') as HTMLInputElement).value,
      brandId: (document.getElementById('selectBrand') as HTMLInputElement)
        .value,
      accountId: (document.getElementById('acc') as HTMLInputElement).value
    };

    const callback = () => {
      this.setState({ loading: false }, () => this.props.closeModal());
    };

    this.setState({ loading: true });

    this.props.save(doc, callback);
  };

  renderAccountAction() {
    const { accountId } = this.state;

    if (!accountId || accountId === '') {
      return <Button onClick={this.onGmailRedirect}>Add Account</Button>;
    }

    return (
      <Button onClick={this.onRemove.bind(this, accountId)} btnStyle="danger">
        Remove Account
      </Button>
    );
  }

  render() {
    const { brands, accounts } = this.props;

    return (
      <form onSubmit={this.handleSubmit}>
        {this.state.loading && <Spinner />}
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl id="name" type="text" required={true} />
        </FormGroup>

        <SelectBrand brands={brands} />

        <FormGroup>
          <ControlLabel required={true}>Linked Accounts</ControlLabel>

          <Row>
            <FormControl
              componentClass="select"
              placeholder={__('Select account')}
              onChange={this.onAccChange}
              id="acc"
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

export default Gmail;
