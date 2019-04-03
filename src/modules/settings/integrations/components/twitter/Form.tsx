import { Button } from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __, confirm } from 'modules/common/utils';
import { IBrand } from 'modules/settings/brands/types';
import { SelectBrand } from 'modules/settings/integrations/components';
import Accounts from 'modules/settings/integrations/containers/Accounts';
import * as React from 'react';

type Props = {
  brands: IBrand[];
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
    const { brands } = this.props;

    return (
      <form onSubmit={this.handleSubmit}>
        <SelectBrand brands={brands} />

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
