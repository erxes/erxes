import { getEnv } from 'apolloClient';
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
import { CreateFacebookMutationVariables, IAccount, IPages } from '../../types';

type Props = {
  save: (
    params: CreateFacebookMutationVariables,
    callback?: () => void
  ) => void;
  onAccSelect: (doc: { appId?: string; accountId?: string }) => void;
  brands: IBrand[];
  pages: IPages[];
  accounts: IAccount[];
  delink: (accountId: string) => void;
  closeModal: () => void;
};

class Facebook extends React.Component<
  Props,
  { loading: boolean; accountId?: string }
> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  onAccChange = () => {
    const accountId = (document.getElementById('acc') as HTMLInputElement)
      .value;

    this.setState({ accountId: accountId || '' });

    if (accountId === '') {
      return;
    }

    this.props.onAccSelect({ accountId });
  };

  onFacebookRedirect = () => {
    const { REACT_APP_API_URL } = getEnv();
    const url = `${REACT_APP_API_URL}/fblogin`;

    window.location.replace(url);
  };

  onRemove(accountId: string) {
    const { delink } = this.props;

    confirm().then(() => {
      delink(accountId);
      this.setState({ accountId: '' });
    });
  }

  collectCheckboxValues(name: string): string[] {
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

    const doc: CreateFacebookMutationVariables = {
      name: (document.getElementById('name') as HTMLInputElement).value,
      brandId: (document.getElementById('selectBrand') as HTMLInputElement)
        .value,
      accountId: (document.getElementById('acc') as HTMLInputElement).value,
      pageIds: this.collectCheckboxValues('pages')
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
      return <Button onClick={this.onFacebookRedirect}>Add Account</Button>;
    }

    return (
      <Button onClick={this.onRemove.bind(this, accountId)} btnStyle="danger">
        Remove Account
      </Button>
    );
  }

  renderPages() {
    const { pages } = this.props;

    if (pages.length === 0 || this.state.accountId === '') {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel required={true}>Pages</ControlLabel>

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
              <option value="">{__('Select account ...')}</option>

              {accounts.map((account, index) => (
                <option key={`account${index}`} value={account._id}>
                  {account.name}
                </option>
              ))}
            </FormControl>
            {this.renderAccountAction()}
          </Row>
        </FormGroup>

        {this.renderPages()}

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
