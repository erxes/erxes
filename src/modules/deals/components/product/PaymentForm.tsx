import { FormControl } from 'modules/common/components/form';
import ControlLabel from 'modules/common/components/form/Label';
import CURRENCIES from 'modules/common/constants/currencies';
import { __ } from 'modules/common/utils';
import { selectConfigOptions } from 'modules/deals/utils';
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
};

type State = {
  paymentsData: IPaymentsData;
  lessPay: { currency?: string; amount?: number };
};

class PaymentForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { payments } = this.props;

    this.state = {
      paymentsData: payments || {},
      lessPay: {}
    };

    this.calcLess();
  }

  componentWillMount() {
    this.calcLess();
  }

  calcLess() {
    const { total } = this.props;
    const { paymentsData } = this.state;

    const lessPay = Object.assign({}, total);

    Object.keys(paymentsData).forEach(key => {
      const perPaid = paymentsData[key];
      const currency = perPaid.currency || '';

      if (Object.keys(lessPay).includes(currency)) {
        lessPay[currency] = lessPay[currency] - (perPaid.amount || 0);
      } else {
        lessPay[currency] = -(perPaid.amount || 0);
      }
    });

    this.setState({ lessPay });
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

  paymentStateChange = (kind: string, name: string, value: string) => {
    const { onChangePaymentsData } = this.props;
    const { paymentsData } = this.state;

    if (!paymentsData[name]) {
      paymentsData[name] = {};
    }
    paymentsData[name][kind] = value;

    this.calcLess();
    this.setState({ paymentsData });
    onChangePaymentsData(paymentsData);
  };

  selectOption = option => (
    <div className="simple-option">
      <span>{option.label}</span>
    </div>
  );

  renderPaymentsByType(type) {
    const { currencies } = this.props;
    const { paymentsData, lessPay } = this.state;

    const onChange = e => {
      this.paymentStateChange(
        'amount',
        type.name,
        (e.target as HTMLInputElement).value
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
      Object.keys(lessPay).forEach(key => {
        if (
          lessPay[key] > 0 &&
          (!paymentsData[type.name] || !paymentsData[type.name].amount)
        ) {
          if (!paymentsData[type.name]) {
            paymentsData[type.name] = {};
          }

          paymentsData[type.name].amount = lessPay[key];
          paymentsData[type.name].currency = key;

          lessPay[key] = 0;

          this.setState({ paymentsData, lessPay });

          return;
        }
      });
    };

    return (
      <>
        <ContentColumn>
          <ControlLabel>{__(type.title)}</ControlLabel>
        </ContentColumn>
        <ContentColumn>
          <FormControl
            value={
              paymentsData[type.name]
                ? paymentsData[type.name].amount || ''
                : ''
            }
            type="number"
            placeholder={__('Type amount')}
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
              paymentsData[type.name]
                ? paymentsData[type.name].currency || 0
                : 0
            }
            onChange={currencyOnChange}
            optionRenderer={this.selectOption}
            options={selectConfigOptions(currencies, CURRENCIES)}
          />
        </ContentColumn>
      </>
    );
  }

  renderPayments() {
    return PAYMENT_TYPES.map(type => (
      <>
        <ContentRow>{this.renderPaymentsByType(type)}</ContentRow>
      </>
    ));
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
            {this.renderTotal(this.state.lessPay)}
          </ContentColumn>
        </ContentRowTitle>
        <Divider />
        <ContentRow>
          <ContentColumn>{this.renderPayments()}</ContentColumn>
        </ContentRow>
      </>
    );
  }
}

export default PaymentForm;
