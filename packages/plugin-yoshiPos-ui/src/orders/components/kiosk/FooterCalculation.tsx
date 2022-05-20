import Button from '../../..//common/components/Button';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { __ } from '../../..//common/utils';
import { FlexBetween } from '../../..//common/styles/main';
import { formatNumber } from '../../..//utils';
import { IConfig, IOption } from '../../../types';
import { ICustomer, IOrder, IOrderItemInput } from '../../..//orders/types';
import Stage from '../Stage';
import { FlexColumn } from './style';

const Wrapper = styledTS<{ color?: string }>(styled.div)`
  position: absolute;
  bottom: 5px;
  left: 0;
  right: 0;
  width: 100%;
  height: 300px;
  background: #F5F5F5;
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  max-width:100%;

  button {
    padding: 10px 20px;
    border-radius: 8px;
  }
`;

export const Amount = styled(FlexBetween)`
  margin-bottom: 20px;
  font-size: 22px;

  span {
    font-weight: 600;
  }
`;

const ButtonWrapper = styled.div`
  padding: 20px 40px;
  margin: 20px 0;
  width: 30%;
  min-width: 360px;
  border-left: 1px solid #ddd;

  button {
    margin-left: 0;
    margin-top: 10px;
    height: 60px;
    font-size: 20px;
  }
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
  setOrderState: (name: string, value: any) => void;
  onClickModal: (modalContentType: string) => void;
  items: IOrderItemInput[];
  changeItemCount: (item: IOrderItemInput) => void;
  changeItemIsTake: (item: IOrderItemInput, value: boolean) => void;
  config: IConfig;
  order: IOrder | null;
  type: string;
  onChangeProductBodyType: (type: string) => void;
  productBodyType?: string;
  cancelOrder: (id: string) => void;
};

type State = {
  customerId: string;
  customerLabel: string;
  stageHeight: number;
  mode: string;
};

export default class FooterCalculation extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { order } = this.props;
    const customerId = order ? order.customerId : '';
    const customerLabel = order ? generateLabel(order.customer) : '';

    let stageHeight = 100; // types title
    const mode = localStorage.getItem('erxesPosMode') || '';

    this.state = {
      customerId: customerId || '',
      customerLabel,
      stageHeight,
      mode
    };
  }

  onChange = value => {
    this.props.setOrderState('type', value);
  };

  renderPaymentButton() {
    const { order, config, onClickModal, cancelOrder, setItems } = this.props;

    if (order && order.paidDate) {
      return null;
    }

    const onClickPayment = () => {
      onClickModal('check');
    };

    const onCancelOrder = () => {
      if (order && order._id && !order.paidDate) {
        cancelOrder(order._id);
      } else {
        setItems([]);
      }
    };

    return (
      <>
        <Button onClick={onCancelOrder} btnStyle="simple" block>
          {__('Cancel order')}
        </Button>
        <Button
          style={{ backgroundColor: config.uiOptions.colors.primary }}
          onClick={onClickPayment}
          block
        >
          {__('Make an order')}
        </Button>
      </>
    );
  }

  renderAmount(text: string, amount: number) {
    return (
      <Amount>
        {text}
        <span>{formatNumber(amount || 0)}₮</span>
      </Amount>
    );
  }

  render() {
    const {
      totalAmount,
      config,
      items,
      changeItemCount,
      orientation,
      type,
      changeItemIsTake
    } = this.props;
    const { mode } = this.state;
    const color = config.uiOptions && config.uiOptions.colors.primary;

    return (
      <>
        <Wrapper color={color}>
          <FlexColumn color={color} orientation={orientation}>
            <Stage
              orientation={orientation}
              items={items}
              changeItemCount={changeItemCount}
              changeItemIsTake={changeItemIsTake}
              options={config.uiOptions}
              stageHeight={this.state.stageHeight}
              type={type}
              mode={mode}
            />
          </FlexColumn>
          <ButtonWrapper
            className={orientation === 'portrait' ? 'payment-section' : ''}
          >
            {this.renderAmount(`${__('Amount to pay')}:`, totalAmount)}
            {this.renderPaymentButton()}
          </ButtonWrapper>
        </Wrapper>
      </>
    );
  }
}
