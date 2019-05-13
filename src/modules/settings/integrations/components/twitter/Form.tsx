import { Button } from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __, confirm } from 'modules/common/utils';
import * as React from 'react';
import { Accounts, SelectBrand } from '../../containers/';

type Props = {
  save: (
    { brandId, accountId }: { brandId: string; accountId: string }
  ) => void;
};

class Twitter extends React.Component<Props, { accountId?: string }> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  onAccountRemove() {
    confirm().then(() => {
      this.setState({ accountId: '' });
    });
  }

  onAccountSelect = (accountId?: string) => {
    this.setState({ accountId });
  };

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { accountId } = this.state;

    if (!accountId) {
      return;
    }

    this.props.save({
      brandId: (document.getElementById('selectBrand') as HTMLInputElement)
        .value,
      accountId
    });
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <SelectBrand isRequired={true} />

        <Accounts
          kind="twitter"
          addLink="twitterLogin"
          onRemove={this.onAccountRemove}
          onSelect={this.onAccountSelect}
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

export default Twitter;
