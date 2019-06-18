import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  Spinner
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Accounts, SelectBrand } from '../../containers/';
import { IPages } from '../../types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  onAccountSelect: (accountId?: string) => void;
  pages: IPages[];
  accountId?: string;
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

  generateDoc = (values: { name: string; brandId: string }) => {
    return {
      name: values.name,
      brandId: values.brandId,
      kind: 'facebook',
      accountId: this.props.accountId,
      data: {
        pageIds: this.collectCheckboxValues('pages')
      }
    };
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

  renderContent = (formProps: IFormProps) => {
    const { onRemoveAccount, onAccountSelect, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        {this.state.loading && <Spinner />}
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl {...formProps} name="name" required={true} />
        </FormGroup>

        <SelectBrand isRequired={true} formProps={formProps} />

        <Accounts
          kind="facebook"
          addLink="fblogin"
          onSelect={onAccountSelect}
          onRemove={onRemoveAccount}
          formProps={formProps}
        />

        {this.renderPages()}

        <ModalFooter>
          {renderButton({
            name: 'integration',
            values: this.generateDoc(values),
            isSubmitted,
            callback: this.props.closeModal
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default Facebook;
