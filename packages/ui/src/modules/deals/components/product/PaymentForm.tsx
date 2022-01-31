import { FormControl } from 'modules/common/components/form';
import ControlLabel from 'modules/common/components/form/Label';
import CURRENCIES from 'modules/common/constants/currencies';
import { __ } from 'modules/common/utils';
import { selectConfigOptions } from 'modules/deals/utils';
import { pluginsOfPaymentForm } from 'pluginUtils';
import React from 'react';
import Select from 'react-select-plus';
import { PAYMENT_TYPES } from '../../constants';
import {
  ContentColumn,
  ContentRow,
  ContentRowTitle,
  Divider,
  WrongLess
} from '../../styles';
import { IPaymentsData } from '../../types';

type Props = {
  total: { currency?: string; amount?: number };
  payments?: IPaymentsData;
  currencies: string[];
  onChangePaymentsData: (paymentsData: IPaymentsData) => void;
  calcChangePay: () => void;
  changePayData: { currency?: string; amount?: number };
};

type State = {
  paymentsData: IPaymentsData;
};

class PaymentForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { payments } = this.props;

    this.state = {
      paymentsData: payments || {}
    };
  }

  componentWillMount() {
    this.props.calcChangePay();
  }

  renderAmount(amount) {
    if (amount < 0) {
      return <WrongLess>{amount.toLocaleString()}</WrongLess>;
    }
    return amount.toLocaleString();
  }

  renderTotal(value) {
    return Object.keys(value).map(key => (
      <div key={key}>
        {this.renderAmount(value[key])} <b>{key}</b>
      </div>
    ));
  }

  paymentStateChange = (kind: string, name: string, value: string | number) => {
    const { onChangePaymentsData, calcChangePay } = this.props;
    const { paymentsData } = this.state;

    if (!paymentsData[name]) {
      paymentsData[name] = {};
    }
    paymentsData[name][kind] = value;

    calcChangePay();
    this.setState({ paymentsData });
    onChangePaymentsData(paymentsData);
  };

  selectOption = option => (
    <div className="simple-option">
      <span>{option.label}</span>
    </div>
  );

  renderPaymentsByType(type) {
    const { currencies, changePayData } = this.props;
    const { paymentsData } = this.state;

    const onChange = e => {
      if (
        (!paymentsData[type.name] || !paymentsData[type.name].currency) &&
        currencies.length > 0
      ) {
        this.paymentStateChange('currency', type.name, currencies[0]);
      }

      this.paymentStateChange(
        'amount',
        type.name,
        parseFloat((e.target as HTMLInputElement).value || '0')
      );
    };

    const currencyOnChange = (currency: HTMLOptionElement) => {
      this.paymentStateChange(
        'currency',
        type.name,
        currency ? currency.value : ''
      );
    };

    const onClick = () => {
      Object.keys(changePayData).forEach(key => {
        if (
          changePayData[key] > 0 &&
          (!paymentsData[type.name] || !paymentsData[type.name].amount)
        ) {
          if (!paymentsData[type.name]) {
            paymentsData[type.name] = {};
          }

          paymentsData[type.name].amount = changePayData[key];
          paymentsData[type.name].currency = key;

          changePayData[key] = 0;

          this.setState({ paymentsData });
          this.props.onChangePaymentsData(paymentsData);

          return;
        }
      });
    };

    return (
      <ContentRow key={type.name}>
        <ContentColumn>
          <ControlLabel>{__(type.title)}</ControlLabel>
        </ContentColumn>
        <ContentColumn>
          <FormControl
            value={
              paymentsData[type.name] ? paymentsData[type.name].amount : ''
            }
            type="number"
            placeholder={__('Type amount')}
            min={0}
            name={type.name}
            onChange={onChange}
            onClick={onClick}
          />
        </ContentColumn>
        <ContentColumn>
          <Select
            name={type.name}
            placeholder={__('Choose currency')}
            value={
              paymentsData[type.name] ? paymentsData[type.name].currency : 0
            }
            onChange={currencyOnChange}
            optionRenderer={this.selectOption}
            options={selectConfigOptions(currencies, CURRENCIES)}
          />
        </ContentColumn>
      </ContentRow>
    );
  }

  renderPayments() {
    return PAYMENT_TYPES.map(type => this.renderPaymentsByType(type));
  }

  render() {
    const { total } = this.props;

    return (
      <>
        <ContentRowTitle>
          <ContentColumn>
            <ControlLabel>Total</ControlLabel>
            {this.renderTotal(total)}
          </ContentColumn>
          <ContentColumn>
            <ControlLabel>Change</ControlLabel>
            {this.renderTotal(this.props.changePayData)}
          </ContentColumn>
        </ContentRowTitle>
        <Divider />

        {this.renderPayments()}
        {pluginsOfPaymentForm(type => this.renderPaymentsByType(type))}
      </>
    );
  }
}

export default PaymentForm;
