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
import { Accounts, SelectBrand } from '../../containers';
import { CreateGmailMutationVariables } from '../../types';

type Props = {
  onSave: (params: CreateGmailMutationVariables, callback: () => void) => void;
  onAccountSelect: (accountId?: string) => void;
  onRemoveAccount: (accountId: string) => void;
  closeModal: () => void;
};

class Gmail extends React.Component<Props, { loading: boolean }> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const doc = {
      name: (document.getElementById('name') as HTMLInputElement).value,
      brandId: (document.getElementById('selectBrand') as HTMLInputElement)
        .value
    };

    this.setState({ loading: true });

    this.props.onSave(doc, () => {
      this.setState({ loading: false }, () => this.props.closeModal());
    });
  };

  render() {
    const { onRemoveAccount, onAccountSelect } = this.props;

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
          addLink="gmaillogin"
          onSelect={onAccountSelect}
          onRemove={onRemoveAccount}
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
