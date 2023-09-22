import {
  ContentColumn,
  ContentRowTitle,
  Divider,
  WrongLess
} from '../../styles';

import CURRENCIES from '@erxes/ui/src/constants/currencies';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { Flex } from '@erxes/ui/src/styles/main';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IPaymentsData } from '../../types';
import { PAYMENT_TYPES } from '../../constants';
import React from 'react';
import Select from 'react-select-plus';
import { __ } from '@erxes/ui/src/utils';
import { pluginsOfPaymentForm } from 'coreui/pluginUtils';
import { selectConfigOptions } from '../../utils';
import { type } from 'os';

type Props = {
  total: { currency?: string; amount?: number };
  payments?: IPaymentsData;
  currencies: string[];
  onChangePaymentsData: (paymentsData: IPaymentsData) => void;
  calcChangePay: () => void;
  changePayData: {
    currency?: string;
    amount?: number;
    type?: string;
    title?: string;
    config?: string;
    icon?: string;
  };
  paymentQuery: any;
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

  componentDidMount(): void {
    const { paymentQuery } = this.props;

    if (paymentQuery?.length) {
      const updatedPaymentsData = { ...this.state.paymentsData };
      console.log(paymentQuery.paymentTypes, ' paymentQuery.paymentType');
      paymentQuery[0].paymentTypes.forEach(item => {
        const { title, type, config, icon } = item;
        updatedPaymentsData[title] = { title, type, config, icon };
      });
      this.setState({ paymentsData: updatedPaymentsData });
    }
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

  paymentStateChange = (
    kind: string,
    title: string,
    value: string | number
  ) => {
    const { onChangePaymentsData, calcChangePay } = this.props;
    const { paymentsData } = this.state;

    if (!paymentsData[title]) {
      paymentsData[title] = {};
    }
    paymentsData[title][kind] = value;

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
        (!paymentsData[type.title] || !paymentsData[type.title].currency) &&
        currencies.length > 0
      ) {
        this.paymentStateChange('currency', type.title, currencies[0]);
      }

      this.paymentStateChange(
        'amount',
        type.title,
        parseFloat((e.target as HTMLInputElement).value || '0')
      );
    };

    const currencyOnChange = (currency: HTMLOptionElement) => {
      this.paymentStateChange(
        'currency',
        type.title,
        currency ? currency.value : ''
      );
    };

    const onClick = () => {
      Object.keys(changePayData).forEach(key => {
        if (
          changePayData[key] > 0 &&
          (!paymentsData[type.title] || !paymentsData[type.title].amount)
        ) {
          if (!paymentsData[type.title]) {
            paymentsData[type.title] = {};
          }

          paymentsData[type.title].amount = changePayData[key];
          paymentsData[type.title].currency = key;

          changePayData[key] = 0;

          this.setState({ paymentsData });
          this.props.onChangePaymentsData(paymentsData);

          return;
        }
      });
    };

    return (
      <Flex key={type._id}>
        <ContentColumn>
          <ControlLabel>{__(type.title)}</ControlLabel>
        </ContentColumn>
        <ContentColumn>
          <ControlLabel>{__(type.type)}</ControlLabel>
        </ContentColumn>
        <ContentColumn>
          <ControlLabel>{__(type.config)}</ControlLabel>
        </ContentColumn>
        <ContentColumn>
          <FormControl
            value={
              paymentsData[type.title] ? paymentsData[type.title].amount : ''
            }
            type="number"
            placeholder={__('Type amount')}
            min={0}
            name={type.title}
            onChange={onChange}
            onClick={onClick}
          />
        </ContentColumn>
        <ContentColumn>
          <Select
            name={type.title}
            placeholder={__('Choose currency')}
            value={
              paymentsData[type.title] ? paymentsData[type.title].currency : 0
            }
            onChange={currencyOnChange}
            optionRenderer={this.selectOption}
            options={selectConfigOptions(currencies, CURRENCIES)}
          />
        </ContentColumn>
      </Flex>
    );
  }

  renderPayments() {
    const payment_type = this.props.paymentQuery[0].paymentTypes;
    return payment_type.map(type => this.renderPaymentsByType(type));
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
