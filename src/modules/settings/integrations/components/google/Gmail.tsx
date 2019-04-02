import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Spinner
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { IBrand } from 'modules/settings/brands/types';
import * as React from 'react';
import { SelectBrand } from '..';
import Accounts from '../../containers/Accounts';
import { CreateGmailMutationVariables } from '../../types';

type Props = {
  save: (params: CreateGmailMutationVariables, callback: () => void) => void;
  brands: IBrand[];
  gmailAuthUrl?: string;
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

  onRemoveAccount = () => {
    this.setState({ accountId: '' });
  };

  onSelectAccount = (accountId?: string) => {
    this.setState({ accountId });
  };

  handleSubmit = e => {
    e.preventDefault();

    const { accountId } = this.state;

    if (!accountId) {
      return;
    }

    const doc: CreateGmailMutationVariables = {
      name: (document.getElementById('name') as HTMLInputElement).value,
      brandId: (document.getElementById('selectBrand') as HTMLInputElement)
        .value,
      accountId
    };

    this.setState({ loading: true });

    this.props.save(doc, () => {
      this.setState({ loading: false }, () => this.props.closeModal());
    });
  };

  render() {
    const { brands } = this.props;

    return (
      <form onSubmit={this.handleSubmit}>
        {this.state.loading && <Spinner />}
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl id="name" type="text" required={true} />
        </FormGroup>

        <SelectBrand brands={brands} />

        <Accounts
          kind="gmail"
          onAdd={this.onGmailRedirect}
          onRemove={this.onRemoveAccount}
          onSelect={this.onSelectAccount}
        />

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
