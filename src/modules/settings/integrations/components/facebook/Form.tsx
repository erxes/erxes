import * as React from 'react';
import { SelectBrand } from '..';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from '../../../../common/components';
import { ModalFooter } from '../../../../common/styles/main';
import { __ } from '../../../../common/utils';
import { IBrand } from '../../../brands/types';
import { ILinkedAccount } from '../../../linkedAccounts/types';
import { IFacebookApp, IPages } from '../../types';

type Props = {
  save: (
    params: { name: string; brandId: string; appId: string; pageIds: string[] }
  ) => void;
  onAppSelect: (doc: { appId?: string; accountId?: string }) => void;
  brands: IBrand[];
  apps: IFacebookApp[];
  pages: IPages[];
  accounts: ILinkedAccount[];
};

class Facebook extends React.Component<Props> {
  onAppChange = () => {
    const appId = (document.getElementById('app') as HTMLInputElement).value;
    this.props.onAppSelect({ appId });
  };

  onAccChange = () => {
    const accountId = (document.getElementById('acc') as HTMLInputElement)
      .value;
    this.props.onAppSelect({ accountId });
  };

  collectCheckboxValues(name) {
    const values: string[] = [];
    const elements = document.getElementsByName(name);

    // tslint:disable-next-line
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as HTMLInputElement;

      if (element.checked) {
        values.push(element.value);
      }
    }

    return values;
  }

  handleSubmit = e => {
    e.preventDefault();

    this.props.save({
      name: (document.getElementById('name') as HTMLInputElement).value,
      brandId: (document.getElementById('selectBrand') as HTMLInputElement)
        .value,
      appId: (document.getElementById('app') as HTMLInputElement).value,
      pageIds: this.collectCheckboxValues('pages')
    });
  };

  render() {
    const { apps, pages, brands, accounts } = this.props;

    return (
      <form onSubmit={this.handleSubmit}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl id="name" type="text" required={true} />
        </FormGroup>

        <SelectBrand brands={brands} />

        <FormGroup>
          <ControlLabel>App</ControlLabel>

          <FormControl
            componentClass="select"
            placeholder={__('Select app')}
            onChange={this.onAppChange}
            id="app"
          >
            <option value="">Select app ...</option>

            {apps.map((app, index) => (
              <option key={`app${index}`} value={app.id}>
                {app.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Linked Accounts</ControlLabel>

          <FormControl
            componentClass="select"
            placeholder={__('Select account')}
            onChange={this.onAccChange}
            id="acc"
          >
            <option value="">Select account ...</option>

            {accounts.map((account, index) => (
              <option key={`account${index}`} value={account._id}>
                {account.accountName}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Pages</ControlLabel>

          {pages.map(page => (
            <div key={page.id}>
              <FormControl
                componentClass="checkbox"
                name="pages"
                key={page.id}
                value={page.id}
              >
                {page.name}
              </FormControl>
            </div>
          ))}
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

export default Facebook;
