import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Spinner
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Accounts, SelectBrand } from '../../containers/';
import { CreateGmailMutationVariables } from '../../types';

type Props = {
  save: (params: CreateGmailMutationVariables, callback: () => void) => void;
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
    return (
      <form onSubmit={this.handleSubmit}>
        {this.state.loading && <Spinner />}
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl id="name" type="text" required={true} />
        </FormGroup>

        <SelectBrand isRequired={true} />

        <Accounts
          kind="gmail"
          addLink="gmailLogin"
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
