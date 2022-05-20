import Button from '../../common/components/Button';
import client from '../../../apolloClient';
import gql from 'graphql-tag';
import queries from '../graphql/queries';
import React from 'react';
import Stage from './Stage';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { __ } from '../../common/utils';
import { ColumnBetween } from '../../common/styles/main';
import { formatNumber } from '../../utils';
import { ControlLabel, FormControl } from '../../common/components/form';
import { IConfig, IOption } from '../../types';
import { ICustomer, IOrder, IOrderItemInput } from '../types';
import {
  Amount,
  CalculationHeader,
  Divider,
  // PaymentInfo,
  ProductLabel,
  Types
} from '../styles';
import { ORDER_TYPES, ORDER_STATUSES, POS_MODES } from '../../constants';
import ModalTrigger from '../../common/components/ModalTrigger';
import OrderInfo from './splitPayment/OrderInfo';

const Wrapper = styledTS<{ color?: string; showPayment?: boolean }>(styled.div)`
  padding: 0 10px 0 10px;
  height: 100%;
  position: relative;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.10);
  border-radius: 16px;
  background: #fff;
  overflow: auto;

  .ioevLe:checked + span:before, .hCqfzh .react-toggle--checked .react-toggle-track {
    background-color: ${props => props.color && props.color};
  }


  ${props =>
    props.showPayment &&
    css`
      &:before {
        content: '';
        background: rgba(0, 0, 0, 0.25);
        position: absolute;
        z-index: 2;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
      }
    `}
`;

const ButtonWrapper = styledTS<{ showPayment?: boolean }>(styled.div)`
  > button {
    margin-bottom: 10px;
    margin-left: 0;
  }

  ${props =>
    props.showPayment &&
    css`
      background: #fff;
      z-index: 100;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 10px;
    `}
`;

const generateLabel = customer => {
  const { firstName, primaryEmail, primaryPhone, lastName } =
    customer || ({} as ICustomer);

  let value = firstName ? firstName.toUpperCase() : '';

  if (lastName) {
    value = `${value} ${lastName}`;
  }
  if (primaryPhone) {
    value = `${value} (${primaryPhone})`;
  }
  if (primaryEmail) {
    value = `${value} /${primaryEmail}/`;
  }

  return value;
};

// get user options for react-select-plus
export const generateLabelOptions = (array: ICustomer[] = []): IOption[] => {
  return array.map(item => {
    const value = generateLabel(item);
    return { value: item._id, label: value };
  });
};

type Props = {
  orientation: string;
  totalAmount: number;
  setItems: (items: IOrderItemInput[]) => void;
  addOrder: (callback?: () => void) => void;
  onChangeProductBodyType: (type: string) => void;
  setOrderState: (name: string, value: any) => void;
  items: IOrderItemInput[];
  changeItemCount: (item: IOrderItemInput) => void;
  changeItemIsTake: (item: IOrderItemInput, value: boolean) => void;
  config: IConfig;
  editOrder: (callback?: () => void) => void;
  order: IOrder | null;
  type: string;
  productBodyType?: any;
  orderProps?: any;
  cancelOrder: (id: string) => void;
};

type State = {
  customerId: string;
  customerLabel: string;
  mode: string;
  cashAmount: number;
  companyName: string;
  registerNumber: string;
};

