import {
  __,
  Alert,
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';

import { ChangeAmount, ExtraDebtSection } from '../../contracts/styles';
import { ITransaction, ITransactionDoc } from '../types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  transaction: ITransaction;
  closeModal: () => void;
};

type State = {
  total: number;
  payment: number;
  maxTotal: number;
  firstTotal: number;
};

class TransactionForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { transaction = {}, invoice } = props;

    this.state = {
      total: transaction.total || 0,
      payment: transaction.payment || 0,

      maxTotal: Math.max(transaction.total || 0),
      firstTotal: (transaction.total || 0) - (transaction.futureDebt || 0)
    };
  }

  generateDoc = (values: { _id: string } & ITransactionDoc) => {
    const { transaction } = this.props;

    const finalValues = values;

    if (transaction && transaction._id) {
      finalValues._id = transaction._id;
    }

    return {
      _id: finalValues._id,
      payment: Number(this.state.payment || 0)
    };
  };

  onFieldClick = e => {
    e.target.select();
  };

  checkValid = () => {
    const { payment, maxTotal, firstTotal } = this.state;
    const total = Number(payment);

    if (total > maxTotal) {
      return `Overdue total: Max total is ${maxTotal}`;
    }

    if (total < firstTotal) {
      return `Missing first Total: first Total total is ${firstTotal}`;
    }

    return '';
  };

  onChangeField = e => {
    const name = (e.target as HTMLInputElement).name;
    let value = Number((e.target as HTMLInputElement).value);

    if (value < 0) {
      value = 0;
    }

    this.setState({ [name]: value } as any);

    setTimeout(() => {
      const validErr = this.checkValid();
      if (validErr) {
        Alert.error(validErr);
      }

      const { payment } = this.state;
      const total = Number(payment);

      this.setState({ total });
    }, 300);
  };

  renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  renderRow = (formProps: IFormProps, label, fieldName) => {
    const { transaction } = this.props;
    const trVal = transaction[fieldName] || 0;

    return (
      <FormWrapper>
        <FormColumn>
          <ChangeAmount>
            <ControlLabel>{`${label}`}</ControlLabel>
          </ChangeAmount>
        </FormColumn>
        <FormColumn>
          <ChangeAmount>{Number(trVal).toLocaleString()}</ChangeAmount>
        </FormColumn>
        <FormColumn>
          <FormControl
            {...formProps}
            type={'number'}
            name={fieldName}
            min={0}
            value={this.state[fieldName]}
            onChange={this.onChangeField}
            onClick={this.onFieldClick}
          />
        </FormColumn>
      </FormWrapper>
    );
  };

  renderInfo = (formProps: IFormProps) => {
    return (
      <>
        <FormWrapper>
          <FormColumn>
            <ControlLabel>{__(`Type`)}</ControlLabel>
          </FormColumn>
          <FormColumn>
            <ControlLabel>{__(`First calced`)}</ControlLabel>
          </FormColumn>
          <FormColumn>
            <ControlLabel>{__(`Saved`)}</ControlLabel>
          </FormColumn>
          <FormColumn>
            <ControlLabel>{__(`Change Values`)}</ControlLabel>
          </FormColumn>
          <FormColumn>
            <ControlLabel>{__(`Odd`)}</ControlLabel>
          </FormColumn>
        </FormWrapper>
        {this.renderRow(formProps, 'total', 'total')}
        {this.renderRow(formProps, 'payment', 'payment')}
      </>
    );
  };

  renderExtraDebt = () => {
    return (
      <ExtraDebtSection>
        <FormWrapper>
          <FormColumn>
            <ControlLabel>{__(`Future Debt`)}</ControlLabel>
          </FormColumn>
          <FormColumn></FormColumn>
        </FormWrapper>
        <FormWrapper>
          <FormColumn>
            <ControlLabel>{__(`Debt tenor`)}</ControlLabel>
          </FormColumn>
          <FormColumn></FormColumn>
          <FormColumn></FormColumn>
        </FormWrapper>
      </ExtraDebtSection>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { transaction } = this.props;
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>{this.renderInfo(formProps)}</FormColumn>
          </FormWrapper>
          {this.renderExtraDebt()}
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>
          {renderButton({
            values: this.generateDoc(values),
            isSubmitted,
            disableLoading: Boolean(this.checkValid())
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default TransactionForm;
