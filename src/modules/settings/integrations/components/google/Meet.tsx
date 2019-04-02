import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import Accounts from '../../containers/Accounts';

type Props = {
  save: (
    doc: { name: string; accountId: string },
    callback: () => void
  ) => void;
  closeModal: () => void;
  gmailAuthUrl: string;
};

class Meet extends React.Component<
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

  onSelectAccount = (accountId?: string) => {
    this.setState({ accountId });
  };

  onRemoveAccount = () => {
    this.setState({ accountId: '' });
  };

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { accountId } = this.state;

    if (!accountId) {
      return;
    }

    const doc = {
      name: (document.getElementById('name') as HTMLInputElement).value,
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
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl id="name" type="text" required={true} />
        </FormGroup>

        <Accounts
          kind="gmail"
          onAdd={this.onGmailRedirect}
          onSelect={this.onSelectAccount}
          onRemove={this.onRemoveAccount}
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

export default Meet;