export default class Calculation extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { order } = this.props;
    const customerId = order ? order.customerId : '';
    const customerLabel = order ? generateLabel(order.customer) : '';

    const mode = localStorage.getItem('erxesPosMode') || '';

    this.state = {
      customerId: customerId || '',
      customerLabel,
      mode,
      cashAmount: 0,
      companyName: '',
      registerNumber: ''
    };
  }

  onChange = value => {
    this.props.setOrderState('type', value);
  };

  renderReceiptButton() {
    const { order } = this.props;
    const { mode } = this.state;

    if (!order) {
      return null;
    }

    if (mode === POS_MODES.KIOSK) {
      return null;
    }

    return (
      <Button
        icon="print"
        btnStyle="warning"
        block
        onClick={() => {
          window.open(`/order-receipt/${order._id}`, '_blank');
        }}
      >
        {__('Print receipt')}
      </Button>
    );
  }

  renderSplitPaymentButton() {
    const {
      order,
      addOrder,
      editOrder,
      onChangeProductBodyType,
      productBodyType,
      setItems,
      type,
      cancelOrder
    } = this.props;

    if (order && order.paidDate && order.status === ORDER_STATUSES.PAID) {
      return this.renderReceiptButton();
    }

    const onClick = () => {
      const callback = () => onChangeProductBodyType('payment');

      if (order && order._id) {
        editOrder(callback);
      } else {
        addOrder(callback);
      }
    };

    const paymentDone = () => {
      onChangeProductBodyType('done');
    };

    const onCancelOrder = () => {
      if (order) {
        cancelOrder(order._id);
      }

      setItems([]);
      onChangeProductBodyType('product');
    };

    if (productBodyType === 'payment') {
      return (
        <Types>
          <Button style={{ background: '#616E7C' }} onClick={onCancelOrder}>
            {__('Cancel order')}
          </Button>
          <Button btnStyle="success" onClick={paymentDone}>
            {__('Payment')}
          </Button>
        </Types>
      );
    }

    return (
      <Types>
        {type === 'eat' ? (
          <Button
            style={{ background: '#9ba3ab' }}
            onClick={() => this.onChange(ORDER_TYPES.TAKE)}
          >
            {__('Take')}
          </Button>
        ) : (
          <Button
            style={{ background: '#616E7C' }}
            onClick={() => this.onChange(ORDER_TYPES.EAT)}
          >
            {__('Take')}
          </Button>
        )}
        <Button btnStyle="success" onClick={onClick}>
          {__('Make an order')}
        </Button>
      </Types>
    );
  }

  renderHeader(mode) {
    if (mode === 'kiosk') {
      return <></>;
    }

    const { onChangeProductBodyType, config } = this.props;
    const { customerLabel } = this.state;

    const color = config.uiOptions && config.uiOptions.colors.primary;

    const trigger = (
      <ProductLabel
        onClick={() => onChangeProductBodyType('orderSearch')}
        color={color}
      >
        {customerLabel ? customerLabel : __('Identify a customer')}
      </ProductLabel>
    );

    const content = props => this.renderCustomerChooser(props);

    return (
      <>
        <ProductLabel
          onClick={() => onChangeProductBodyType('orderSearch')}
          color={color}
        >
          {__('Find orders')}
        </ProductLabel>

        {customerLabel ? (
          trigger
        ) : (
          <ModalTrigger
            title={__('Identify a customer')}
            trigger={trigger}
            hideHeader={true}
            size="sm"
            paddingContent="less-padding"
            content={content}
          />
        )}
      </>
    );
  }

  renderCustomerChooser(props) {
    const { setOrderState } = this.props;

    const onChangeQrcode = e => {
      const value = (e.currentTarget as HTMLInputElement).value || '';

      client
        .query({
          query: gql(queries.customerDetail),
          fetchPolicy: 'network-only',
          variables: {
            _id: value.trim()
          }
        })
        .then(async response => {
          const data = response.data.customerDetail;
          this.setState({
            customerLabel: generateLabel(data),
            customerId: data._id
          });
          setOrderState('customerId', data._id);
          props.closeModal();
        })
        .catch(error => props.closeModal());
    };

    const onClearChosenCustomer = () => {
      this.setState({ customerLabel: '', customerId: '' });
      setOrderState('customerId', '');
    };

    return (
      <>
        <ControlLabel>{__('Identify a customer')}</ControlLabel>
        <FormControl
          {...props}
          autoFocus={true}
          id="customerIdInput"
          name="customerId"
          value={this.state.customerLabel}
          onChange={onChangeQrcode}
          onClick={onClearChosenCustomer}
        />
      </>
    );
  }

  getRemainderAmount() {
    const { order } = this.props;

    return order
      ? order.totalAmount -
          ((order.cardAmount || 0) +
            (order.cashAmount || 0) +
            (order.mobileAmount || 0))
      : 0;
  }

  renderAmount(text: string, amount: number, color?: string) {
    const prop = { color };

    const { order, productBodyType, orderProps } = this.props;

    if ((order && order.paidDate) || productBodyType === 'payment') {
      return (
        <OrderInfo
          order={order}
          remainderAmount={orderProps ? orderProps.remainder : 0}
          companyName={orderProps ? orderProps.companyName : 0}
          registerNumber={orderProps ? orderProps.registerNumber : 0}
          color={prop.color}
        />
      );
    }

    return (
      <Amount {...prop}>
        <span>
          №: {order && order.number ? order.number.split('_')[1] : ''}
        </span>
        <span>{text}</span>
        {formatNumber(amount || 0)}₮
      </Amount>
    );
  }

  renderTotal(color) {
    const { totalAmount, orientation, items, productBodyType } = this.props;

    if (!items || items.length === 0) {
      return null;
    }

    const showPayment = productBodyType === 'payment';

    return (
      <ButtonWrapper
        className={orientation === 'portrait' ? 'payment-section' : ''}
        showPayment={showPayment}
      >
        {this.renderAmount(`${__('Total amount')}:`, totalAmount, color)}
        {this.renderSplitPaymentButton()}
      </ButtonWrapper>
    );
  }

  render() {
    const {
      config,
      items,
      changeItemCount,
      changeItemIsTake,
      orientation,
      type,
      productBodyType
    } = this.props;
    const { mode } = this.state;
    const color = config.uiOptions && config.uiOptions.colors.primary;

    return (
      <>
        <Wrapper color={color} showPayment={productBodyType === 'payment'}>
          <CalculationHeader>{this.renderHeader(mode)}</CalculationHeader>
          <Divider />
          <ColumnBetween>
            <Stage
              orientation={orientation}
              items={items}
              changeItemCount={changeItemCount}
              changeItemIsTake={changeItemIsTake}
              options={config.uiOptions}
              type={type}
              mode={mode}
            />
            {this.renderTotal(color)}
          </ColumnBetween>
        </Wrapper>
      </>
    );
  } // end render()
}
