import React from 'react';
import { IProduct, IOrderItemInput } from '../types';
import { Item, ItemWrapper } from '../styles';
import { formatNumber } from 'modules/utils';
import { AppContext } from 'appContext';
import { POS_MODES } from '../../../constants';

type Props = {
  product: IProduct;
  orientation: string;
  addItem: (item: IOrderItemInput) => void;
  activeProductId: string;
  isActive: boolean;
};

export default function ProductItem(props: Props) {
  const { currentConfig } = React.useContext(AppContext);
  const { product, addItem, orientation, isActive } = props;
  const { attachment, name, unitPrice } = product;

  const attachmentUrl = attachment && attachment.url ? attachment.url : '';
  const mode = localStorage.getItem('erxesPosMode');

  const color =
    currentConfig &&
    currentConfig.uiOptions &&
    currentConfig.uiOptions.colors &&
    currentConfig.uiOptions.colors.primary;

  const onClick = () => {
    addItem({
      productId: product._id,
      count: 1,
      productName: product.name,
      _id: Math.random().toString(),
      unitPrice: product.unitPrice,
      productImgUrl: attachmentUrl
    });
  };

  return (
    <ItemWrapper>
      <Item
        onClick={onClick}
        isPortrait={orientation === 'portrait'}
        isActive={isActive}
        isKiosk={mode === POS_MODES.KIOSK}
        color={color}
      >
        <div className="image-wrapper">
          <img
            src={attachmentUrl ? attachmentUrl : 'images/no-category.jpg'}
            alt={name}
          />
        </div>
        <div className={mode === 'kiosk' ? 'text-kiosk' : 'text-wrapper'}>
          <h4>{name}</h4>
          <span>{formatNumber(unitPrice || 0)}₮</span>
        </div>
      </Item>
    </ItemWrapper>
  );
}
