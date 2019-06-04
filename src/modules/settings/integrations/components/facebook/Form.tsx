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
import { IPages } from '../../types';

type Props = {
  onSave: (params: any, callback: () => void) => void;
  onAccountSelect: (accountId?: string) => void;
  pages: IPages[];
  onRemoveAccount: (accountId: string) => void;
  closeModal: () => void;
};

class Facebook extends React.Component<Props, { loading: boolean }> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false
    };
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

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const doc = {
      name: (document.getElementById('name') as HTMLInputElement).value,
      brandId: (document.getElementById('selectBrand') as HTMLInputElement)
        .value,
      pageIds: this.collectCheckboxValues('pages')
    };

    this.setState({ loading: true });

    this.props.onSave(doc, () => {
      this.setState({ loading: false }, () => this.props.closeModal());
    });
  };

  renderPages() {
    const { pages } = this.props;

    if (pages.length === 0) {
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
          kind="facebook"
          addLink="fblogin"
          onSelect={onAccountSelect}
          onRemove={onRemoveAccount}
        />

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
