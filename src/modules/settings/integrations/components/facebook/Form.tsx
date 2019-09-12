import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Spinner from 'modules/common/components/Spinner';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';
import Accounts from '../../containers/Accounts';
import SelectBrand from '../../containers/SelectBrand';
import { IPages } from '../../types';

type Props = {
  kind: string;
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

  generateDoc = (values: {
    messengerName: string;
    brandId: string;
    accountId: string;
  }) => {
    const { accountId, kind } = this.props;

    return {
      name: values.messengerName,
      brandId: values.brandId,
      kind,
      accountId: accountId ? accountId : values.accountId,
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
          <FormControl {...formProps} name="messengerName" required={true} />
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
