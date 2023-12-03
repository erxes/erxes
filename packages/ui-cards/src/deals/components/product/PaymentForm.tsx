import {
  ContentColumn,
  ContentRowTitle,
  Divider,
  WrongLess
} from '../../styles';
import { isEnabled } from '@erxes/ui/src/utils/core';
import CURRENCIES from '@erxes/ui/src/constants/currencies';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { Flex } from '@erxes/ui/src/styles/main';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IPaymentsData, IDeal, IMobileAmounts } from '../../types';
import { PAYMENT_TYPES } from '../../constants';
import React from 'react';
import Select from 'react-select-plus';
import { pluginsOfPaymentForm } from 'coreui/pluginUtils';
import { selectConfigOptions } from '../../utils';
import { __ } from '@erxes/ui/src';
import PaymentModal from './PaymentModal';

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
  dealQuery: IDeal;
  mobileAmounts?: any;
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
  paymentStateChange = (kind: string, type: string, value: string | number) => {
    const { onChangePaymentsData, calcChangePay, paymentQuery } = this.props;
    const { paymentsData } = this.state;
    // Check if paymentsData[type] is falsy
    if (!paymentsData[type]) {
      paymentsData[type] = {};
      if (paymentQuery?.length) {
        paymentQuery[0].paymentTypes.forEach(item => {
          if (type === item.type) {
            paymentsData[type] = {
              title: item.title,
              type: item.type,
              config: item.config,
              icon: item.icon
            };
          }
        });
      }
    }

    paymentsData[type][kind] = value;
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
        (!paymentsData[type.type] || !paymentsData[type.type].currency) &&
        currencies.length > 0
      ) {
        this.paymentStateChange('currency', type.type, currencies[0]);
      }
      this.paymentStateChange(
        'amount',
        type.type,
        parseFloat((e.target as HTMLInputElement).value || '0')
      );
    };

    const currencyOnChange = (currency: HTMLOptionElement) => {
      this.paymentStateChange(
        'currency',
        type.type,
        currency ? currency.value : ''
      );
    };

    const onClick = () => {
      Object.keys(changePayData).forEach(key => {
        if (
          changePayData[key] > 0 &&
          (!paymentsData[type.type] || !paymentsData[type.type].amount)
        ) {
          if (!paymentsData[type.type]) {
            paymentsData[type.type] = {};
          }

          paymentsData[type.type].amount = changePayData[key];
          paymentsData[type.type].currency = key;
          changePayData[key] = 0;

          this.setState({ paymentsData });
          this.props.onChangePaymentsData(paymentsData);

          return;
        }
      });
    };

    return (
      <Flex key={type.type}>
        <ContentColumn>
          <ControlLabel>{__(type.title)}</ControlLabel>
        </ContentColumn>
        <ContentColumn>
          <FormControl
            value={
              paymentsData[type.type] ? paymentsData[type.type].amount : ''
            }
            type="number"
            placeholder={__('Type amount')}
            min={0}
            name={type.type}
            onChange={onChange}
            onClick={onClick}
          />
        </ContentColumn>

        <ContentColumn>
          {type.type === 'mobile' && this.props.mobileAmounts === null ? (
            <PaymentModal
              payment={this.props.paymentQuery}
              paymentsData={paymentsData}
              dealQuery={this.props.dealQuery}
            />
          ) : (
            type.type !== 'mobile' && (
              <Select
                name={type.type}
                placeholder={__('Choose currency')}
                value={
                  type.type !== 'mobile' && paymentsData[type.type]
                    ? paymentsData[type.type].currency
                    : 0
                }
                onChange={currencyOnChange}
                optionRenderer={this.selectOption}
                options={selectConfigOptions(currencies, CURRENCIES)}
              />
            )
          )}
        </ContentColumn>
      </Flex>
    );
  }

  renderPayments() {
    const payment_type = this.props.paymentQuery[0]?.paymentTypes;
    const paymentData = this.props.dealQuery.paymentsData;
    const mergedItems = { ...paymentData };

    if (Array.isArray(payment_type)) {
      for (const item of payment_type) {
        if (item && item.type) {
          const existingItem = mergedItems[item.type];
          if (existingItem) {
            // If the item already exists, merge properties from payment_type
            mergedItems[item.type] = {
              ...existingItem,
              ...item
            };
          } else {
            // If the item does not exist in paymentsData, add it
            mergedItems[item.type] = item;
          }
        }
      }
    }
    PAYMENT_TYPES.map(item => {
      mergedItems[item.type] = item;
    });
    // mergedItems[PAYMENT_TYPES.type] = PAYMENT_TYPES;

    const result = Object.values(mergedItems);
    result.sort((a, b) => {
      const typeA = a.type || '';
      const typeB = b.type || '';

      if (typeA === 'cash') {
        return -1; // "cash" should come before others
      } else if (typeB === 'cash') {
        return 1; // "cash" should come before others
      } else if (typeA === 'mobile') {
        return -1; // "mobile" should come after "cash"
      } else if (typeB === 'mobile') {
        return 1; // "mobile" should come after "cash"
      } else {
        return typeA.localeCompare(typeB); // Sort other types alphabetically
      }
    });

    return result.map(type => this.renderPaymentsByType(type));
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

        {this.renderPayments()}

        {pluginsOfPaymentForm(type => this.renderPaymentsByType(type))}
      </>
    );
  }
}

export default PaymentForm;
