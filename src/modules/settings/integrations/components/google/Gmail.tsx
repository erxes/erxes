import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { IBrand } from 'modules/settings/brands/types';
import * as React from 'react';
import { SelectBrand } from '..';
import { IAccount } from '../../../linkedAccounts/types';
import { CreateGmailMutationVariables } from '../../types';

import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  Spinner
} from 'modules/common/components';
import { LinkedAccountButton, Row } from '../../styles';

type Props = {
  save: (params: CreateGmailMutationVariables, callback?: () => void) => void;
  brands: IBrand[];
  accounts: IAccount[];
  gmailAuthUrl?: string;
  closeModal: () => void;
};

class Gmail extends React.Component<Props, { loading: boolean }> {
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
              id="acc"
            >
              <option value="">Select account ...</option>

              {accounts.map((account, index) => (
                <option key={`account${index}`} value={account._id}>
                  {account.name}
                </option>
              ))}
            </FormControl>
            <LinkedAccountButton onClick={this.onGmailRedirect}>
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

export default Gmail;
