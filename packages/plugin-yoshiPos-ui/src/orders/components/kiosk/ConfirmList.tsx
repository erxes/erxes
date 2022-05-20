import React from 'react';
import { __ } from '../../..//common/utils';
import { IOrder } from '../../..//orders/types';
import { FormHead } from '../../..//orders/styles';
import { FlexCenter } from '../../..//common/styles/main';
import Button from '../../..//common/components/Button';
import { IConfig } from '../../../types';
import { ConfirmListWrapper } from './style';

type Props = {
  order: IOrder | null;
  items: any;
  isPortrait: boolean;
  config: IConfig;
  totalAmount: number;
  addOrder: (callback?: () => void) => void;
  editOrder: (callback?: () => void) => void;
  onClickModal: (modalContentType: string) => void;
};

export default class ConfirmList extends React.Component<Props> {
  onConfirm = () => {
    const { order, addOrder, editOrder, onClickModal } = this.props;

    if (order && order._id && !order.paidDate) {
      editOrder(() => onClickModal('payment'));
    } else {
      addOrder(() => onClickModal('payment'));
    }
  };

  renderItem(item) {
    const { unitPrice, count, productImgUrl, _id, productName } = item;

    return (
      <li key={_id}>
        <div className="image-wrapper">
          <img
            src={productImgUrl ? productImgUrl : 'images/no-category.jpg'}
            alt={productName}
          />
        </div>
        <div className="item">
          <h4>{productName}</h4>
          <div className="product-count">
            <b>{Number((unitPrice || 0).toFixed(1)).toLocaleString()}₮</b>
            <span>
              {__('Quantity')}: {count}
            </span>
          </div>
        </div>
      </li>
    );
  }

  render() {
    const {
      isPortrait,
      config,
      totalAmount,
      items = [],
      onClickModal
    } = this.props;
    const color = config.uiOptions.colors.primary;

    return (
      <ConfirmListWrapper color={color}>
        <FormHead isPortrait={isPortrait}>
          <ul>{items.map(i => this.renderItem(i))}</ul>
          <div className="total">
            <b>{__('Total')}</b>
            <b>{Number((totalAmount || 0).toFixed(1)).toLocaleString()}₮</b>
          </div>
        </FormHead>
        <FlexCenter>
          <Button
            btnStyle="simple"
            icon="cancel-1"
            block
            onClick={() => onClickModal('')}
          >
            {__('Cancel')}
          </Button>
          <Button
            style={{ backgroundColor: color }}
            icon="checked-1"
            block
            onClick={this.onConfirm}
          >
            {__('Confirm')}
          </Button>
        </FlexCenter>
      </ConfirmListWrapper>
    );
  }
}
