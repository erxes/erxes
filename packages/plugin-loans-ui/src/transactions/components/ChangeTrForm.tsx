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
  interestEve: number;
  interestNonce: number;
  undue: number;
  insurance: number;
  debt: number;
  futureDebt: number;
  debtTenor: number;
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
      interestEve: transaction.interestEve || 0,
      interestNonce: transaction.interestNonce || 0,
      undue: transaction.undue || 0,
      insurance: transaction.insurance || 0,
      debt: transaction.debt || 0,
      futureDebt: transaction.futureDebt || 0,
      debtTenor: transaction.debtTenor || 0,

      maxTotal: Math.max(
        transaction.calcedInfo.total || 0,
        transaction.total || 0
      ),
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
      payment: Number(this.state.payment || 0),
      interestEve: Number(this.state.interestEve || 0),
      interestNonce: Number(this.state.interestNonce || 0),
      undue: Number(this.state.undue || 0),
      insurance: Number(this.state.insurance || 0),
      debt: Number(this.state.debt || 0),
      futureDebt: Number(this.state.futureDebt || 0),
      debtTenor: Number(this.state.debtTenor || 0)
    };
  };

  onFieldClick = e => {
    e.target.select();
  };

  checkValid = () => {
    const {
      payment,
      interestEve,
      interestNonce,
      undue,
      insurance,
      debt,
      maxTotal,
      firstTotal,
      futureDebt,
      debtTenor
    } = this.state;
    const { transaction } = this.props;
    const total =
      Number(payment) +
      Number(interestEve) +
      Number(interestNonce) +
      Number(undue) +
      Number(insurance) +
      Number(debt);

    if (total > maxTotal) {
      return `Overdue total: Max total is ${maxTotal}`;
    }

    if (total < firstTotal) {
      return `Missing first Total: first Total total is ${firstTotal}`;
    }

    if (futureDebt && transaction.calcedInfo.total < firstTotal) {
      return `Overdue future debt`;
    }

    if (futureDebt && !debtTenor) {
      return `must fill debt Tenor when Future debt`;
    }

    return '';
  };

  onChangeField = e => {
    const name = (e.target as HTMLInputElement).name;
    let value = Number((e.target as HTMLInputElement).value);
    const oldValue = this.state[name];

    if (value < 0) {
      value = 0;
    }

    this.setState({ [name]: value } as any);

    setTimeout(() => {
      const validErr = this.checkValid();
      if (validErr) {
        Alert.error(validErr);
      }

      const {
        payment,
        interestEve,
        interestNonce,
        undue,
        insurance,
        debt,
        futureDebt
      } = this.state;
      const total =
        Number(payment) +
        Number(interestEve) +
        Number(interestNonce) +
        Number(undue) +
        Number(insurance) +
        Number(debt);

      this.setState({ total });

      if (name !== 'futureDebt') {
        this.setState({ futureDebt: total - this.state.firstTotal });
      }
      if (!this.state.futureDebt) {
        this.setState({ debtTenor: 0 });
      }
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
    const trCalcedInfo = transaction.calcedInfo;
    const trCalcedVal = trCalcedInfo[fieldName] || 0;
    const trVal = transaction[fieldName] || 0;

    return (
      <FormWrapper>
        <FormColumn>
          <ChangeAmount>
            <ControlLabel>{`${label}`}</ControlLabel>
          </ChangeAmount>
        </FormColumn>
        <FormColumn>
          <ChangeAmount>{Number(trCalcedVal).toLocaleString()}</ChangeAmount>
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
        <FormColumn>
          <ChangeAmount>
            {Number(trCalcedVal - this.state[fieldName]).toLocaleString()}
          </ChangeAmount>
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
        {this.renderRow(formProps, 'interest eve', 'interestEve')}
        {this.renderRow(formProps, 'interest nonce', 'interestNonce')}
        {this.renderRow(formProps, 'undue', 'undue')}
        {this.renderRow(formProps, 'insurance', 'insurance')}
        {this.renderRow(formProps, 'debt', 'debt')}
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
          <FormColumn>
            <ChangeAmount>
              {Number(this.props.transaction.futureDebt).toLocaleString()}
            </ChangeAmount>
          </FormColumn>
          <FormColumn>
            <FormControl
              type={'number'}
              name={'futureDebt'}
              min={0}
              value={this.state.futureDebt}
              onChange={this.onChangeField}
              onClick={this.onFieldClick}
            />
          </FormColumn>
          <FormColumn></FormColumn>
        </FormWrapper>
        <FormWrapper>
          <FormColumn>
            <ControlLabel>{__(`Debt tenor`)}</ControlLabel>
          </FormColumn>
          <FormColumn></FormColumn>
          <FormColumn>
            <ChangeAmount>
              {Number(this.props.transaction.debtTenor).toLocaleString()}
            </ChangeAmount>
          </FormColumn>
          <FormColumn>
            <FormControl
              type={'number'}
              name={'debtTenor'}
              min={1}
              value={Math.round(this.state.debtTenor)}
              onChange={this.onChangeField}
              onClick={this.onFieldClick}
            />
          </FormColumn>
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
