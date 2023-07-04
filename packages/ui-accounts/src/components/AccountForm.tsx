import {
  FormColumn,
  FormWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IAccount, IAccountCategory } from '../types';
import { IS_BALANCE, ACCOUNT_TYPE, JOURNAL_TYPES } from '../constants';
import { generateCategoryOptions } from '@erxes/ui/src/utils';
import Button from '@erxes/ui/src/components/Button';
import CategoryForm from '../containers/CategoryForm';
import CommonForm from '@erxes/ui/src/components/form/Form';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import { Row } from '@erxes/ui-inbox/src/settings/integrations/styles';

type Props = {
  account?: IAccount;
  accountCategories: IAccountCategory[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  disabled: boolean;
  currency: number;
  closePercent: number;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const account = props.account || ({} as IAccount);
    const { currency, isbalance, closePercent } = account;

    this.state = {
      disabled: isbalance === 'true' ? false : true,
      currency: currency ? currency : 0,
      closePercent: closePercent ? closePercent : 0
    };
  }

  generateDoc = (values: {
    _id?: string;
    currency: number;
    closePercent: number;
  }) => {
    const { account } = this.props;
    const finalValues = values;
    const { currency, closePercent } = this.state;

    if (account) {
      finalValues._id = account._id;
    }

    return {
      ...finalValues,
      currency,
      closePercent
    };
  };

  onComboEvent = (variable: string, e) => {
    let value = '';
    value = e.target.value;
    this.setState({ [variable]: value } as any);
  };

  renderFormTrigger(trigger: React.ReactNode) {
    const content = props => (
      <CategoryForm {...props} categories={this.props.accountCategories} />
    );
    return (
      <ModalTrigger title="Add category" trigger={trigger} content={content} />
    );
  }
  onBalanceChange = e => {
    const { closePercent } = this.state;
    const yes = e.target.value === 'true';
    this.setState({
      disabled: yes ? false : true,
      closePercent: yes ? closePercent : 0
    });
  };
  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal, account, accountCategories } = this.props;
    const { values, isSubmitted } = formProps;
    const object = account || ({} as IAccount);

    const trigger = (
      <Button btnStyle="primary" uppercase={false} icon="plus-circle">
        Add category
      </Button>
    );

    const { disabled, currency, closePercent } = this.state;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Name</ControlLabel>
              <FormControl
                {...formProps}
                name="name"
                defaultValue={object.name}
                autoFocus={true}
                required={true}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel required={true}>Type</ControlLabel>
              <FormControl
                {...formProps}
                name="type"
                componentClass="select"
                defaultValue={object.type}
                required={true}
              >
                {Object.keys(ACCOUNT_TYPE).map((typeName, index) => (
                  <option key={index} value={ACCOUNT_TYPE[typeName]}>
                    {typeName}
                  </option>
                ))}
              </FormControl>
            </FormGroup>

            <FormGroup>
              <ControlLabel required={true}>Code</ControlLabel>
              <FormControl
                {...formProps}
                name="code"
                defaultValue={object.code}
                autoComplete="off"
                required={true}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel required={true}>Category</ControlLabel>
              <Row>
                <FormControl
                  {...formProps}
                  name="categoryId"
                  componentClass="select"
                  defaultValue={object.categoryId}
                  required={true}
                >
                  {generateCategoryOptions(accountCategories)}
                </FormControl>

                {this.renderFormTrigger(trigger)}
              </Row>
            </FormGroup>

            <FormGroup>
              <ControlLabel required={true}>Currency</ControlLabel>
              <FormControl
                {...formProps}
                name="currency"
                value={currency}
                onChange={this.onComboEvent.bind(this, 'currency')}
                // defaultValue={object.currency}
                required={true}
                type="number"
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel required={true}>Balance</ControlLabel>
              <FormControl
                {...formProps}
                name="isbalance"
                componentClass="select"
                onChange={this.onBalanceChange}
                defaultValue={object.isbalance}
                options={IS_BALANCE}
                required={true}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Close Percent</ControlLabel>
              <FormControl
                {...formProps}
                name="closePercent"
                value={closePercent}
                disabled={disabled}
                onChange={this.onComboEvent.bind(this, 'closePercent')}
                type="number"
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>journal</ControlLabel>
              <FormControl
                {...formProps}
                name="journal"
                componentClass="select"
                defaultValue={object.type}
                required={true}
              >
                {Object.keys(JOURNAL_TYPES).map((typeName, index) => (
                  <option key={index} value={JOURNAL_TYPES[typeName]}>
                    {typeName}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            name: 'account form',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: account
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
